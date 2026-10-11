import SwiftUI
import Supabase

@Observable
final class AppState {
    var session: Session? = nil
    var profile: Profile? = nil
    var language: String
    var isLoadingAuth: Bool = true

    var isAuthenticated: Bool { session != nil }
    var isAccessActive: Bool { profile?.accessStatus == .active }
    var isRTL: Bool { language == "ar" }

    init() {
        self.language = UserDefaults.standard.string(forKey: "app_language") ?? "en"
        Task { await startAuthListener() }
    }

    func setLanguage(_ lang: String) {
        language = lang
        UserDefaults.standard.set(lang, forKey: "app_language")
    }

    func signOut() async {
        try? await supabase.auth.signOut()
        // authStateChanges listener will clear session and profile
    }

    @MainActor
    func loadProfile(userId: String) async {
        do {
            let profiles: [Profile] = try await supabase
                .from("profiles")
                .select()
                .eq("id", value: userId)
                .limit(1)
                .execute()
                .value
            self.profile = profiles.first
        } catch {
            print("Failed to load profile: \(error)")
        }
    }

    @MainActor
    private func startAuthListener() async {
        isLoadingAuth = true
        // Restore existing session on launch
        session = try? await supabase.auth.session
        if let userId = session?.user.id.uuidString {
            await loadProfile(userId: userId)
        }
        isLoadingAuth = false

        // Listen for future auth changes
        for await (event, newSession) in supabase.auth.authStateChanges {
            switch event {
            case .signedIn, .tokenRefreshed, .userUpdated:
                session = newSession
                if let userId = newSession?.user.id.uuidString {
                    await loadProfile(userId: userId)
                }
            case .signedOut, .userDeleted:
                session = nil
                profile = nil
            default:
                break
            }
        }
    }
}
