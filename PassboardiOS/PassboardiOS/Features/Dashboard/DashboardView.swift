import SwiftUI

struct DashboardView: View {
    @Binding var selectedTab: AppTab
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
                                 subtitle: localizedString("dashboard.days"),
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
                        ForEach(AppTab.allCases.filter { $0 != .dashboard }) { tab in
                            QuickActionCard(tab: tab) {
                                selectedTab = tab
                            }
                        }
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
    let tab: AppTab
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            CardView {
                VStack(spacing: 10) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .fill(tab.color.opacity(0.15))
                            .frame(width: 48, height: 48)
                        Image(systemName: tab.icon)
                            .font(.system(size: 22, weight: .semibold))
                            .foregroundStyle(tab.color)
                    }
                    Text(tab.titleKey)
                        .font(.callout.bold())
                        .multilineTextAlignment(.center)
                        .foregroundStyle(.primary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 4)
            }
        }
        .buttonStyle(.plain)
    }
}

// Helper
private func localizedString(_ key: String) -> String {
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
