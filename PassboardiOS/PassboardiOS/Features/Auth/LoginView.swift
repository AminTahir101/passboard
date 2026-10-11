import SwiftUI
import AuthenticationServices
import CryptoKit

struct LoginView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = LoginViewModel()
    @State private var currentNonce: String = ""
    @State private var showPassword = false
    @FocusState private var focusedField: Field?

    enum Field { case email, password }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 32) {
                        // Brand mark
                        VStack(spacing: 14) {
                            PassboardBrandMark()
                            VStack(spacing: 6) {
                                Text("Passboard")
                                    .font(.system(size: 32, weight: .bold))
                                    .foregroundStyle(.white)
                                Text(LocalizedStringKey("login.subtitle"))
                                    .font(.subheadline)
                                    .foregroundStyle(Color.mutedForeground)
                                    .multilineTextAlignment(.center)
                            }
                        }
                        .padding(.top, 64)

                        // Form
                        VStack(spacing: 14) {
                            // Email
                            VStack(alignment: .leading, spacing: 6) {
                                Text(LocalizedStringKey("login.email"))
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .foregroundStyle(Color.mutedForeground)
                                TextField(LocalizedStringKey("login.email"), text: $viewModel.email)
                                    .keyboardType(.emailAddress)
                                    .autocapitalization(.none)
                                    .textContentType(.emailAddress)
                                    .focused($focusedField, equals: .email)
                                    .padding(14)
                                    .background(Color.cardSurface)
                                    .foregroundStyle(.white)
                                    .clipShape(RoundedRectangle(cornerRadius: 14))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 14)
                                            .strokeBorder(
                                                focusedField == .email ? Color.brand : Color.cardBorder,
                                                lineWidth: focusedField == .email ? 1.5 : 1
                                            )
                                    )
                                    .animation(.easeOut(duration: 0.15), value: focusedField)
                            }

                            // Password
                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    Text(LocalizedStringKey("login.password"))
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                        .foregroundStyle(Color.mutedForeground)
                                    Spacer()
                                    Text(LocalizedStringKey("login.forgot"))
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                        .foregroundStyle(Color.brand)
                                }
                                HStack {
                                    Group {
                                        if showPassword {
                                            TextField(LocalizedStringKey("login.password"), text: $viewModel.password)
                                                .textContentType(.password)
                                        } else {
                                            SecureField(LocalizedStringKey("login.password"), text: $viewModel.password)
                                                .textContentType(.password)
                                        }
                                    }
                                    .focused($focusedField, equals: .password)
                                    .foregroundStyle(.white)

                                    Button {
                                        showPassword.toggle()
                                    } label: {
                                        Image(systemName: showPassword ? "eye.slash" : "eye")
                                            .foregroundStyle(Color.mutedForeground)
                                    }
                                }
                                .padding(14)
                                .background(Color.cardSurface)
                                .clipShape(RoundedRectangle(cornerRadius: 14))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 14)
                                        .strokeBorder(
                                            focusedField == .password ? Color.brand : Color.cardBorder,
                                            lineWidth: focusedField == .password ? 1.5 : 1
                                        )
                                )
                                .animation(.easeOut(duration: 0.15), value: focusedField)
                            }

                            if let error = viewModel.error {
                                Text(error)
                                    .font(.caption)
                                    .foregroundStyle(.red)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }

                            // Sign In CTA
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
                            .padding(.top, 4)

                            // Divider
                            HStack(spacing: 12) {
                                Rectangle().frame(height: 1).foregroundStyle(Color.white.opacity(0.12))
                                Text(LocalizedStringKey("login.or"))
                                    .font(.caption)
                                    .foregroundStyle(Color.mutedForeground)
                                Rectangle().frame(height: 1).foregroundStyle(Color.white.opacity(0.12))
                            }

                            // Apple Sign In
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

                        // Request access link
                        Button {
                            viewModel.showAccessRequest = true
                        } label: {
                            HStack(spacing: 4) {
                                Text(LocalizedStringKey("login.noAccess"))
                                    .foregroundStyle(Color.mutedForeground)
                                Text(LocalizedStringKey("login.requestAccess"))
                                    .foregroundStyle(Color.brand)
                            }
                            .font(.footnote)
                        }
                        .padding(.bottom, 40)
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
                .fill(Color.cardSurface)
                .frame(width: 88, height: 88)
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .strokeBorder(Color.brand.opacity(0.5), lineWidth: 1.5)
                .frame(width: 88, height: 88)
            ECGCheckmarkShape()
                .stroke(Color.brand,
                        style: StrokeStyle(lineWidth: 2.8, lineCap: .round, lineJoin: .round))
                .frame(width: 54, height: 30)
        }
    }
}

private struct ECGCheckmarkShape: Shape {
    func path(in rect: CGRect) -> Path {
        let w = rect.width
        let h = rect.height
        let mid = h / 2
        var p = Path()
        p.move(to: CGPoint(x: 0, y: mid))
        p.addLine(to: CGPoint(x: w * 0.26, y: mid))
        p.addLine(to: CGPoint(x: w * 0.34, y: mid - h * 0.42))
        p.addLine(to: CGPoint(x: w * 0.41, y: mid + h * 0.48))
        p.addLine(to: CGPoint(x: w * 0.47, y: mid - h * 0.20))
        p.addLine(to: CGPoint(x: w * 0.53, y: mid))
        p.addLine(to: CGPoint(x: w * 0.66, y: mid + h * 0.28))
        p.addLine(to: CGPoint(x: w * 1.00, y: mid - h * 0.36))
        return p
    }
}
