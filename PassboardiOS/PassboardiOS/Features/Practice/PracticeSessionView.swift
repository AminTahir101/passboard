import SwiftUI

struct PracticeSessionView: View {
    @State var viewModel: PracticeSessionViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        Group {
            if viewModel.isFinished {
                ResultView(
                    correct: viewModel.correctCount,
                    total: viewModel.questions.count,
                    onDone: { dismiss() }
                )
            } else {
                questionView
            }
        }
        .navigationBarBackButtonHidden(true)
    }

    private var questionView: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Progress
                HStack {
                    ProgressView(value: viewModel.progress)
                        .progressViewStyle(.linear)
                    Text("\(viewModel.currentIndex + 1)/\(viewModel.questions.count)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(.horizontal)

                // Question
                Text(viewModel.current.questionText)
                    .font(.body)
                    .padding(.horizontal)

                // Options
                VStack(spacing: 8) {
                    ForEach(CorrectAnswer.allCases, id: \.self) { answer in
                        QuestionOptionRow(
                            label: answer.rawValue,
                            text: viewModel.current.option(for: answer),
                            state: viewModel.optionState(answer),
                            onTap: { Task { await viewModel.submitAnswer(answer) } }
                        )
                    }
                }
                .padding(.horizontal)

                // Explanation (after answer)
                if viewModel.showAnswer, let justification = viewModel.current.justification {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(LocalizedStringKey("practice.explanation"))
                            .font(.headline)
                        Text(justification)
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }
                    .padding()
                    .background(.regularMaterial)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .padding(.horizontal)
                }

                // Next button
                if viewModel.showAnswer {
                    Button(viewModel.isLast
                           ? LocalizedStringKey("practice.finish")
                           : LocalizedStringKey("practice.next")) {
                        viewModel.nextQuestion()
                    }
                    .buttonStyle(.borderedProminent)
                    .frame(maxWidth: .infinity)
                    .padding(.horizontal)
                }
            }
            .padding(.vertical)
        }
        .navigationTitle(LocalizedStringKey("nav.practice"))
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button(LocalizedStringKey("common.quit")) { dismiss() }
            }
        }
    }
}

private struct ResultView: View {
    let correct: Int
    let total: Int
    let onDone: () -> Void

    var body: some View {
        VStack(spacing: 24) {
            ProgressRing(progress: Double(correct) / Double(total))
                .frame(width: 120, height: 120)
                .overlay(
                    Text("\(Int(Double(correct) / Double(total) * 100))%")
                        .font(.title.bold())
                )

            Text(LocalizedStringKey("practice.sessionComplete"))
                .font(.title2.bold())

            Text("\(correct)/\(total) \(NSLocalizedString("practice.correct", comment: ""))")
                .foregroundStyle(.secondary)

            Button(LocalizedStringKey("common.done"), action: onDone)
                .buttonStyle(.borderedProminent)
        }
        .padding()
        .navigationTitle(LocalizedStringKey("practice.results"))
    }
}

extension CorrectAnswer: CaseIterable {
    public static var allCases: [CorrectAnswer] { [.A, .B, .C, .D] }
}
