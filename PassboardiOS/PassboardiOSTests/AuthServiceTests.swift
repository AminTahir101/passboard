import Testing
import Foundation
@testable import PassboardiOS

// Mock implementation for testing
final class MockAuthService: AuthServiceProtocol {
    var signInCalled = false
    var signOutCalled = false
    var shouldThrow = false

    func signIn(email: String, password: String) async throws {
        if shouldThrow { throw URLError(.badServerResponse) }
        signInCalled = true
    }
    func signInWithApple(idToken: String, nonce: String) async throws {
        if shouldThrow { throw URLError(.badServerResponse) }
    }
    func signOut() async throws { signOutCalled = true }
    func submitAccessRequest(_ request: AccessRequestInput) async throws {}
}

struct AuthServiceTests {
    @Test func mockSignInSetsFlag() async throws {
        let service = MockAuthService()
        try await service.signIn(email: "test@example.com", password: "pass")
        #expect(service.signInCalled == true)
    }

    @Test func mockSignInThrowsWhenConfigured() async throws {
        let service = MockAuthService()
        service.shouldThrow = true
        await #expect(throws: URLError.self) {
            try await service.signIn(email: "a@b.com", password: "pw")
        }
    }
}
