import SwiftUI

struct ProfileView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = ProfileViewModel()

    var body: some View {
        Form {
            if let profile = appState.profile {
                Section(LocalizedStringKey("profile.account")) {
                    LabeledContent(LocalizedStringKey("common.fullName"), value: profile.fullName ?? "—")
                    LabeledContent(LocalizedStringKey("common.email"), value: profile.email)
                    if let phone = profile.phone {
                        LabeledContent(LocalizedStringKey("common.phone"), value: phone)
                    }
                    LabeledContent(LocalizedStringKey("common.targetExam"), value: profile.targetExam ?? "—")
                    LabeledContent(LocalizedStringKey("profile.access"),
                                   value: profile.accessStatus.rawValue.capitalized)
                }
            }

            Section(LocalizedStringKey("profile.language")) {
                Picker(LocalizedStringKey("profile.language"), selection: Binding(
                    get: { appState.language },
                    set: { appState.setLanguage($0) }
                )) {
                    Text("English").tag("en")
                    Text("العربية").tag("ar")
                }
                .pickerStyle(.segmented)
            }

            Section {
                Button(role: .destructive) {
                    Task { await viewModel.signOut(appState: appState) }
                } label: {
                    HStack {
                        Spacer()
                        Label(LocalizedStringKey("auth.signOut"), systemImage: "rectangle.portrait.and.arrow.right")
                        Spacer()
                    }
                }
                .disabled(viewModel.isSigningOut)
            }
        }
        .navigationTitle(LocalizedStringKey("nav.profile"))
    }
}
