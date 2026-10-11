import SwiftUI

struct ProfileView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel = ProfileViewModel()

    private var initials: String {
        guard let name = appState.profile?.fullName else { return "?" }
        let parts = name.split(separator: " ")
        let first = parts.first?.prefix(1) ?? ""
        let last = parts.dropFirst().first?.prefix(1) ?? ""
        return "\(first)\(last)".uppercased()
    }

    var body: some View {
        ZStack {
            Color.appBackground.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 24) {
                    // Nav header
                    HStack {
                        Button { dismiss() } label: {
                            ZStack {
                                Circle()
                                    .fill(Color.cardSurface)
                                    .frame(width: 36, height: 36)
                                Image(systemName: "chevron.left")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundStyle(.white)
                            }
                        }
                        Spacer()
                        Text(LocalizedStringKey("nav.profile"))
                            .font(.headline)
                            .foregroundStyle(.white)
                        Spacer()
                        // Balance spacer
                        Circle().fill(.clear).frame(width: 36, height: 36)
                    }
                    .padding(.top, 8)

                    // Avatar
                    VStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(Color.cardSurface)
                                .frame(width: 84, height: 84)
                            Circle()
                                .strokeBorder(Color.brand, lineWidth: 2.5)
                                .frame(width: 84, height: 84)
                            Text(initials)
                                .font(.system(size: 28, weight: .bold))
                                .foregroundStyle(Color.brand)
                        }

                        if let name = appState.profile?.fullName {
                            Text(name)
                                .font(.system(size: 20, weight: .bold))
                                .foregroundStyle(.white)
                        }
                        if let profile = appState.profile {
                            Text(profile.email)
                                .font(.subheadline)
                                .foregroundStyle(Color.mutedForeground)

                            // Status pill
                            HStack(spacing: 6) {
                                Circle()
                                    .fill(profile.accessStatus == .active ? Color.brand : .gray)
                                    .frame(width: 7, height: 7)
                                Text(profile.accessStatus.rawValue.capitalized + " access")
                                    .font(.caption)
                                    .fontWeight(.semibold)
                                    .foregroundStyle(profile.accessStatus == .active ? Color.brand : .gray)
                            }
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.cardSurface)
                            .clipShape(Capsule())
                        }
                    }

                    // Account section
                    if let profile = appState.profile {
                        VStack(alignment: .leading, spacing: 8) {
                            SectionLabel("profile.account")
                            VStack(spacing: 0) {
                                ProfileRow(label: LocalizedStringKey("common.fullName"), value: profile.fullName ?? "—")
                                Divider().background(Color.cardBorder).padding(.leading, 16)
                                ProfileRow(label: LocalizedStringKey("common.email"), value: profile.email)
                                Divider().background(Color.cardBorder).padding(.leading, 16)
                                ProfileRow(
                                    label: LocalizedStringKey("common.targetExam"),
                                    value: profile.targetExam ?? "",
                                    emptyAction: profile.targetExam == nil ? LocalizedStringKey("profile.setExam") : nil
                                )
                            }
                            .background(Color.cardSurface)
                            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).strokeBorder(Color.cardBorder, lineWidth: 1))
                        }
                    }

                    // Language section
                    VStack(alignment: .leading, spacing: 8) {
                        SectionLabel("profile.language")
                        HStack(spacing: 0) {
                            Button { appState.setLanguage("en") } label: {
                                Text("English")
                                    .font(.subheadline.weight(.semibold))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                                    .background(appState.language == "en" ? Color.brand : Color.clear)
                                    .foregroundStyle(appState.language == "en" ? Color.black : Color.mutedForeground)
                            }
                            .clipShape(RoundedRectangle(cornerRadius: 12))

                            Button { appState.setLanguage("ar") } label: {
                                Text("العربية")
                                    .font(.subheadline.weight(.semibold))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                                    .background(appState.language == "ar" ? Color.brand : Color.clear)
                                    .foregroundStyle(appState.language == "ar" ? Color.black : Color.mutedForeground)
                            }
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        .padding(4)
                        .background(Color.cardSurface)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .overlay(RoundedRectangle(cornerRadius: 16).strokeBorder(Color.cardBorder, lineWidth: 1))
                        .animation(.easeOut(duration: 0.2), value: appState.language)
                    }

                    Spacer().frame(height: 8)

                    // Sign Out
                    Button {
                        Task { await viewModel.signOut(appState: appState) }
                    } label: {
                        HStack {
                            Spacer()
                            Label(LocalizedStringKey("auth.signOut"), systemImage: "rectangle.portrait.and.arrow.right")
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(.red)
                            Spacer()
                        }
                        .padding(.vertical, 16)
                        .background(Color.cardSurface)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .overlay(RoundedRectangle(cornerRadius: 16).strokeBorder(Color.cardBorder, lineWidth: 1))
                    }
                    .disabled(viewModel.isSigningOut)
                    .opacity(viewModel.isSigningOut ? 0.5 : 1)

                    Spacer().frame(height: 20)
                }
                .padding(.horizontal, 20)
            }
        }
        .navigationBarHidden(true)
        .environment(\.layoutDirection, appState.isRTL ? .rightToLeft : .leftToRight)
    }
}

// MARK: - Section Label
private struct SectionLabel: View {
    let key: LocalizedStringKey
    init(_ key: String) { self.key = LocalizedStringKey(key) }
    var body: some View {
        Text(key)
            .font(.caption)
            .fontWeight(.semibold)
            .foregroundStyle(Color.mutedForeground)
            .textCase(.uppercase)
            .tracking(0.8)
    }
}

// MARK: - Profile Row
private struct ProfileRow: View {
    let label: LocalizedStringKey
    let value: String
    var emptyAction: LocalizedStringKey? = nil

    var body: some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(Color.mutedForeground)
            Spacer()
            if let action = emptyAction, value.isEmpty {
                HStack(spacing: 4) {
                    Text(action)
                        .foregroundStyle(Color.brand)
                    Image(systemName: "chevron.right")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Color.brand)
                }
                .font(.subheadline)
            } else {
                Text(value)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundStyle(.white)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }
}
