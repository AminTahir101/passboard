import SwiftUI

struct PracticeSetupView: View {
    var planTaskId: String? = nil
    var presetCount: Int? = nil
    var presetCategory: String? = nil

    @Environment(AppState.self) private var appState
    @State private var viewModel = PracticeSetupViewModel()

    var body: some View {
        ZStack(alignment: .bottom) {
            Color.appBackground.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 20) {
                    // Mode selector
                    FormSection(label: NSLocalizedString("practice.mode", comment: "")) {
                        HStack(spacing: 8) {
                            ForEach(PracticeSetupViewModel.Mode.allCases, id: \.self) { mode in
                                Button {
                                    viewModel.mode = mode
                                } label: {
                                    Text(mode.displayName)
                                        .font(.subheadline.weight(.medium))
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 11)
                                        .background(viewModel.mode == mode
                                                    ? Color.brand
                                                    : Color.white.opacity(0.08))
                                        .foregroundStyle(viewModel.mode == mode
                                                         ? Color.black
                                                         : Color.white.opacity(0.7))
                                        .clipShape(RoundedRectangle(cornerRadius: 10))
                                }
                                .animation(.easeOut(duration: 0.15), value: viewModel.mode)
                            }
                        }
                    }

                    // Category picker
                    if viewModel.mode == .category || viewModel.mode == .topic {
                        FormSection(label: NSLocalizedString("practice.category", comment: "")) {
                            Picker("", selection: $viewModel.selectedCategory) {
                                Text(NSLocalizedString("common.all", comment: "")).tag(String?.none)
                                ForEach(viewModel.categories, id: \.self) { cat in
                                    Text(cat).tag(Optional(cat))
                                }
                            }
                            .pickerStyle(.menu)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .tint(.white)
                            .onChange(of: viewModel.selectedCategory) { _, newVal in
                                Task { await viewModel.loadTopics(category: newVal) }
                            }
                        }
                    }

                    // Topic picker
                    if viewModel.mode == .topic {
                        FormSection(label: NSLocalizedString("practice.topic", comment: "")) {
                            Picker("", selection: $viewModel.selectedTopic) {
                                Text(NSLocalizedString("common.all", comment: "")).tag(String?.none)
                                ForEach(viewModel.topics, id: \.self) { t in
                                    Text(t).tag(Optional(t))
                                }
                            }
                            .pickerStyle(.menu)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .tint(.white)
                        }
                    }

                    // Question count
                    FormSection(label: NSLocalizedString("practice.questionCount", comment: "")) {
                        HStack {
                            Text("\(viewModel.count) \(NSLocalizedString("common.questions", comment: ""))")
                                .font(.body)
                            Spacer()
                            HStack(spacing: 0) {
                                Button {
                                    if viewModel.count > 5 { viewModel.count -= 5 }
                                } label: {
                                    Image(systemName: "minus")
                                        .frame(width: 44, height: 44)
                                        .foregroundStyle(viewModel.count > 5 ? Color.brand : Color.white.opacity(0.3))
                                }
                                Rectangle()
                                    .fill(Color.white.opacity(0.15))
                                    .frame(width: 1, height: 24)
                                Button {
                                    if viewModel.count < 100 { viewModel.count += 5 }
                                } label: {
                                    Image(systemName: "plus")
                                        .frame(width: 44, height: 44)
                                        .foregroundStyle(viewModel.count < 100 ? Color.brand : Color.white.opacity(0.3))
                                }
                            }
                            .background(Color.white.opacity(0.08))
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                    }

                    if let err = viewModel.error {
                        Text(err)
                            .font(.caption)
                            .foregroundStyle(.red)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal, 4)
                    }

                    // Bottom padding so content doesn't hide behind CTA
                    Spacer().frame(height: 80)
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
            }

            // Sticky CTA
            VStack(spacing: 0) {
                Divider().opacity(0.2)
                Button {
                    Task {
                        guard let userId = appState.session?.user.id.uuidString else { return }
                        await viewModel.startSession(userId: userId)
                    }
                } label: {
                    if viewModel.isLoading {
                        ProgressView().tint(.black)
                    } else {
                        Text(LocalizedStringKey("practice.start"))
                    }
                }
                .buttonStyle(BrandButtonStyle())
                .disabled(viewModel.isLoading)
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
            }
            .background(Color.appBackground)
        }
        .navigationTitle(LocalizedStringKey("nav.practice"))
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

// MARK: - Reusable form section with label above
private struct FormSection<Content: View>: View {
    let label: String
    let content: () -> Content

    init(label: String, @ViewBuilder content: @escaping () -> Content) {
        self.label = label
        self.content = content
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label)
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundStyle(.white.opacity(0.5))
                .textCase(.uppercase)
                .tracking(0.5)
            content()
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.white.opacity(0.08))
                .clipShape(RoundedRectangle(cornerRadius: 14))
        }
    }
}
