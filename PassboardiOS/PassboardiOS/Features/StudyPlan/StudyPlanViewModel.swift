import SwiftUI

@Observable
@MainActor
final class StudyPlanViewModel {
    var plan: StudyPlan? = nil
    var tasks: [StudyTask] = []
    var isLoading = false
    var hasNoPlan = false
    var error: String? = nil

    private let service: StudyPlanServiceProtocol

    init(service: StudyPlanServiceProtocol = StudyPlanService()) {
        self.service = service
    }

    var todaysTasks: [StudyTask] {
        let today = DateFormatter.yyyyMMdd.string(from: Date())
        return tasks.filter { $0.scheduledDate == today }
    }

    var missedTasks: [StudyTask] {
        let today = DateFormatter.yyyyMMdd.string(from: Date())
        return tasks.filter { !$0.completed && $0.scheduledDate < today }
    }

    var progress: Double {
        let total = tasks.count
        let done = tasks.filter(\.completed).count
        return total > 0 ? Double(done) / Double(total) : 0
    }

    var daysToExam: Int? {
        guard let dateStr = plan?.examDate,
              let date = DateFormatter.yyyyMMdd.date(from: dateStr)
        else { return nil }
        return Calendar.current.dateComponents([.day], from: .now, to: date).day
    }

    var currentPhase: PlanPhase? {
        todaysTasks.first?.phase ?? tasks.last(where: { !$0.completed })?.phase
    }

    // Group tasks by ISO week key "YYYY-Www"
    var tasksByWeek: [(key: String, tasks: [StudyTask])] {
        var dict: [String: [StudyTask]] = [:]
        for task in tasks {
            let key = isoWeekKey(task.scheduledDate)
            dict[key, default: []].append(task)
        }
        return dict.sorted { $0.key < $1.key }.map { (key: $0.key, tasks: $0.value) }
    }

    private func isoWeekKey(_ dateString: String) -> String {
        guard let date = DateFormatter.yyyyMMdd.date(from: dateString) else { return dateString }
        let cal = Calendar(identifier: .iso8601)
        let week = cal.component(.weekOfYear, from: date)
        let year = cal.component(.yearForWeekOfYear, from: date)
        return String(format: "%04d-W%02d", year, week)
    }

    func load(userId: String) async {
        isLoading = true; defer { isLoading = false }
        do {
            guard let plan = try await service.fetchPlan(userId: userId) else {
                hasNoPlan = true; return
            }
            self.plan = plan
            tasks = try await service.fetchTasks(planId: plan.id)
        } catch { self.error = error.localizedDescription }
    }

    func toggleTask(_ taskId: String) async {
        guard let idx = tasks.firstIndex(where: { $0.id == taskId }) else { return }
        tasks[idx].completed.toggle()
        if tasks[idx].completed {
            try? await service.completeTask(id: taskId)
        }
    }
}
