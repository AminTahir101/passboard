import SwiftUI

struct MockExamResultsView: View {
    let viewModel: MockExamViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                CardView {
                    VStack(spacing: 12) {
                        ProgressRing(progress: viewModel.percentage, lineWidth: 14,
                                     color: viewModel.percentage >= 0.8 ? .green : viewModel.percentage >= 0.6 ? .orange : .red)
                            .frame(width: 120, height: 120)
                            .overlay {
                                Text("\(Int(viewModel.percentage * 100))%").font(.title.bold())
                            }
                        Text("\(viewModel.score)/\(viewModel.questions.count)")
                            .font(.headline)
                        Text(LocalizedStringKey("mockExam.duration \(viewModel.durationSeconds / 60) min"))
                            .font(.caption).foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                }

                ForEach(viewModel.questions) { q in
                    CardView {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(q.questionText).font(.subheadline)
                            HStack {
                                Label("Correct: \(q.correctAnswer.rawValue)", systemImage: "checkmark.circle")
                                    .foregroundStyle(.green).font(.caption)
                                Spacer()
                                if let selected = viewModel.answers[q.id] {
                                    Label("Your answer: \(selected.rawValue)",
                                          systemImage: selected == q.correctAnswer ? "checkmark" : "xmark")
                                        .foregroundStyle(selected == q.correctAnswer ? .green : .red)
                                        .font(.caption)
                                }
                            }
                        }
                    }
                }
            }
            .padding()
        }
        .navigationTitle(LocalizedStringKey("mockExam.results"))
        .navigationBarBackButtonHidden()
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(LocalizedStringKey("mockExam.newExam")) {
                    // Pop to root is handled by the parent state machine
                    // viewModel.state = .setup in parent
                }
            }
        }
    }
}
