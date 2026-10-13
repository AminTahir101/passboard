import SwiftUI

// MARK: - ViewModel

@Observable
@MainActor
final class AccessRequestViewModel {
    var fullName = ""
    var email = ""
    var phone = ""
    var targetExam = ""
    var expectedDate = ""
    var notes = ""
    var step: Int = 1
    var isLoading = false
    var submitted = false
    var error: String? = nil

    private let authService: AuthServiceProtocol

    init(authService: AuthServiceProtocol = AuthService()) {
        self.authService = authService
    }

    var step1Valid: Bool {
        !fullName.trimmingCharacters(in: .whitespaces).isEmpty && isValidEmail(email)
    }

    func submit() async {
        isLoading = true
        error = nil
        do {
            try await authService.submitAccessRequest(
                AccessRequestInput(
                    fullName: fullName, email: email, phone: phone,
                    targetExam: targetExam, expectedExamDate: expectedDate, notes: notes
                )
            )
            submitted = true
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    private func isValidEmail(_ s: String) -> Bool {
        s.contains("@") && s.contains(".")
    }
}

// MARK: - View

struct AccessRequestView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel = AccessRequestViewModel()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground.ignoresSafeArea()

                if viewModel.submitted {
                    SuccessView(onDone: { dismiss() })
                        .transition(.asymmetric(
                            insertion: .move(edge: .trailing).combined(with: .opacity),
                            removal: .opacity
                        ))
                } else {
                    VStack(spacing: 0) {
                        // Navigation bar
                        HStack {
                            Button { dismiss() } label: {
                                Image(systemName: "xmark")
                                    .font(.system(size: 15, weight: .semibold))
                                    .foregroundStyle(Color.mutedForeground)
                                    .frame(width: 36, height: 36)
                                    .background(Color.cardSurface)
                                    .clipShape(Circle())
                            }
                            Spacer()
                            PassboardLogoMark(size: 36)
                            Spacer()
                            Color.clear.frame(width: 36, height: 36)
                        }
                        .padding(.horizontal, 20)
                        .padding(.top, 16)
                        .padding(.bottom, 20)

                        // Step indicator
                        StepIndicator(currentStep: viewModel.step, totalSteps: 2)
                            .padding(.horizontal, 20)
                            .padding(.bottom, 20)

                        // Title
                        VStack(spacing: 6) {
                            Text(viewModel.step == 1 ? "Request Access" : "Exam Details")
                                .font(.title2.bold())
                                .foregroundStyle(.white)
                            Text(viewModel.step == 1
                                 ? "Tell us about yourself"
                                 : "Help us match you with the right content")
                                .font(.subheadline)
                                .foregroundStyle(Color.mutedForeground)
                                .multilineTextAlignment(.center)
                        }
                        .padding(.bottom, 8)
                        .animation(.easeInOut(duration: 0.2), value: viewModel.step)

                        // Steps via TabView (swipe disabled — nav via buttons only)
                        TabView(selection: $viewModel.step) {
                            Step1View(viewModel: viewModel).tag(1)
                            Step2View(viewModel: viewModel).tag(2)
                        }
                        .tabViewStyle(.page(indexDisplayMode: .never))
                        .animation(.easeInOut(duration: 0.3), value: viewModel.step)
                    }
                }
            }
            .navigationBarHidden(true)
        }
        .presentationDetents([.large])
        .presentationDragIndicator(.hidden)
        .environment(\.colorScheme, .dark)
    }
}

// MARK: - Step 1: Personal Info

private struct Step1View: View {
    @Bindable var viewModel: AccessRequestViewModel
    @FocusState private var focused: PersonalField?
    enum PersonalField { case name, email, phone }

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                RequestField(
                    label: "Full Name",
                    placeholder: "Dr. Amin Tahir",
                    text: $viewModel.fullName,
                    isFocused: focused == .name,
                    keyboard: .default
                )
                .focused($focused, equals: .name)

                RequestField(
                    label: "Email",
                    placeholder: "you@example.com",
                    text: $viewModel.email,
                    isFocused: focused == .email,
                    keyboard: .emailAddress
                )
                .focused($focused, equals: .email)

                RequestField(
                    label: "Phone (optional)",
                    placeholder: "+966 5X XXX XXXX",
                    text: $viewModel.phone,
                    isFocused: focused == .phone,
                    keyboard: .phonePad
                )
                .focused($focused, equals: .phone)

                if let error = viewModel.error {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 24)
            .padding(.bottom, 16)
        }
        .safeAreaInset(edge: .bottom) {
            Button {
                withAnimation { viewModel.step = 2 }
            } label: {
                HStack(spacing: 8) {
                    Text("Continue")
                    Image(systemName: "arrow.right")
                }
            }
            .buttonStyle(BrandButtonStyle())
            .disabled(!viewModel.step1Valid)
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .background(
                Rectangle()
                    .fill(Color.appBackground)
                    .ignoresSafeArea()
            )
        }
    }
}

// MARK: - Step 2: Exam Info

private let targetExams = [
    "SMLE (Saudi Medical Licensing Exam)",
    "USMLE Step 1",
    "USMLE Step 2 CK",
    "USMLE Step 3",
    "PLAB",
    "AMC CAT",
    "Other",
]

