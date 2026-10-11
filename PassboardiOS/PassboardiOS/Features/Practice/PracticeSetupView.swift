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
                VStack(alignment: .leading, spacing: 24) {
                    // Title
                    VStack(alignment: .leading, spacing: 4) {
                        Text(LocalizedStringKey("nav.practice"))
                            .font(.system(size: 28, weight: .bold))
                            .foregroundStyle(.white)
                        Text(LocalizedStringKey("practice.subtitle"))
                            .font(.subheadline)
                            .foregroundStyle(Color.mutedForeground)
                    }
                    .padding(.top, 8)

                    // Mode selector
                    VStack(alignment: .leading, spacing: 8) {
                        SectionLabel("practice.mode")
                        VStack(spacing: 8) {
                            ModeRow(
                                mode: .category,
                                icon: "square.grid.2x2.fill",
                                titleKey: "practice.mode.category",
                                descKey: "practice.mode.category.desc",
                                isSelected: viewModel.mode == .category
                            ) { viewModel.mode = .category }

                            ModeRow(
                                mode: .topic,
                                icon: "list.bullet",
                                titleKey: "practice.mode.topic",
                                descKey: "practice.mode.topic.desc",
                                isSelected: viewModel.mode == .topic
                            ) { viewModel.mode = .topic }

                            ModeRow(
                                mode: .incorrect,
                                icon: "arrow.counterclockwise",
                                titleKey: "practice.mode.incorrect",
                                descKey: "practice.mode.incorrect.desc",
                                isSelected: viewModel.mode == .incorrect
                            ) { viewModel.mode = .incorrect }
                        }
                    }

                    // Category picker
                    if viewModel.mode == .category || viewModel.mode == .topic {
                        VStack(alignment: .leading, spacing: 8) {
                            SectionLabel("practice.category")
                            Picker("", selection: $viewModel.selectedCategory) {
                                Text(NSLocalizedString("common.all", comment: "")).tag(String?.none)
                                ForEach(viewModel.categories, id: \.self) { cat in
                                    Text(cat).tag(Optional(cat))
                                }
                            }
                            .pickerStyle(.menu)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .tint(Color.brand)
                            .padding(14)
                            .background(Color.cardSurface)
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                            .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(Color.cardBorder, lineWidth: 1))
                            .onChange(of: viewModel.selectedCategory) { _, newVal in
                                Task { await viewModel.loadTopics(category: newVal) }
                            }
                        }
                    }

                    // Topic picker
                    if viewModel.mode == .topic {
                        VStack(alignment: .leading, spacing: 8) {
                            SectionLabel("practice.topic")
                            Picker("", selection: $viewModel.selectedTopic) {
                                Text(NSLocalizedString("common.all", comment: "")).tag(String?.none)
                                ForEach(viewModel.topics, id: \.self) { t in
                                    Text(t).tag(Optional(t))
                                }
                            }
                            .pickerStyle(.menu)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .tint(Color.brand)
                            .padding(14)
                            .background(Color.cardSurface)
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                            .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(Color.cardBorder, lineWidth: 1))
                        }
                    }

                    // Question count
                    VStack(alignment: .leading, spacing: 8) {
                        SectionLabel("practice.questionCount")
                        HStack(spacing: 0) {
                            Button {
                                if viewModel.count > 5 { viewModel.count -= 5 }
                            } label: {
                                Image(systemName: "minus")
                                    .frame(width: 52, height: 52)
                                    .foregroundStyle(viewModel.count > 5 ? .white : Color.mutedForeground)
                                    .background(Color.cardSurface)
                            }
                            .clipShape(RoundedRectangle(cornerRadius: 12))

                            Spacer()
                            Text("\(viewModel.count)")
                                .font(.system(size: 28, weight: .bold))
                                .foregroundStyle(.white)
                            Spacer()

                            Button {
                                if viewModel.count < 100 { viewModel.count += 5 }
                            } label: {
                                Image(systemName: "plus")
                                    .frame(width: 52, height: 52)
                                    .foregroundStyle(viewModel.count < 100 ? .white : Color.mutedForeground)
                                    .background(Color.cardSurface)
                            }
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        .padding(.horizontal, 4)
                    }

                    if let err = viewModel.error {
                        Text(err).font(.caption).foregroundStyle(.red)
                    }

                    Spacer().frame(height: 80)
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
            }

            // Sticky CTA
            VStack(spacing: 0) {
                Button {
                    Task {
                        guard let userId = appState.session?.user.id.uuidString else { return }
                        await viewModel.startSession(userId: userId)
                    }
                } label: {
                    if viewModel.isLoading {
                        ProgressView().tint(.black)
                    } else {
                        Text("Start \(viewModel.count) questions")
                    }
                }
                .buttonStyle(BrandButtonStyle())
                .disabled(viewModel.isLoading)
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                .padding(.bottom, 4)
            }
            .background(Color.appBackground)
        }
        .navigationBarHidden(true)
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

// MARK: - Mode Row
private struct ModeRow: View {
    let mode: PracticeSetupViewModel.Mode
    let icon: String
    let titleKey: String
    let descKey: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                IconBox(systemName: icon)
                VStack(alignment: .leading, spacing: 2) {
                    Text(LocalizedStringKey(titleKey))
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundStyle(.white)
                    Text(LocalizedStringKey(descKey))
                        .font(.caption)
                        .foregroundStyle(Color.mutedForeground)
                }
                Spacer()
                ZStack {
                    Circle()
                        .strokeBorder(isSelected ? Color.brand : Color.mutedForeground, lineWidth: 1.5)
                        .frame(width: 22, height: 22)
                    if isSelected {
                        Circle()
                            .fill(Color.brand)
                            .frame(width: 12, height: 12)
                    }
                }
            }
            .padding(14)
            .background(Color.cardSurface)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .strokeBorder(isSelected ? Color.brand : Color.cardBorder, lineWidth: isSelected ? 1.5 : 1)
            )
        }
        .buttonStyle(PressButtonStyle())
        .animation(.easeOut(duration: 0.15), value: isSelected)
    }
}
