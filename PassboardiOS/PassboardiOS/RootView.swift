import SwiftUI

struct RootView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.horizontalSizeClass) private var sizeClass

    var body: some View {
        Group {
            if appState.isLoadingAuth {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if !appState.isAuthenticated {
                LoginView()
            } else if !appState.isAccessActive {
                AccessDeniedView()
            } else if sizeClass == .regular {
                iPadRootView()
            } else {
                iPhoneRootView()
            }
        }
        .environment(\.layoutDirection, appState.isRTL ? .rightToLeft : .leftToRight)
    }
}

// MARK: - iPad: NavigationSplitView
private struct iPadRootView: View {
    @State private var selectedTab: AppTab = .dashboard

    var body: some View {
        NavigationSplitView {
            SidebarView(selection: $selectedTab)
        } detail: {
            tabContent(for: selectedTab)
        }
    }
}

// MARK: - iPhone: TabView (aiChat excluded — accessed from Dashboard)
private struct iPhoneRootView: View {
    @State private var selectedTab: AppTab = .dashboard
    private let phoneTabs: [AppTab] = [.dashboard, .practice, .mockExam, .studyPlan, .profile]

    var body: some View {
        TabView(selection: $selectedTab) {
            ForEach(phoneTabs) { tab in
                NavigationStack {
                    tabContent(for: tab)
                }
                .tabItem {
                    Label(tab.titleKey, systemImage: tab.icon)
                }
                .tag(tab)
            }
        }
    }
}

// MARK: - Shared tab content
@ViewBuilder
private func tabContent(for tab: AppTab) -> some View {
    switch tab {
    case .dashboard: DashboardView()
    case .practice: PracticeSetupView()
    case .mockExam: MockExamSetupView()
    case .studyPlan: StudyPlanView()
    case .aiChat: AIChatListView()
    case .profile: ProfileView()
    }
}

// MARK: - Access denied
private struct AccessDeniedView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "lock.circle")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)
            Text(LocalizedStringKey("auth.accessDenied"))
                .font(.title2.bold())
            Text(LocalizedStringKey("auth.accessDeniedMessage"))
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button(LocalizedStringKey("auth.signOut")) {
                Task { await appState.signOut() }
            }
            .buttonStyle(.bordered)
        }
        .padding()
    }
}
