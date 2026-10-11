import SwiftUI

struct PracticeSessionView: View {
    @State var viewModel: PracticeSessionViewModel
    @Environment(\.horizontalSizeClass) private var sizeClass

    var body: some View {
        Group {
            if viewModel.isFinished {
                PracticeResultsView(
                    totalQuestions: viewModel.questions.count,
                    correctCount: viewModel.correctCount,
                    questions: viewModel.questions,
                    planTaskId: viewModel.planTaskId
                )
            } else if sizeClass == .regular {
                iPadLayout
            } else {
                iPhoneLayout
            }
        }
        .navigationBarBackButtonHidden(viewModel.showAnswer == false ? false : true)
        .navigationTitle(LocalizedStringKey("practice.question \(viewModel.currentIndex + 1) of \(viewModel.questions.count)"))
    }

    // iPad: two columns
    private var iPadLayout: some View {
        HStack(alignment: .top, spacing: 0) {
            // Left: question
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    progressBar
                    questionText
                }
                .padding()
            }
            .frame(maxWidth: .infinity)

            Divider()

            // Right: options + explanation
            ScrollView {
                VStack(spacing: 12) {
                    optionRows
                    if viewModel.showAnswer { explanationCard }
                    nextButton
                }
                .padding()
            }
            .frame(maxWidth: .infinity)
        }
    }

    // iPhone: single column
    private var iPhoneLayout: some View {
        ScrollView {
            VStack(spacing: 16) {
                progressBar
                questionText
                optionRows
                if viewModel.showAnswer { explanationCard }
                nextButton
            }
            .padding()
        }
    }

    private var progressBar: some View {
        ProgressView(value: viewModel.progress)
            .tint(.accentColor)
    }

    private var questionText: some View {
        Text(viewModel.current.questionText)
            .font(.body)
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.regularMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var optionRows: some View {
        VStack(spacing: 8) {
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
    }

    private var explanationCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label(LocalizedStringKey("practice.justification"), systemImage: "lightbulb.fill")
                .font(.headline)
                .foregroundStyle(.yellow)
            if let justification = viewModel.current.justification {
                Text(justification).font(.body)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.yellow.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var nextButton: some View {
        Button(viewModel.isLast ? LocalizedStringKey("practice.finish") : LocalizedStringKey("practice.next")) {
            viewModel.nextQuestion()
        }
        .frame(maxWidth: .infinity)
        .padding()
        .buttonStyle(.borderedProminent)
        .disabled(!viewModel.showAnswer)
    }
}

extension CorrectAnswer: CaseIterable {
    public static var allCases: [CorrectAnswer] { [.A, .B, .C, .D] }
}
