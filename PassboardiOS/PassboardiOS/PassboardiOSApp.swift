import SwiftUI

@main
struct PassboardiOSApp: App {
    @State private var appState = AppState()

    init() {
        configureAppearance()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(appState)
                .preferredColorScheme(.dark)
        }
    }

    private func configureAppearance() {
        let navyBg = UIColor(red: 0.051, green: 0.106, blue: 0.180, alpha: 1.0)
        let amber = UIColor(red: 0.949, green: 0.714, blue: 0.196, alpha: 1.0)

        // Tab bar — navy background, amber selected state
        let tabBar = UITabBarAppearance()
        tabBar.configureWithOpaqueBackground()
        tabBar.backgroundColor = navyBg
        tabBar.stackedLayoutAppearance.selected.iconColor = amber
        tabBar.stackedLayoutAppearance.selected.titleTextAttributes = [.foregroundColor: amber]
        tabBar.stackedLayoutAppearance.normal.iconColor = UIColor.white.withAlphaComponent(0.5)
        tabBar.stackedLayoutAppearance.normal.titleTextAttributes = [.foregroundColor: UIColor.white.withAlphaComponent(0.5)]
        UITabBar.appearance().standardAppearance = tabBar
        UITabBar.appearance().scrollEdgeAppearance = tabBar

        // Navigation bar — navy background, amber tint
        let navBar = UINavigationBarAppearance()
        navBar.configureWithOpaqueBackground()
        navBar.backgroundColor = navyBg
        navBar.titleTextAttributes = [.foregroundColor: UIColor.white]
        navBar.largeTitleTextAttributes = [.foregroundColor: UIColor.white]
        UINavigationBar.appearance().standardAppearance = navBar
        UINavigationBar.appearance().scrollEdgeAppearance = navBar
        UINavigationBar.appearance().compactAppearance = navBar
        UINavigationBar.appearance().tintColor = amber
    }
}
