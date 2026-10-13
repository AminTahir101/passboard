import SwiftUI

struct PracticeSetupView: View {
    var planTaskId: String? = nil
    var presetCount: Int? = nil
    var presetCategory: String? = nil

    @Environment(AppState.self) private var appState
    @State private var viewModel = PracticeSetupViewModel()
    @State private var savedSession: SavedPracticeSession? = nil
    @State private var navigateToResume = false

    var body: some View {
        ZStack(alignment: .bottom) {
            Color.appBackground.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Title
                    VStack(alignment: .leading, spacing: 4) {
                        Text(LocalizedStringKey("nav.practice"))
                            .font(.title.bold())
                            .foregroundStyle(.white)
                        Text(LocalizedStringKey("practice.subtitle"))
                            .font(.subheadline)
                            .foregroundStyle(Color.mutedForeground)
                    }
                    .padding(.top, 8)

                    // Resume banner
                    if let saved = savedSession {
                        ResumeBanner(session: saved) {
                            navigateToResume = true
                        } onDiscard: {
                            guard let uid = appState.session?.user.id.uuidString else { return }
                            SessionPersistence.clear(userId: uid)
                            savedSession = nil
                        }
                    }

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
                            .accessibilityLabel(Text("Decrease question count"))

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
                            .accessibilityLabel(Text("Increase question count"))
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
                        Text("\(NSLocalizedString("practice.start", comment: "")) \(viewModel.count) \(NSLocalizedString("common.questions", comment: ""))")
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
            if let uid = appState.session?.user.id.uuidString {
                savedSession = SessionPersistence.load(userId: uid)
            }
            if let cat = presetCategory { viewModel.selectedCategory = cat }
            if let cnt = presetCount { viewModel.count = cnt }
            await viewModel.loadCategories(exam: nil)
        }
        // New session navigation
        .navigationDestination(isPresented: $viewModel.navigateToSession) {
            if let userId = appState.session?.user.id.uuidString {
                PracticeSessionView(viewModel: viewModel.buildSessionViewModel(userId: userId))
            }
        }
        // Resume saved session navigation
        .navigationDestination(isPresented: $navigateToResume) {
            if let saved = savedSession {
                PracticeSessionView(
                    viewModel: PracticeSessionViewModel(restoring: saved, planTaskId: planTaskId)
                )
            }
        }
    }
}

// MARK: - Resume Banner

private struct ResumeBanner: View {
    let session: SavedPracticeSession
    let onResume: () -> Void
    let onDiscard: () -> Void

    private var displayMode: String {
        switch session.mode {
        case "incorrect": return "Review Mistakes"
        case "topic":     return "Topic Practice"
        default:          return session.category ?? "Practice"
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 10) {
                IconBox(systemName: "play.circle.fill", size: 36)
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text("In Progress")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Color.brand)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color.brand.opacity(0.15))
                            .clipShape(Capsule())
                    }
                    Text(displayMode)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white)
                }
                Spacer()
                Text("\(session.questionsRemaining) left")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(Color.mutedForeground)
            }

            // Progress bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color.white.opacity(0.08))
                        .frame(height: 5)
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color.brand)
                        .frame(width: geo.size.width * session.progressFraction, height: 5)
                }
            }
            .frame(height: 5)

            HStack(spacing: 10) {
                Button(action: onResume) {
                    Text("Resume")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.black)
                        .frame(maxWidth: .infinity)
                        .frame(height: 40)
                        .background(Color.brand)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }

                Button(action: onDiscard) {
                    Text("Discard")
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(Color.mutedForeground)
                        .frame(maxWidth: .infinity)
                        .frame(height: 40)
                        .background(Color.cardSurface)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(Color.cardBorder, lineWidth: 1))
                }
            }
        }
        .padding(16)
        .background(Color.cardSurface)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).strokeBorder(Color.brand.opacity(0.35), lineWidth: 1))
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
