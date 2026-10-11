import SwiftUI

struct StudyPlanView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = StudyPlanViewModel()
    @State private var expandedWeek: String? = nil

    var body: some View {
        Group {
            if viewModel.hasNoPlan {
                noPlaceholder
            } else {
                planContent
            }
        }
        .navigationTitle(LocalizedStringKey("nav.studyPlan"))
        .overlay { LoadingOverlay(isLoading: viewModel.isLoading) }
        .task {
            guard let uid = appState.session?.user.id.uuidString else { return }
            await viewModel.load(userId: uid)
            // Expand current week by default
            let today = DateFormatter.yyyyMMdd.string(from: Date())
            expandedWeek = viewModel.tasksByWeek.first(where: {
                $0.tasks.contains(where: { $0.scheduledDate == today })
            })?.key
        }
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                NavigationLink(LocalizedStringKey("studyPlan.edit")) { StudyPlanSetupView() }
            }
        }
    }

    private var noPlaceholder: some View {
        VStack(spacing: 16) {
            Image(systemName: "calendar.badge.plus")
                .font(.system(size: 60)).foregroundStyle(.secondary)
            Text(LocalizedStringKey("studyPlan.noPlan")).font(.title2.bold())
            NavigationLink(LocalizedStringKey("studyPlan.createPlan")) { StudyPlanSetupView() }
                .buttonStyle(.borderedProminent)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var planContent: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Stats row
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    if let days = viewModel.daysToExam {
                        StatCard(title: "dashboard.daysToExam", value: "\(days)",
                                 icon: "calendar.badge.clock", color: .orange)
                    }
                    StatCard(title: "studyPlan.progress",
                             value: "\(Int(viewModel.progress * 100))%",
                             icon: "chart.line.uptrend.xyaxis", color: .green)
                    if !viewModel.missedTasks.isEmpty {
                        StatCard(title: "studyPlan.missed",
                                 value: "\(viewModel.missedTasks.count)",
                                 icon: "exclamationmark.triangle", color: .red)
                    }
                    if let phase = viewModel.currentPhase {
                        StatCard(title: "studyPlan.phase",
                                 value: phaseLabel(phase),
                                 icon: "flag", color: phaseColor(phase))
                    }
                }
                .padding(.horizontal)

                // Today's tasks
                if !viewModel.todaysTasks.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(LocalizedStringKey("studyPlan.today")).font(.headline).padding(.horizontal)
                        ForEach(viewModel.todaysTasks) { task in
                            StudyTaskRow(task: task, onToggle: {
                                Task { await viewModel.toggleTask(task.id) }
                            })
                            .padding(.horizontal)
                        }
                    }
                }

                // Week accordion
                VStack(alignment: .leading, spacing: 8) {
                    Text(LocalizedStringKey("studyPlan.calendar")).font(.headline).padding(.horizontal)
                    ForEach(viewModel.tasksByWeek, id: \.key) { week in
                        WeekAccordion(
                            weekKey: week.key,
                            tasks: week.tasks,
                            isExpanded: expandedWeek == week.key,
                            onToggle: { expandedWeek = expandedWeek == week.key ? nil : week.key },
                            onTaskToggle: { id in Task { await viewModel.toggleTask(id) } }
                        )
                        .padding(.horizontal)
                    }
                }
            }
            .padding(.vertical)
        }
    }

    private func phaseLabel(_ phase: PlanPhase) -> String {
        switch phase {
        case .foundation: return NSLocalizedString("studyPlan.phase.foundation", comment: "")
        case .reinforcement: return NSLocalizedString("studyPlan.phase.reinforcement", comment: "")
        case .final_review: return NSLocalizedString("studyPlan.phase.finalReview", comment: "")
        }
    }

    private func phaseColor(_ phase: PlanPhase) -> Color {
        switch phase { case .foundation: return .blue; case .reinforcement: return .orange; case .final_review: return .red }
    }
}

private struct StudyTaskRow: View {
    let task: StudyTask
    let onToggle: () -> Void
    var body: some View {
        CardView {
            HStack {
                Button(action: onToggle) {
                    Image(systemName: task.completed ? "checkmark.circle.fill" : "circle")
                        .foregroundStyle(task.completed ? .green : .secondary)
                        .font(.title3)
                }
                .buttonStyle(.plain)
                VStack(alignment: .leading, spacing: 2) {
                    Text(task.taskType.rawValue.capitalized).font(.headline)
                    Text(task.specialty ?? "General").font(.caption).foregroundStyle(.secondary)
                    Text("\(task.questionCount) questions").font(.caption).foregroundStyle(.secondary)
                }
                Spacer()
                if !task.completed {
                    NavigationLink(LocalizedStringKey("common.start")) {
                        PracticeSetupView(planTaskId: task.id, presetCount: task.questionCount,
                                         presetCategory: task.specialty)
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
                }
            }
        }
    }
}

private struct WeekAccordion: View {
    let weekKey: String
    let tasks: [StudyTask]
    let isExpanded: Bool
    let onToggle: () -> Void
    let onTaskToggle: (String) -> Void

    var body: some View {
        VStack(spacing: 0) {
            Button(action: onToggle) {
                HStack {
                    Text(weekLabel).font(.subheadline.bold())
                    Spacer()
                    Text("\(tasks.filter(\.completed).count)/\(tasks.count)")
                        .font(.caption).foregroundStyle(.secondary)
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .foregroundStyle(.secondary)
                }
                .padding()
                .background(.regularMaterial)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .buttonStyle(.plain)

            if isExpanded {
                VStack(spacing: 8) {
                    ForEach(tasks) { task in
                        StudyTaskRow(task: task) { onTaskToggle(task.id) }
                    }
                }
                .padding(.top, 8)
            }
        }
    }

    private var weekLabel: String {
        guard let firstDate = tasks.first.flatMap({ DateFormatter.yyyyMMdd.date(from: $0.scheduledDate) }),
              let lastDate = tasks.last.flatMap({ DateFormatter.yyyyMMdd.date(from: $0.scheduledDate) })
        else { return weekKey }
        let fmt = DateFormatter(); fmt.dateFormat = "MMM d"
        return "\(weekKey) · \(fmt.string(from: firstDate)) – \(fmt.string(from: lastDate))"
    }
}
