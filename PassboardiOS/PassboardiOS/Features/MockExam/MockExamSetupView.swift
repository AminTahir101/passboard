import SwiftUI

struct MockExamSetupView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = MockExamViewModel()

    var body: some View {
        Group {
            switch viewModel.state {
            case .setup, .loading:
                setupForm
            case .session:
                MockExamSessionView(viewModel: viewModel)
            case .results:
                MockExamResultsView(viewModel: viewModel)
            }
        }
        .onAppear {
            viewModel.userId = appState.session?.user.id.uuidString ?? ""
        }
    }

    private var setupForm: some View {
        Form {
            Section(LocalizedStringKey("mockExam.questionCount")) {
                Picker(LocalizedStringKey("mockExam.questionCount"), selection: $viewModel.questionCount) {
                    Text("50").tag(50)
                    Text("100").tag(100)
                }
                .pickerStyle(.segmented)
            }
            if let err = viewModel.error {
                Section { Text(err).foregroundStyle(.red).font(.caption) }
            }
        }
        .navigationTitle(LocalizedStringKey("nav.mockExam"))
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(LocalizedStringKey("mockExam.begin")) {
                    Task { await viewModel.startExam() }
                }
                .disabled(viewModel.state == .loading)
            }
        }
        .overlay { LoadingOverlay(isLoading: viewModel.state == .loading) }
    }
}
