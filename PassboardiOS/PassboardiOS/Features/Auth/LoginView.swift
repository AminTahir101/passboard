import SwiftUI

struct LoginView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = LoginViewModel()
    @State private var showPassword = false
    @FocusState private var focusedField: Field?

    enum Field { case email, password }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 32) {

                        // Logo + wordmark
                        VStack(spacing: 16) {
                            PassboardLogoMark()
                            VStack(spacing: 6) {
                                Text("Passboard.ai")
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
                            AuthField(
                                label: LocalizedStringKey("login.email"),
                                placeholder: LocalizedStringKey("login.email"),
                                text: $viewModel.email,
                                isFocused: focusedField == .email,
                                keyboard: .emailAddress
                            )
                            .focused($focusedField, equals: .email)

                            // Password
                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    Text(LocalizedStringKey("login.password"))
                                        .font(.subheadline).fontWeight(.medium)
                                        .foregroundStyle(Color.mutedForeground)
                                    Spacer()
                                    Button {} label: {
                                        Text(LocalizedStringKey("login.forgot"))
                                            .font(.subheadline).fontWeight(.medium)
                                            .foregroundStyle(Color.brand)
                                    }
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
                                    .accessibilityLabel(showPassword ? Text("Hide password") : Text("Show password"))
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

                            // Request Access button
                            Button {
                                viewModel.showAccessRequest = true
                            } label: {
                                HStack(spacing: 8) {
                                    Image(systemName: "person.badge.plus")
                                        .font(.system(size: 16, weight: .semibold))
                                    Text(LocalizedStringKey("login.requestAccess"))
                                        .font(.system(size: 16, weight: .semibold))
                                }
                                .frame(maxWidth: .infinity)
                                .frame(height: 52)
                                .foregroundStyle(Color.brand)
                                .background(
                                    RoundedRectangle(cornerRadius: 16)
                                        .fill(Color.brand.opacity(0.12))
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 16)
                                                .strokeBorder(Color.brand.opacity(0.45), lineWidth: 1.5)
                                        )
                                )
                            }
                        }
                        .padding(.horizontal, 24)
                        .padding(.bottom, 48)
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
}

// MARK: - Reusable auth text field

private struct AuthField: View {
    let label: LocalizedStringKey
    let placeholder: LocalizedStringKey
    @Binding var text: String
    let isFocused: Bool
    var keyboard: UIKeyboardType = .default

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.subheadline).fontWeight(.medium)
                .foregroundStyle(Color.mutedForeground)
            TextField(placeholder, text: $text)
                .keyboardType(keyboard)
                .autocapitalization(.none)
                .textContentType(keyboard == .emailAddress ? .emailAddress : .name)
                .padding(14)
                .background(Color.cardSurface)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .strokeBorder(
                            isFocused ? Color.brand : Color.cardBorder,
                            lineWidth: isFocused ? 1.5 : 1
                        )
                )
                .animation(.easeOut(duration: 0.15), value: isFocused)
        }
    }
}
