import SwiftUI

struct PracticeResultsView: View {
    let totalQuestions: Int
    let correctCount: Int
    let questions: [Question]
    let planTaskId: String?

    @Environment(AppState.self) private var appState
    @State private var expandedId: String? = nil

    private var accuracy: Double {
        totalQuestions > 0 ? Double(correctCount) / Double(totalQuestions) : 0
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Score header
                CardView {
                    VStack(spacing: 16) {
                        ProgressRing(progress: accuracy, lineWidth: 12, color: accuracyColor)
                            .frame(width: 100, height: 100)
                            .overlay {
                                Text("\(Int(accuracy * 100))%")
                                    .font(.title.bold())
                            }
                        Text("\(correctCount)/\(totalQuestions) \(NSLocalizedString("practice.correct", comment: ""))")
                            .font(.headline)
                    }
                    .frame(maxWidth: .infinity)
                }

                // Per-question review
                VStack(alignment: .leading, spacing: 8) {
                    Text(LocalizedStringKey("practice.review"))
                        .font(.headline)
                    ForEach(questions) { q in
                        QuestionReviewRow(question: q, expanded: expandedId == q.id) {
                            expandedId = expandedId == q.id ? nil : q.id
                        }
                    }
                }
            }
            .padding()
        }
        .navigationTitle(LocalizedStringKey("practice.results"))
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                NavigationLink(LocalizedStringKey("practice.practiceAgain")) {
                    PracticeSetupView()
                }
            }
            if planTaskId != nil {
                ToolbarItem(placement: .cancellationAction) {
                    NavigationLink(LocalizedStringKey("studyPlan.backToStudyPlan")) {
                        StudyPlanView()
                    }
                }
            }
        }
    }

    private var accuracyColor: Color {
        accuracy >= 0.8 ? .green : accuracy >= 0.6 ? .orange : .red
    }
}

private struct QuestionReviewRow: View {
    let question: Question
    let expanded: Bool
    let onTap: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Button(action: onTap) {
                HStack {
                    Text(question.questionText)
                        .font(.subheadline)
                        .lineLimit(expanded ? nil : 2)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    Image(systemName: expanded ? "chevron.up" : "chevron.down")
                        .foregroundStyle(.secondary)
                }
            }
            .buttonStyle(.plain)

            if expanded, let just = question.justification {
                Text(just)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .padding(.top, 4)
            }
        }
        .padding()
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
