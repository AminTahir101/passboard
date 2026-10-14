import SwiftUI

@Observable
@MainActor
final class DashboardViewModel {
    var stats: UserStats? = nil
    var todaysTasks: [StudyTask] = []
    var isLoading = false
    var error: String? = nil

    private let profileService: ProfileServiceProtocol

    init(profileService: ProfileServiceProtocol = ProfileService()) {
        self.profileService = profileService
    }

    func load(userId: String, planId: String?) async {
        isLoading = true
        defer { isLoading = false }
        do {
            async let statsTask = profileService.fetchStats(userId: userId)
            async let todaysTask: [StudyTask] = planId != nil
                ? profileService.fetchTodaysTasks(planId: planId!)
                : []
            stats = try await statsTask
            todaysTasks = try await todaysTask
        } catch {
            self.error = error.localizedDescription
        }
    }
}
