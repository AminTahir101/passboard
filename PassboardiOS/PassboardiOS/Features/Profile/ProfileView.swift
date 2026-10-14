import SwiftUI

struct ProfileView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        List {
            if let profile = appState.profile {
                Section {
                    LabeledContent(LocalizedStringKey("common.fullName"), value: profile.fullName ?? "—")
                    LabeledContent(LocalizedStringKey("common.email"), value: profile.email)
                    if let exam = profile.targetExam {
                        LabeledContent(LocalizedStringKey("common.targetExam"), value: exam)
                    }
                }
            }
            Section {
                Button(LocalizedStringKey("auth.signOut"), role: .destructive) {
                    Task { try? await AuthService().signOut() }
                }
            }
        }
        .navigationTitle(LocalizedStringKey("nav.profile"))
    }
}
