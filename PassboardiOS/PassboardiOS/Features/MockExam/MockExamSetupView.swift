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
        ZStack(alignment: .bottom) {
            Color.appBackground.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 28) {
                    // Title
                    VStack(alignment: .leading, spacing: 4) {
                        Text(LocalizedStringKey("nav.mockExam"))
                            .font(.title.bold())
                            .foregroundStyle(.white)
                        Text(LocalizedStringKey("mockExam.subtitle"))
                            .font(.subheadline)
                            .foregroundStyle(Color.mutedForeground)
                    }
                    .padding(.top, 8)

                    // Exam length
                    VStack(alignment: .leading, spacing: 10) {
                        Text(LocalizedStringKey("mockExam.questionCount"))
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundStyle(Color.mutedForeground)
                            .textCase(.uppercase)
                            .tracking(0.8)

                        HStack(spacing: 12) {
                            ExamLengthCard(
                                badge: NSLocalizedString("mockExam.full", comment: ""),
                                count: 100,
                                isSelected: viewModel.questionCount == 100
                            ) { viewModel.questionCount = 100 }

                            ExamLengthCard(
                                badge: NSLocalizedString("mockExam.half", comment: ""),
                                count: 50,
                                isSelected: viewModel.questionCount == 50
                            ) { viewModel.questionCount = 50 }
                        }
                    }

                    // Info rows
                    VStack(spacing: 0) {
                        InfoRow(icon: "square.grid.2x2.fill", textKey: "mockExam.info.allCategories")
                        Divider().background(Color.cardBorder).padding(.leading, 54)
                        InfoRow(icon: "eye.slash.fill", textKey: "mockExam.info.hiddenAnswers")
                        Divider().background(Color.cardBorder).padding(.leading, 54)
                        InfoRow(icon: "chart.bar.fill", textKey: "mockExam.info.fullResults")
                    }
                    .background(Color.cardSurface)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .overlay(RoundedRectangle(cornerRadius: 16).strokeBorder(Color.cardBorder, lineWidth: 1))

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
                    Task { await viewModel.startExam() }
                } label: {
                    if viewModel.state == .loading {
                        ProgressView().tint(.black)
                    } else {
                        Text(LocalizedStringKey("mockExam.begin"))
                    }
                }
                .buttonStyle(BrandButtonStyle())
                .disabled(viewModel.state == .loading)
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                .padding(.bottom, 4)
            }
            .background(Color.appBackground)
        }
        .navigationBarHidden(true)
        .overlay { LoadingOverlay(isLoading: viewModel.state == .loading) }
    }
}

// MARK: - Exam Length Card
private struct ExamLengthCard: View {
    let badge: String
    let count: Int
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(badge)
                        .font(.caption2)
                        .fontWeight(.bold)
                        .foregroundStyle(isSelected ? Color.black : .white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(isSelected ? Color.brand : Color.white.opacity(0.15))
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                    Spacer()
                    ZStack {
                        Circle()
                            .strokeBorder(isSelected ? Color.brand : Color.mutedForeground, lineWidth: 1.5)
                            .frame(width: 20, height: 20)
                        if isSelected {
                            Circle().fill(Color.brand).frame(width: 11, height: 11)
                        }
                    }
                }
                Text("\(count)")
                    .font(.system(size: 36, weight: .bold))
                    .foregroundStyle(.white)
                Text(LocalizedStringKey("common.questions"))
                    .font(.caption)
                    .foregroundStyle(Color.mutedForeground)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
            .background(Color.cardSurface)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .strokeBorder(isSelected ? Color.brand : Color.cardBorder, lineWidth: isSelected ? 1.5 : 1)
            )
        }
        .buttonStyle(PressButtonStyle())
        .animation(.easeOut(duration: 0.15), value: isSelected)
    }
}

// MARK: - Info Row
private struct InfoRow: View {
    let icon: String
    let textKey: LocalizedStringKey
    init(icon: String, textKey: String) {
        self.icon = icon
        self.textKey = LocalizedStringKey(textKey)
    }
    var body: some View {
        HStack(spacing: 14) {
            IconBox(systemName: icon, size: 32)
            Text(textKey)
                .font(.subheadline)
                .foregroundStyle(.white)
            Spacer()
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 14)
    }
}
