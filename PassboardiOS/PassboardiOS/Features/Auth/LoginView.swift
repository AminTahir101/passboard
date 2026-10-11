import SwiftUI
import AuthenticationServices

struct LoginView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = LoginViewModel()
    @Environment(\.layoutDirection) private var layoutDirection

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 32) {
                    // Logo / Brand
                    VStack(spacing: 8) {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 60))
                            .foregroundStyle(Color.accentColor)
                        Text("Passboard")
                            .font(.largeTitle.bold())
                        Text(LocalizedStringKey("login.subtitle"))
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.top, 48)

                    // Form
                    VStack(spacing: 16) {
                        TextField(LocalizedStringKey("login.email"), text: $viewModel.email)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                            .textContentType(.emailAddress)
                            .padding()
                            .background(.regularMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: 12))

                        SecureField(LocalizedStringKey("login.password"), text: $viewModel.password)
                            .textContentType(.password)
                            .padding()
                            .background(.regularMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: 12))

                        if let error = viewModel.error {
                            Text(error)
                                .font(.caption)
                                .foregroundStyle(.red)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }

                        Button {
                            Task { await viewModel.login() }
                        } label: {
                            Group {
                                if viewModel.isLoading {
                                    ProgressView()
                                        .tint(.white)
                                } else {
                                    Text(LocalizedStringKey("login.signIn"))
                                        .fontWeight(.semibold)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                        }
                        .buttonStyle(.borderedProminent)
                        .disabled(viewModel.isLoading)

                        // Divider
                        HStack {
                            Rectangle().frame(height: 1).foregroundStyle(.secondary.opacity(0.3))
                            Text(LocalizedStringKey("login.or"))
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Rectangle().frame(height: 1).foregroundStyle(.secondary.opacity(0.3))
                        }

                        SignInWithAppleButton(.signIn) { request in
                            request.requestedScopes = [.fullName, .email]
                        } onCompletion: { result in
                            handleAppleSignIn(result)
                        }
                        .signInWithAppleButtonStyle(.black)
                        .frame(height: 50)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .padding(.horizontal, 24)

                    Button(LocalizedStringKey("login.requestAccess")) {
                        viewModel.showAccessRequest = true
                    }
                    .font(.footnote)
                }
            }
            .frame(maxWidth: 480)
            .frame(maxWidth: .infinity)
            .navigationBarHidden(true)
        }
        .sheet(isPresented: $viewModel.showAccessRequest) {
            AccessRequestView()
        }
        .environment(\.layoutDirection, appState.isRTL ? .rightToLeft : .leftToRight)
    }

    private func handleAppleSignIn(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let auth):
            guard
                let credential = auth.credential as? ASAuthorizationAppleIDCredential,
                let tokenData = credential.identityToken,
                let idToken = String(data: tokenData, encoding: .utf8)
            else { return }
            let nonce = "" // In production, generate a cryptographic nonce
            Task {
                viewModel.isLoading = true
                do {
                    try await AuthService().signInWithApple(idToken: idToken, nonce: nonce)
                } catch {
                    viewModel.error = error.localizedDescription
                }
                viewModel.isLoading = false
            }
        case .failure(let error):
            viewModel.error = error.localizedDescription
        }
    }
}
