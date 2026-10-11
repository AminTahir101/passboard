import SwiftUI

@Observable
@MainActor
final class ProfileViewModel {
    var isSigningOut = false

    func signOut(appState: AppState) async {
        isSigningOut = true
        await appState.signOut()
        isSigningOut = false
    }
}
