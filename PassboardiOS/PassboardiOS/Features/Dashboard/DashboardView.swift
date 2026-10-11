import SwiftUI

struct DashboardView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = DashboardViewModel()
    @State private var showProfile = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(LocalizedStringKey("dashboard.greeting"))
                            .font(.subheadline)
                            .foregroundStyle(Color.mutedForeground)
                        if let name = appState.profile?.fullName {
                            Text(name)
                                .font(.system(size: 26, weight: .bold))
                                .foregroundStyle(.white)
                        }
                    }
                    Spacer()
                    Button { showProfile = true } label: {
                        AvatarCircle(name: appState.profile?.fullName)
                    }
                    .buttonStyle(PressButtonStyle())
                }
                .padding(.horizontal, 20)
                .padding(.top, 8)

                // Accuracy hero card
                if let stats = viewModel.stats {
                    AccuracyCard(stats: stats)
                        .padding(.horizontal, 20)
                } else if viewModel.isLoading {
                    RoundedRectangle(cornerRadius: 20)
                        .fill(Color.cardSurface)
                        .frame(height: 180)
                        .overlay(ProgressView().tint(Color.brand))
                        .padding(.horizontal, 20)
                }

                // 3-col mini stats
                if let stats = viewModel.stats {
                    HStack(spacing: 12) {
                        MiniStatTile(value: "\(stats.totalAttempts)", label: LocalizedStringKey("dashboard.attempted"))
                        MiniStatTile(value: "\(Int(stats.accuracy * 100))%", label: LocalizedStringKey("dashboard.accuracy"))
                        MiniStatTile(value: "\(stats.streak)", label: LocalizedStringKey("dashboard.streak"))
                    }
                    .padding(.horizontal, 20)
                }

                // Quick actions
                VStack(alignment: .leading, spacing: 12) {
                    Text(LocalizedStringKey("dashboard.quickActions"))
                        .font(.headline)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 20)

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        QuickActionCard(titleKey: "nav.mockExam",   subtitleKey: "dashboard.qa.mockExamDesc",  icon: "clock.fill")
                        QuickActionCard(titleKey: "nav.practice",   subtitleKey: "dashboard.qa.practiceDesc",  icon: "doc.text.fill")
                        QuickActionCard(titleKey: "nav.aiChat",     subtitleKey: "dashboard.qa.aiChatDesc",    icon: "bubble.left.and.bubble.right.fill")
                        QuickActionCard(titleKey: "nav.studyPlan",  subtitleKey: "dashboard.qa.studyPlanDesc", icon: "calendar")
                    }
                    .padding(.horizontal, 20)
                }

                // Today's Tasks
                if !viewModel.todaysTasks.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        Text(LocalizedStringKey("dashboard.todaysTasks"))
                            .font(.headline)
                            .foregroundStyle(.white)
                            .padding(.horizontal, 20)
                        ForEach(viewModel.todaysTasks) { task in
                            TodayTaskRow(task: task)
                                .padding(.horizontal, 20)
                        }
                    }
                }

                Spacer().frame(height: 20)
            }
        }
        .background(Color.appBackground.ignoresSafeArea())
        .navigationBarHidden(true)
        .navigationDestination(isPresented: $showProfile) { ProfileView() }
        .overlay { LoadingOverlay(isLoading: viewModel.isLoading && viewModel.stats == nil) }
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

// MARK: - Avatar Circle
private struct AvatarCircle: View {
    let name: String?
    private var initials: String {
        guard let name else { return "?" }
        let parts = name.split(separator: " ")
        let first = parts.first?.prefix(1) ?? ""
        let last = parts.dropFirst().first?.prefix(1) ?? ""
        return "\(first)\(last)".uppercased()
    }
    var body: some View {
        ZStack {
            Circle()
                .fill(Color.cardSurface)
                .frame(width: 42, height: 42)
            Circle()
                .strokeBorder(Color.brand, lineWidth: 2)
                .frame(width: 42, height: 42)
            Text(initials)
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(Color.brand)
        }
    }
}

// MARK: - Accuracy Card
private struct AccuracyCard: View {
    let stats: UserStats
    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 18) {
                // Ring
                ZStack {
                    ProgressRing(progress: stats.accuracy, lineWidth: 9, color: Color.brand)
                    Text("\(Int(stats.accuracy * 100))%")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundStyle(.white)
                }
                .frame(width: 80, height: 80)

                // Text
                VStack(alignment: .leading, spacing: 4) {
                    Text(LocalizedStringKey("dashboard.yourAccuracy"))
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.brand)
                        .textCase(.uppercase)
                        .tracking(0.5)
                    Text("\(stats.correctAttempts) of \(stats.totalAttempts) correct")
                        .font(.system(size: 17, weight: .bold))
                        .foregroundStyle(.white)
                    Text(LocalizedStringKey("dashboard.accuracyHint"))
                        .font(.caption)
                        .foregroundStyle(Color.mutedForeground)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer()
            }
            .padding(20)

            Divider().background(Color.cardBorder)

            NavigationLink {
                PracticeSetupView()
            } label: {
                HStack {
                    Text(LocalizedStringKey("dashboard.continuePracticing"))
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    Spacer()
                    Image(systemName: "arrow.right")
                        .font(.subheadline.weight(.semibold))
                }
                .foregroundStyle(Color.black)
                .padding(.horizontal, 20)
                .padding(.vertical, 14)
                .background(Color.brand)
            }
        }
        .background(Color.cardSurface)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .strokeBorder(Color.cardBorder, lineWidth: 1)
        )
    }
}

// MARK: - Mini Stat Tile
private struct MiniStatTile: View {
    let value: String
    let label: LocalizedStringKey
    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(.white)
            Text(label)
                .font(.caption)
                .foregroundStyle(Color.mutedForeground)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(Color.cardSurface)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .strokeBorder(Color.cardBorder, lineWidth: 1)
        )
    }
}

// MARK: - Quick Action Card
private struct QuickActionCard: View {
    let titleKey: LocalizedStringKey
    let subtitleKey: LocalizedStringKey
    let icon: String
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            IconBox(systemName: icon)
            Text(titleKey)
                .font(.subheadline)
                .fontWeight(.bold)
                .foregroundStyle(.white)
            Text(subtitleKey)
                .font(.caption)
                .foregroundStyle(Color.mutedForeground)
                .lineLimit(2)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Color.cardSurface)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .strokeBorder(Color.cardBorder, lineWidth: 1)
        )
    }
}

// MARK: - Today Task Row
private struct TodayTaskRow: View {
    let task: StudyTask
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(task.taskType.rawValue.capitalized)
                    .font(.subheadline.bold())
                    .foregroundStyle(.white)
                Text(task.specialty ?? "General")
                    .font(.caption)
                    .foregroundStyle(Color.mutedForeground)
                Text("\(task.questionCount) questions")
                    .font(.caption)
                    .foregroundStyle(Color.mutedForeground)
            }
            Spacer()
            if task.completed {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(.green)
            } else {
                NavigationLink(LocalizedStringKey("common.start")) {
                    PracticeSetupView(planTaskId: task.id, presetCount: task.questionCount,
                                     presetCategory: task.specialty)
                }
                .buttonStyle(.borderedProminent)
                .tint(Color.brand)
                .controlSize(.small)
            }
        }
        .padding(14)
        .background(Color.cardSurface)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .strokeBorder(Color.cardBorder, lineWidth: 1)
        )
    }
}

// MARK: - Helpers
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
