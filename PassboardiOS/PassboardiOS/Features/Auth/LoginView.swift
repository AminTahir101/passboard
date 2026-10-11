import SwiftUI
import AuthenticationServices
import CryptoKit

struct LoginView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = LoginViewModel()
    @State private var currentNonce: String = ""

    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 36) {
                        // Brand mark
                        VStack(spacing: 14) {
                            PassboardBrandMark()
                            VStack(spacing: 6) {
                                Text("Passboard")
                                    .font(.system(size: 32, weight: .bold, design: .rounded))
                                    .foregroundStyle(.white)
                                Text(LocalizedStringKey("login.subtitle"))
                                    .font(.subheadline)
                                    .foregroundStyle(.white.opacity(0.55))
                                    .multilineTextAlignment(.center)
                            }
                        }
                        .padding(.top, 60)

                        // Form
                        VStack(spacing: 12) {
                            TextField(LocalizedStringKey("login.email"), text: $viewModel.email)
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                                .textContentType(.emailAddress)
                                .padding()
                                .background(Color.white.opacity(0.08))
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                                .foregroundStyle(.white)

                            SecureField(LocalizedStringKey("login.password"), text: $viewModel.password)
                                .textContentType(.password)
                                .padding()
                                .background(Color.white.opacity(0.08))
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                                .foregroundStyle(.white)

                            if let error = viewModel.error {
                                Text(error)
                                    .font(.caption)
                                    .foregroundStyle(.red)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(.horizontal, 4)
                            }

                            Button {
                                Task { await viewModel.login() }
                            } label: {
                                if viewModel.isLoading {
                                    ProgressView().tint(.black)
                                } else {
                                    Text(LocalizedStringKey("login.signIn"))
                                }
                            }
                            .buttonStyle(BrandButtonStyle())
                            .disabled(viewModel.isLoading)

                            HStack {
                                Rectangle().frame(height: 1)
                                    .foregroundStyle(Color.white.opacity(0.15))
                                Text(LocalizedStringKey("login.or"))
                                    .font(.caption)
                                    .foregroundStyle(.white.opacity(0.4))
                                Rectangle().frame(height: 1)
                                    .foregroundStyle(Color.white.opacity(0.15))
                            }

                            SignInWithAppleButton(.signIn) { request in
                                let nonce = randomNonceString()
                                currentNonce = nonce
                                request.requestedScopes = [.fullName, .email]
                                request.nonce = sha256(nonce)
                            } onCompletion: { result in
                                handleAppleSignIn(result)
                            }
                            .signInWithAppleButtonStyle(.white)
                            .frame(height: 52)
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                        }
                        .padding(.horizontal, 24)

                        Button(LocalizedStringKey("login.requestAccess")) {
                            viewModel.showAccessRequest = true
                        }
                        .font(.footnote)
                        .foregroundStyle(.white.opacity(0.5))
                        .padding(.bottom, 32)
                    }
                }
                .frame(maxWidth: 480)
                .frame(maxWidth: .infinity)
            }
            .navigationBarHidden(true)
        }
        .sheet(isPresented: $viewModel.showAccessRequest) {
            AccessRequestView()
        }
        .environment(\.layoutDirection, appState.isRTL ? .rightToLeft : .leftToRight)
    }

    private func randomNonceString(length: Int = 32) -> String {
        var randomBytes = [UInt8](repeating: 0, count: length)
        _ = SecRandomCopyBytes(kSecRandomDefault, randomBytes.count, &randomBytes)
        return randomBytes.map { String(format: "%02x", $0) }.joined()
    }

    private func sha256(_ input: String) -> String {
        let inputData = Data(input.utf8)
        let hashed = SHA256.hash(data: inputData)
        return hashed.compactMap { String(format: "%02x", $0) }.joined()
    }

    private func handleAppleSignIn(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let auth):
            guard
                let credential = auth.credential as? ASAuthorizationAppleIDCredential,
                let tokenData = credential.identityToken,
                let idToken = String(data: tokenData, encoding: .utf8)
            else { return }
            let nonce = currentNonce
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

// MARK: - Brand Mark (ECG waveform + checkmark)

private struct PassboardBrandMark: View {
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(Color.white.opacity(0.1))
                .frame(width: 88, height: 88)
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .strokeBorder(Color.brand.opacity(0.4), lineWidth: 1.5)
                .frame(width: 88, height: 88)
            ECGCheckmarkShape()
                .stroke(Color.brand,
                        style: StrokeStyle(lineWidth: 2.8, lineCap: .round, lineJoin: .round))
                .frame(width: 54, height: 30)
        }
    }
}

/// ECG spike that transitions into a checkmark — the Passboard brand mark.
private struct ECGCheckmarkShape: Shape {
    func path(in rect: CGRect) -> Path {
        let w = rect.width
        let h = rect.height
        let mid = h / 2
        var p = Path()

        // Flat lead-in
        p.move(to: CGPoint(x: 0, y: mid))
        p.addLine(to: CGPoint(x: w * 0.26, y: mid))
        // ECG peak
        p.addLine(to: CGPoint(x: w * 0.34, y: mid - h * 0.42))
        p.addLine(to: CGPoint(x: w * 0.41, y: mid + h * 0.48))
        p.addLine(to: CGPoint(x: w * 0.47, y: mid - h * 0.20))
        p.addLine(to: CGPoint(x: w * 0.53, y: mid))
        // Checkmark
        p.addLine(to: CGPoint(x: w * 0.66, y: mid + h * 0.28))
        p.addLine(to: CGPoint(x: w * 1.00, y: mid - h * 0.36))

        return p
    }
}
