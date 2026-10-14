import Testing
@testable import PassboardiOS

final class MockProfileService: ProfileServiceProtocol {
    var statsToReturn = UserStats(totalAttempts: 100, correctAttempts: 75, accuracy: 0.75, streak: 5)
    var tasksToReturn: [StudyTask] = []

    func fetchProfile(userId: String) async throws -> Profile {
        throw AppError.notFound
    }
    func fetchStats(userId: String) async throws -> UserStats { statsToReturn }
    func fetchTodaysTasks(planId: String) async throws -> [StudyTask] { tasksToReturn }
}

@MainActor
struct DashboardViewModelTests {
    @Test func loadsStats() async throws {
        let service = MockProfileService()
        let vm = DashboardViewModel(profileService: service)
        await vm.load(userId: "test-id", planId: nil)
        #expect(vm.stats?.totalAttempts == 100)
        #expect(vm.stats?.accuracy == 0.75)
    }

    @Test func loadsTodaysTasks() async throws {
        let service = MockProfileService()
        let vm = DashboardViewModel(profileService: service)
        await vm.load(userId: "test-id", planId: "plan-1")
        #expect(vm.todaysTasks.isEmpty)
    }
}
