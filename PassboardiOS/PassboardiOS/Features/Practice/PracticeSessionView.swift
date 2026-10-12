import SwiftUI

struct PracticeSessionView: View {
    @State var viewModel: PracticeSessionViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        Group {
            if viewModel.isFinished {
                PracticeResultsView(
                    totalQuestions: viewModel.questions.count,
                    correctCount: viewModel.correctCount,
                    questions: viewModel.questions,
                    planTaskId: viewModel.planTaskId
                )
            } else {
                sessionLayout
            }
        }
        .navigationBarBackButtonHidden(true)
    }

    private var sessionLayout: some View {
        ZStack(alignment: .bottom) {
            Color.appBackground.ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                HStack {
                    Button { dismiss() } label: {
                        ZStack {
                            Circle().fill(Color.cardSurface).frame(width: 44, height: 44)
                            Image(systemName: "xmark")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundStyle(.white)
                        }
                    }
                    .accessibilityLabel(Text("Close"))

                    Spacer()

                    HStack(spacing: 4) {
                        Text("Question ")
                            .font(.headline)
                            .foregroundStyle(Color.mutedForeground)
                        + Text("\(viewModel.currentIndex + 1)")
                            .font(.headline.bold())
                            .foregroundStyle(.white)
                        + Text(" of \(viewModel.questions.count)")
                            .font(.headline)
                            .foregroundStyle(Color.mutedForeground)
                    }

                    Spacer()

                    NavigationLink(destination: AIChatListView()) {
                        ZStack {
                            Circle().fill(Color.brand.opacity(0.18)).frame(width: 44, height: 44)
                            Image(systemName: "bubble.left.and.bubble.right.fill")
                                .font(.system(size: 16))
                                .foregroundStyle(Color.brand)
                        }
                    }
                    .accessibilityLabel(Text("Ask AI Tutor"))
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)
                .padding(.bottom, 10)

                // Progress bar
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule().fill(Color.cardSurface).frame(height: 4)
                        Capsule()
                            .fill(Color.brand)
                            .frame(width: geo.size.width * viewModel.progress, height: 4)
                    }
                }
                .frame(height: 4)
                .padding(.horizontal, 20)
                .padding(.bottom, 20)

                // Scrollable content
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        // Category badge
                        if let category = viewModel.current.category {
                            Text(category.uppercased())
                                .font(.caption.weight(.bold))
                                .foregroundStyle(Color.brand)
                                .tracking(0.5)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .overlay(
                                    Capsule().strokeBorder(Color.brand, lineWidth: 1.5)
                                )
                        }

                        // Question
                        Text(viewModel.current.questionText)
                            .font(.title3.bold())
                            .foregroundStyle(.white)
                            .fixedSize(horizontal: false, vertical: true)

                        // Options
                        VStack(spacing: 10) {
                            ForEach(CorrectAnswer.allCases, id: \.self) { option in
                                QuestionOptionRow(
                                    label: option.rawValue,
                                    text: viewModel.current.option(for: option),
                                    state: viewModel.optionState(option)
                                ) {
                                    Task { await viewModel.submitAnswer(option) }
                                }
                            }
                        }

                        // Feedback panel (when answered)
                        if viewModel.showAnswer {
                            FeedbackPanel(
                                isCorrect: viewModel.selectedAnswer == viewModel.current.correctAnswer,
                                correctLabel: viewModel.current.correctAnswer.rawValue,
                                question: viewModel.current
                            )
                        }

                        Spacer().frame(height: 100)
                    }
                    .padding(.horizontal, 20)
                }
            }

            // Bottom sticky button
            VStack(spacing: 0) {
                if viewModel.showAnswer {
                    Button(viewModel.isLast ? NSLocalizedString("practice.finish", comment: "") : NSLocalizedString("practice.next", comment: "")) {
                        viewModel.nextQuestion()
                    }
                    .buttonStyle(BrandButtonStyle())
                    .padding(.horizontal, 20)
                    .padding(.vertical, 16)
                    .padding(.bottom, 4)
                    .background(Color.appBackground)
                } else {
                    Text(LocalizedStringKey("practice.chooseAnswer"))
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Color.mutedForeground)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(Color.cardSurface)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .padding(.horizontal, 20)
                        .padding(.vertical, 16)
                        .padding(.bottom, 4)
                        .background(Color.appBackground)
                }
            }
        }
    }
}

// MARK: - Feedback Panel
private struct FeedbackPanel: View {
    let isCorrect: Bool
    let correctLabel: String
    let question: Question

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(isCorrect ? "Correct!" : "Not quite")
                    .font(.subheadline.bold())
                    .foregroundStyle(isCorrect ? Color.green : Color.red)
                if !isCorrect {
                    Text("The answer is \(correctLabel) — \(shortExplanation)")
                        .font(.caption)
                        .foregroundStyle(Color.mutedForeground)
                        .fixedSize(horizontal: false, vertical: true)
                } else if let just = question.justification {
                    Text(just)
                        .font(.caption)
                        .foregroundStyle(Color.mutedForeground)
                        .lineLimit(2)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            Spacer()
            NavigationLink(destination: AIChatListView()) {
                HStack(spacing: 4) {
                    Image(systemName: "bubble.left.fill")
                        .font(.caption)
                    Text("Explain")
                        .font(.caption.weight(.semibold))
                }
                .foregroundStyle(Color.brand)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.brand.opacity(0.12))
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }
        }
        .padding(14)
        .background(Color.cardSurface)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous)
            .strokeBorder(isCorrect ? Color.green.opacity(0.4) : Color.red.opacity(0.4), lineWidth: 1))
    }

    private var shortExplanation: String {
        guard let j = question.justification else { return "" }
        let parts = j.components(separatedBy: ". ")
        return parts.first ?? j
    }
}

extension CorrectAnswer: CaseIterable {
    public static var allCases: [CorrectAnswer] { [.A, .B, .C, .D] }
}
