import SwiftUI

struct PracticeSetupView: View {
    var planTaskId: String? = nil
    var presetCount: Int? = nil
    var presetCategory: String? = nil

    @Environment(AppState.self) private var appState
    @State private var viewModel = PracticeSetupViewModel()

    var body: some View {
        Form {
            Section(LocalizedStringKey("practice.mode")) {
                Picker(LocalizedStringKey("practice.mode"), selection: $viewModel.mode) {
                    ForEach(PracticeSetupViewModel.Mode.allCases, id: \.self) { mode in
                        Text(LocalizedStringKey("practice.mode.\(mode.rawValue)")).tag(mode)
                    }
                }
                .pickerStyle(.segmented)
            }

            if viewModel.mode == .category || viewModel.mode == .topic {
                Section(LocalizedStringKey("practice.category")) {
                    Picker(LocalizedStringKey("practice.category"), selection: $viewModel.selectedCategory) {
                        Text(LocalizedStringKey("common.all")).tag(String?.none)
                        ForEach(viewModel.categories, id: \.self) { cat in
                            Text(cat).tag(Optional(cat))
                        }
                    }
                    .onChange(of: viewModel.selectedCategory) { _, newVal in
                        Task { await viewModel.loadTopics(category: newVal) }
                    }
                }
            }

            if viewModel.mode == .topic {
                Section(LocalizedStringKey("practice.topic")) {
                    Picker(LocalizedStringKey("practice.topic"), selection: $viewModel.selectedTopic) {
                        Text(LocalizedStringKey("common.all")).tag(String?.none)
                        ForEach(viewModel.topics, id: \.self) { t in
                            Text(t).tag(Optional(t))
                        }
                    }
                }
            }

            Section(LocalizedStringKey("practice.questionCount")) {
                Stepper("\(viewModel.count) \(NSLocalizedString("common.questions", comment: ""))",
                        value: $viewModel.count, in: 5...100, step: 5)
            }

            if let err = viewModel.error {
                Section { Text(err).foregroundStyle(.red).font(.caption) }
            }
        }
        .navigationTitle(LocalizedStringKey("nav.practice"))
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(LocalizedStringKey("practice.start")) {
                    Task {
                        guard let userId = appState.session?.user.id.uuidString else { return }
                        await viewModel.startSession(userId: userId)
                    }
                }
                .disabled(viewModel.isLoading)
            }
        }
        .overlay { LoadingOverlay(isLoading: viewModel.isLoading) }
        .task {
            if let cat = presetCategory { viewModel.selectedCategory = cat }
            if let cnt = presetCount { viewModel.count = cnt }
            await viewModel.loadCategories(exam: nil)
        }
        .navigationDestination(isPresented: $viewModel.navigateToSession) {
            if let userId = appState.session?.user.id.uuidString {
                PracticeSessionView(
                    viewModel: PracticeSessionViewModel(
                        questions: viewModel.loadedQuestions,
                        userId: userId,
                        planTaskId: planTaskId
                    )
                )
            }
        }
    }
}

// PracticeSessionView is created in Task 11
struct PracticeSessionView: View {
    var viewModel: PracticeSessionViewModel
    var body: some View { Text("Loading...") }
}
