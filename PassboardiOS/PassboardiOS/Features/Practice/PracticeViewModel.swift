import SwiftUI

// MARK: - Setup ViewModel
@Observable
@MainActor
final class PracticeSetupViewModel {
    enum Mode: String, CaseIterable { case category, topic, incorrect }
    var mode: Mode = .category
    var selectedExam: String? = nil
    var selectedCategory: String? = nil
    var selectedTopic: String? = nil
    var count: Int = 20
    var categories: [String] = []
    var topics: [String] = []
    var isLoading = false
    var navigateToSession = false
    var loadedQuestions: [Question] = []
    var error: String? = nil

    private let questionService: QuestionServiceProtocol
    private var userId: String = ""

    init(questionService: QuestionServiceProtocol = QuestionService()) {
        self.questionService = questionService
    }

    func loadCategories(exam: String?) async {
        isLoading = true
        defer { isLoading = false }
        do { categories = try await questionService.fetchCategories(exam: exam) }
        catch { self.error = error.localizedDescription }
    }

    func loadTopics(category: String?) async {
        do { topics = try await questionService.fetchTopics(category: category) }
        catch { self.error = error.localizedDescription }
    }

    func startSession(userId: String) async {
        self.userId = userId
        isLoading = true
        defer { isLoading = false }
        do {
            switch mode {
            case .category:
                loadedQuestions = try await questionService.fetchPublished(
                    exam: selectedExam, category: selectedCategory, topic: nil, count: count)
            case .topic:
                loadedQuestions = try await questionService.fetchPublished(
                    exam: selectedExam, category: selectedCategory, topic: selectedTopic, count: count)
            case .incorrect:
                loadedQuestions = try await questionService.fetchIncorrect(userId: userId, count: count)
            }
            if loadedQuestions.isEmpty {
                error = "No questions found for the selected filters."
            } else {
                navigateToSession = true
            }
        } catch {
            self.error = error.localizedDescription
        }
    }
}

// MARK: - Session ViewModel
@Observable
@MainActor
final class PracticeSessionViewModel {
    let questions: [Question]
    let userId: String
    let planTaskId: String?

    var currentIndex: Int = 0
    var selectedAnswer: CorrectAnswer? = nil
    var showAnswer: Bool = false
    var isFinished: Bool = false
    var correctCount: Int = 0
    private var taskTicked: Bool = false

    private let questionService: QuestionServiceProtocol

    init(questions: [Question], userId: String, planTaskId: String?,
         questionService: QuestionServiceProtocol = QuestionService()) {
        self.questions = questions
        self.userId = userId
        self.planTaskId = planTaskId
        self.questionService = questionService
    }

    var current: Question { questions[currentIndex] }
    var progress: Double { Double(currentIndex) / Double(questions.count) }
    var isLast: Bool { currentIndex == questions.count - 1 }

    func optionState(_ option: CorrectAnswer) -> OptionState {
        guard showAnswer else {
            return selectedAnswer == option ? .selected : .unanswered
        }
        if option == current.correctAnswer { return .correct }
        if option == selectedAnswer { return .incorrect }
        return .unanswered
    }

    func submitAnswer(_ answer: CorrectAnswer) async {
        guard selectedAnswer == nil else { return }
        selectedAnswer = answer
        showAnswer = true
        let isCorrect = answer == current.correctAnswer
        if isCorrect { correctCount += 1 }
        let attempt = NewQuestionAttempt(
            userId: userId, questionId: current.id,
            selectedAnswer: answer, isCorrect: isCorrect)
        try? await questionService.recordAttempt(attempt)
    }

    func nextQuestion() {
        if isLast {
            isFinished = true
            if let taskId = planTaskId, !taskTicked {
                taskTicked = true
                let svc = questionService
                Task { @MainActor in try? await svc.completeStudyTask(id: taskId) }
            }
        } else {
            currentIndex += 1
            selectedAnswer = nil
            showAnswer = false
        }
    }
}
