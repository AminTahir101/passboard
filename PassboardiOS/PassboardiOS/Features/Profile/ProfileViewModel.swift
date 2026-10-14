import SwiftUI

@Observable
@MainActor
final class ProfileViewModel {
    var isSigningOut = false

    func signOut(appState: AppState) async {
        isSigningOut = true
        try? await AuthService().signOut()
        isSigningOut = false
    }
}
