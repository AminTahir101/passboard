import SwiftUI

@Observable
@MainActor
final class LoginViewModel {
    var email = ""
    var password = ""
    var isLoading = false
    var error: String? = nil
    var showAccessRequest = false

    private let authService: AuthServiceProtocol

    init(authService: AuthServiceProtocol = AuthService()) {
        self.authService = authService
    }

    func login() async {
        guard !email.isEmpty, !password.isEmpty else {
            error = "Please enter email and password."
            return
        }
        isLoading = true
        error = nil
        do {
            try await authService.signIn(email: email, password: password)
            // AppState listens to authStateChanges — no manual update needed
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}
