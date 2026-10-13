import SwiftUI

// MARK: - Setup ViewModel
@Observable
@MainActor
final class PracticeSetupViewModel {
    enum Mode: String, CaseIterable {
        case category, topic, incorrect
        /// Localized display name — interpolated LocalizedStringKey doesn't do key lookup.
        var displayName: String {
            NSLocalizedString("practice.mode.\(rawValue)", comment: "")
        }
    }
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
        // Clear any existing saved session — user is starting fresh
        SessionPersistence.clear(userId: userId)
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

    func buildSessionViewModel(userId: String) -> PracticeSessionViewModel {
        let vm = PracticeSessionViewModel(questions: loadedQuestions, userId: userId, planTaskId: nil)
        vm.sessionMode = mode.rawValue
        vm.sessionCategory = selectedCategory
        return vm
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
    private var savedAnswers: [String: String] = [:]  // questionId → rawValue

    // Persistence metadata (set by PracticeSetupViewModel before handing off)
    var sessionMode: String = "category"
    var sessionCategory: String? = nil

    private let questionService: QuestionServiceProtocol

    init(questions: [Question], userId: String, planTaskId: String?,
         questionService: QuestionServiceProtocol = QuestionService()) {
        self.questions = questions
        self.userId = userId
        self.planTaskId = planTaskId
        self.questionService = questionService
    }

    /// Restore from a saved session — already-answered questions are skipped forward.
    convenience init(restoring saved: SavedPracticeSession, planTaskId: String? = nil,
                     questionService: QuestionServiceProtocol = QuestionService()) {
        self.init(questions: saved.questions, userId: saved.userId,
                  planTaskId: planTaskId, questionService: questionService)
        currentIndex  = saved.currentIndex
        correctCount  = saved.correctCount
        savedAnswers  = saved.answers
        sessionMode   = saved.mode
        sessionCategory = saved.category
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
        savedAnswers[current.id] = answer.rawValue
        persistSession()
        let attempt = NewQuestionAttempt(
            userId: userId, questionId: current.id,
            selectedAnswer: answer, isCorrect: isCorrect)
        try? await questionService.recordAttempt(attempt)
    }

    func nextQuestion() {
        if isLast {
            isFinished = true
            SessionPersistence.clear(userId: userId)
            if let taskId = planTaskId, !taskTicked {
                taskTicked = true
                let svc = questionService
                Task { @MainActor in try? await svc.completeStudyTask(id: taskId) }
            }
        } else {
            currentIndex += 1
            selectedAnswer = nil
            showAnswer = false
            persistSession()
        }
    }

    // MARK: Private

    private func persistSession() {
        guard planTaskId == nil else { return }  // don't persist plan-driven sessions
        let session = SavedPracticeSession(
            userId: userId,
            questions: questions,
            currentIndex: currentIndex,
            answers: savedAnswers,
            correctCount: correctCount,
            startedAt: Date(),
            mode: sessionMode,
            category: sessionCategory
        )
        SessionPersistence.save(session)
    }
}