private struct Step2View: View {
    @Bindable var viewModel: AccessRequestViewModel
    @FocusState private var notesActive: Bool

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {

                // Target exam picker
                VStack(alignment: .leading, spacing: 6) {
                    Text("Target Exam")
                        .font(.subheadline).fontWeight(.medium)
                        .foregroundStyle(Color.mutedForeground)
                    Menu {
                        ForEach(targetExams, id: \.self) { exam in
                            Button(exam) { viewModel.targetExam = exam }
                        }
                    } label: {
                        HStack {
                            Text(viewModel.targetExam.isEmpty ? "Select your exam" : viewModel.targetExam)
                                .foregroundStyle(viewModel.targetExam.isEmpty ? Color.mutedForeground : .white)
                                .font(.body)
                                .lineLimit(1)
                            Spacer()
                            Image(systemName: "chevron.up.chevron.down")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Color.mutedForeground)
                        }
                        .padding(14)
                        .background(Color.cardSurface)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .strokeBorder(Color.cardBorder, lineWidth: 1)
                        )
                    }
                }

                RequestField(
                    label: "Expected Exam Date (optional)",
                    placeholder: "e.g. March 2027",
                    text: $viewModel.expectedDate,
                    isFocused: false,
                    keyboard: .default
                )

                // Notes
                VStack(alignment: .leading, spacing: 6) {
                    Text("Anything else? (optional)")
                        .font(.subheadline).fontWeight(.medium)
                        .foregroundStyle(Color.mutedForeground)
                    ZStack(alignment: .topLeading) {
                        if viewModel.notes.isEmpty {
                            Text("Tell us about your background or goals…")
                                .foregroundStyle(Color.mutedForeground.opacity(0.6))
                                .font(.body)
                                .padding(14)
                        }
                        TextEditor(text: $viewModel.notes)
                            .focused($notesActive)
                            .scrollContentBackground(.hidden)
                            .foregroundStyle(.white)
                            .font(.body)
                            .padding(10)
                            .frame(minHeight: 90)
                    }
                    .background(Color.cardSurface)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14)
                            .strokeBorder(notesActive ? Color.brand : Color.cardBorder,
                                          lineWidth: notesActive ? 1.5 : 1)
                    )
                    .animation(.easeOut(duration: 0.15), value: notesActive)
                }

                if let error = viewModel.error {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 24)
            .padding(.bottom, 16)
        }
        .safeAreaInset(edge: .bottom) {
            VStack(spacing: 10) {
                Button {
                    Task { await viewModel.submit() }
                } label: {
                    if viewModel.isLoading {
                        ProgressView().tint(.black)
                    } else {
                        Text("Submit Request")
                    }
                }
                .buttonStyle(BrandButtonStyle())
                .disabled(viewModel.isLoading)

                Button {
                    withAnimation { viewModel.step = 1 }
                } label: {
                    Text("Back")
                        .font(.subheadline)
                        .foregroundStyle(Color.mutedForeground)
                }
                .padding(.vertical, 4)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .background(
                Rectangle()
                    .fill(Color.appBackground)
                    .ignoresSafeArea()
            )
        }
    }
}

// MARK: - Success screen

private struct SuccessView: View {
    let onDone: () -> Void
    @State private var appeared = false

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            ZStack {
                Circle()
                    .fill(Color.brand.opacity(0.15))
                    .frame(width: 108, height: 108)
                    .scaleEffect(appeared ? 1 : 0.5)
                Circle()
                    .strokeBorder(Color.brand.opacity(0.3), lineWidth: 1)
                    .frame(width: 132, height: 132)
                    .scaleEffect(appeared ? 1 : 0.5)
                Image(systemName: "checkmark")
                    .font(.system(size: 44, weight: .bold))
                    .foregroundStyle(Color.brand)
                    .scaleEffect(appeared ? 1 : 0)
            }
            .animation(.spring(response: 0.5, dampingFraction: 0.65).delay(0.05), value: appeared)

            VStack(spacing: 10) {
                Text("Request Sent!")
                    .font(.title.bold())
                    .foregroundStyle(.white)
                Text(NSLocalizedString("accessRequest.success", comment: ""))
                    .font(.subheadline)
                    .foregroundStyle(Color.mutedForeground)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
            }
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 12)
            .animation(.easeOut(duration: 0.4).delay(0.2), value: appeared)

            Spacer()

            Button(action: onDone) {
                Text(LocalizedStringKey("common.done"))
            }
            .buttonStyle(BrandButtonStyle())
            .padding(.horizontal, 20)
            .padding(.bottom, 48)
            .opacity(appeared ? 1 : 0)
            .animation(.easeOut(duration: 0.3).delay(0.35), value: appeared)
        }
        .onAppear { appeared = true }
    }
}

// MARK: - Step indicator

private struct StepIndicator: View {
    let currentStep: Int
    let totalSteps: Int

    var body: some View {
        HStack(spacing: 6) {
            ForEach(1...totalSteps, id: \.self) { step in
                Capsule()
                    .fill(step <= currentStep ? Color.brand : Color.white.opacity(0.15))
                    .frame(width: step == currentStep ? 28 : 8, height: 5)
                    .animation(.spring(response: 0.35, dampingFraction: 0.8), value: currentStep)
            }
        }
    }
}

// MARK: - Reusable field

private struct RequestField: View {
    let label: String
    let placeholder: String
    @Binding var text: String
    let isFocused: Bool
    let keyboard: UIKeyboardType

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.subheadline).fontWeight(.medium)
                .foregroundStyle(Color.mutedForeground)
            TextField(placeholder, text: $text)
                .keyboardType(keyboard)
                .autocapitalization(.none)
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
