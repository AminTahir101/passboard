import SwiftUI

@Observable
@MainActor
final class AccessRequestViewModel {
    var fullName = ""
    var email = ""
    var phone = ""
    var targetExam = ""
    var expectedDate = ""
    var notes = ""
    var isLoading = false
    var submitted = false
    var error: String? = nil

    private let authService: AuthServiceProtocol

    init(authService: AuthServiceProtocol = AuthService()) {
        self.authService = authService
    }

    func submit() async {
        guard !fullName.isEmpty, !email.isEmpty else {
            error = "Name and email are required."
            return
        }
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
}

struct AccessRequestView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel = AccessRequestViewModel()

    var body: some View {
        NavigationStack {
            if viewModel.submitted {
                VStack(spacing: 16) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 60))
                        .foregroundStyle(.green)
                    Text(LocalizedStringKey("accessRequest.success"))
                        .font(.title2.bold())
                    Button(LocalizedStringKey("common.done")) { dismiss() }
                        .buttonStyle(.borderedProminent)
                }
                .padding()
            } else {
                Form {
                    Section(LocalizedStringKey("accessRequest.personalInfo")) {
                        TextField(LocalizedStringKey("common.fullName"), text: $viewModel.fullName)
                        TextField(LocalizedStringKey("common.email"), text: $viewModel.email)
                            .keyboardType(.emailAddress).autocapitalization(.none)
                        TextField(LocalizedStringKey("common.phone"), text: $viewModel.phone)
                            .keyboardType(.phonePad)
                    }
                    Section(LocalizedStringKey("accessRequest.examInfo")) {
                        TextField(LocalizedStringKey("common.targetExam"), text: $viewModel.targetExam)
                        TextField(LocalizedStringKey("accessRequest.expectedDate"), text: $viewModel.expectedDate)
                    }
                    Section(LocalizedStringKey("accessRequest.notes")) {
                        TextEditor(text: $viewModel.notes).frame(minHeight: 80)
                    }
                    if let error = viewModel.error {
                        Section { Text(error).foregroundStyle(.red).font(.caption) }
                    }
                }
                .navigationTitle(LocalizedStringKey("login.requestAccess"))
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button(LocalizedStringKey("common.cancel")) { dismiss() }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button(LocalizedStringKey("common.submit")) {
                            Task { await viewModel.submit() }
                        }
                        .disabled(viewModel.isLoading)
                    }
                }
            }
        }
    }
}
