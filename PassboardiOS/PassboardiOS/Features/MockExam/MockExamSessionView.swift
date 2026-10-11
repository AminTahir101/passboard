import SwiftUI

struct MockExamSessionView: View {
    @Bindable var viewModel: MockExamViewModel
    @State private var showNavigator = false
    @Environment(\.horizontalSizeClass) private var sizeClass

    var body: some View {
        Group {
            if sizeClass == .regular {
                iPadLayout
            } else {
                iPhoneLayout
            }
        }
        .navigationBarBackButtonHidden()
        .navigationTitle(LocalizedStringKey("mockExam.question \(viewModel.currentIndex + 1) / \(viewModel.questions.count)"))
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(action: { showNavigator.toggle() }) {
                    Image(systemName: "square.grid.3x3")
                }
            }
            ToolbarItem(placement: .secondaryAction) {
                Button(LocalizedStringKey("mockExam.flag"), action: viewModel.toggleFlag)
                    .foregroundStyle(viewModel.flagged.contains(viewModel.current?.id ?? "") ? .orange : .primary)
            }
        }
        .sheet(isPresented: $showNavigator) {
            NavigatorSheet(viewModel: viewModel)
        }
    }

    private var iPadLayout: some View {
        HStack(spacing: 0) {
            questionContent.frame(maxWidth: .infinity)
            Divider()
            NavigatorPanel(viewModel: viewModel).frame(width: 280)
        }
    }

    private var iPhoneLayout: some View {
        questionContent
    }

    private var questionContent: some View {
        ScrollView {
            VStack(spacing: 16) {
                if let q = viewModel.current {
                    Text(q.questionText)
                        .font(.body).padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(.regularMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 12))

                    VStack(spacing: 8) {
                        ForEach(CorrectAnswer.allCases, id: \.self) { option in
                            let answered = viewModel.answers[q.id]
                            QuestionOptionRow(
                                label: option.rawValue,
                                text: q.option(for: option),
                                state: {
                                    if answered == nil { return answered == option ? .selected : .unanswered }
                                    return answered == option ? .selected : .unanswered
                                }()
                            ) { Task { await viewModel.selectAnswer(option) } }
                        }
                    }

                    HStack {
                        if viewModel.currentIndex > 0 {
                            Button(LocalizedStringKey("common.previous")) {
                                viewModel.navigate(to: viewModel.currentIndex - 1)
                            }
                            .buttonStyle(.bordered)
                        }
                        Spacer()
                        if viewModel.isLast {
                            Button(LocalizedStringKey("mockExam.finish")) {
                                Task { await viewModel.finishExam() }
                            }
                            .buttonStyle(.borderedProminent)
                        } else {
                            Button(LocalizedStringKey("practice.next")) {
                                viewModel.navigate(to: viewModel.currentIndex + 1)
                            }
                            .buttonStyle(.borderedProminent)
                        }
                    }
                }
            }
            .padding()
        }
    }
}

private struct NavigatorPanel: View {
    @Bindable var viewModel: MockExamViewModel
    var body: some View {
        ScrollView {
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 5), spacing: 8) {
                ForEach(viewModel.questions.indices, id: \.self) { i in
                    let q = viewModel.questions[i]
                    Button("\(i + 1)") {
                        viewModel.navigate(to: i)
                    }
                    .frame(width: 40, height: 40)
                    .background(navColor(for: q.id, current: i == viewModel.currentIndex))
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
            }
            .padding()
        }
    }

    private func navColor(for questionId: String, current: Bool) -> Color {
        if current { return Color.accentColor }
        if viewModel.flagged.contains(questionId) { return .orange }
        if viewModel.answers[questionId] != nil { return .green.opacity(0.7) }
        return Color(.systemGray4)
    }
}

private struct NavigatorSheet: View {
    @Bindable var viewModel: MockExamViewModel
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        NavigationStack {
            NavigatorPanel(viewModel: viewModel)
                .navigationTitle(LocalizedStringKey("mockExam.navigator"))
                .toolbar { ToolbarItem(placement: .confirmationAction) {
                    Button(LocalizedStringKey("common.done")) { dismiss() }
                }}
        }
    }
}
