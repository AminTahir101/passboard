import SwiftUI

struct DashboardView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = DashboardViewModel()

    private var daysToExam: Int? {
        let dateStr = appState.profile?.examDate
        guard let str = dateStr,
              let date = ISO8601DateFormatter.date(from: str) ?? DateFormatter.yyyyMMdd.date(from: str)
        else { return nil }
        return Calendar.current.dateComponents([.day], from: .now, to: date).day
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Greeting
                VStack(alignment: .leading, spacing: 4) {
                    Text(LocalizedStringKey("dashboard.greeting"))
                        .font(.title2.bold())
                    if let name = appState.profile?.fullName {
                        Text(name).font(.title.bold())
                    }
                }
                .padding(.horizontal)

                // Stats Grid
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    if let days = daysToExam {
                        StatCard(title: "dashboard.daysToExam", value: "\(days)",
                                 subtitle: appState.profile?.targetExam,
                                 icon: "calendar.badge.clock", color: .orange)
                    }
                    if let stats = viewModel.stats {
                        StatCard(title: "dashboard.accuracy", value: "\(Int(stats.accuracy * 100))%",
                                 icon: "target", color: .green)
                        StatCard(title: "dashboard.questionsAttempted",
                                 value: "\(stats.totalAttempts)",
                                 icon: "doc.text.fill", color: .blue)
                        StatCard(title: "dashboard.streak", value: "\(stats.streak)",
                                 subtitle: LocalizedString("dashboard.days"),
                                 icon: "flame.fill", color: .red)
                    }
                }
                .padding(.horizontal)

                // Today's Tasks
                if !viewModel.todaysTasks.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text(LocalizedStringKey("dashboard.todaysTasks"))
                            .font(.headline)
                            .padding(.horizontal)
                        ForEach(viewModel.todaysTasks) { task in
                            TodayTaskRow(task: task)
                                .padding(.horizontal)
                        }
                    }
                }

                // Quick Actions
                VStack(alignment: .leading, spacing: 12) {
                    Text(LocalizedStringKey("dashboard.quickActions"))
                        .font(.headline)
                        .padding(.horizontal)
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        QuickActionCard(titleKey: "nav.practice", icon: "doc.text", color: .blue)
                        QuickActionCard(titleKey: "nav.mockExam", icon: "clock", color: .purple)
                        QuickActionCard(titleKey: "nav.studyPlan", icon: "calendar", color: .green)
                        QuickActionCard(titleKey: "nav.aiChat", icon: "bubble.left.and.bubble.right", color: .orange)
                    }
                    .padding(.horizontal)
                }
            }
            .padding(.vertical)
        }
        .navigationTitle(LocalizedStringKey("nav.dashboard"))
        .overlay { LoadingOverlay(isLoading: viewModel.isLoading) }
        .task {
            guard let userId = appState.session?.user.id.uuidString else { return }
            await viewModel.load(userId: userId, planId: appState.profile?.id)
        }
        .refreshable {
            guard let userId = appState.session?.user.id.uuidString else { return }
            await viewModel.load(userId: userId, planId: appState.profile?.id)
        }
    }
}

private struct TodayTaskRow: View {
    let task: StudyTask
    var body: some View {
        CardView {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(task.taskType.rawValue.capitalized).font(.headline)
                    Text(task.specialty ?? "General").font(.caption).foregroundStyle(.secondary)
                    Text("\(task.questionCount) questions").font(.caption).foregroundStyle(.secondary)
                }
                Spacer()
                if task.completed {
                    Image(systemName: "checkmark.circle.fill").foregroundStyle(.green)
                } else {
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

private struct QuickActionCard: View {
    let titleKey: LocalizedStringKey
    let icon: String
    let color: Color
    var body: some View {
        CardView {
            VStack(spacing: 8) {
                Image(systemName: icon).font(.title).foregroundStyle(color)
                Text(titleKey).font(.callout.bold())
            }
            .frame(maxWidth: .infinity)
        }
    }
}

// Helper
private func LocalizedString(_ key: String) -> String {
    NSLocalizedString(key, comment: "")
}

extension DateFormatter {
    static let yyyyMMdd: DateFormatter = {
        let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"; return f
    }()
}

extension ISO8601DateFormatter {
    static func date(from string: String) -> Date? {
        let f = ISO8601DateFormatter(); return f.date(from: string)
    }
}
