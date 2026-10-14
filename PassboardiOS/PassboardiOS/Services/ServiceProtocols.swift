import Foundation

// MARK: - Auth
protocol AuthServiceProtocol {
    func signIn(email: String, password: String) async throws
    func signInWithApple(idToken: String, nonce: String) async throws
    func signOut() async throws
    func submitAccessRequest(_ request: AccessRequestInput) async throws
}

struct AccessRequestInput {
    let fullName: String
    let email: String
    let phone: String
    let targetExam: String
    let expectedExamDate: String
    let notes: String
}

// MARK: - Profile
protocol ProfileServiceProtocol {
    func fetchProfile(userId: String) async throws -> Profile
    func fetchStats(userId: String) async throws -> UserStats
    func fetchTodaysTasks(planId: String) async throws -> [StudyTask]
}

struct UserStats {
    let totalAttempts: Int
    let correctAttempts: Int
    let accuracy: Double
    let streak: Int
}

// MARK: - Questions
protocol QuestionServiceProtocol {
    func fetchPublished(exam: String?, category: String?, topic: String?, count: Int) async throws -> [Question]
    func fetchIncorrect(userId: String, count: Int) async throws -> [Question]
    func fetchCategories(exam: String?) async throws -> [String]
    func fetchTopics(category: String?) async throws -> [String]
    func recordAttempt(_ attempt: NewQuestionAttempt) async throws
    func completeStudyTask(id: String) async throws
}

// MARK: - Mock Exam
protocol MockExamServiceProtocol {
    func createExam(userId: String, questionCount: Int) async throws -> (MockExam, [Question])
    func saveAnswer(mockExamId: String, questionId: String, answer: CorrectAnswer, isCorrect: Bool) async throws
    func completeExam(id: String, score: Int, percentage: Double, durationSeconds: Int) async throws
    func fetchExamHistory(userId: String) async throws -> [MockExam]
}

// MARK: - Study Plan
protocol StudyPlanServiceProtocol {
    func fetchPlan(userId: String) async throws -> StudyPlan?
    func fetchTasks(planId: String) async throws -> [StudyTask]
    func savePlan(_ input: StudyPlanInput, userId: String) async throws -> StudyPlan
    func completeTask(id: String) async throws
}

struct StudyPlanInput {
    let exam: String
    let examDate: String
    let studyDays: [Int]
    let questionsPerDay: Int
    let mockDay: Int?
    let mockSize: Int?
    let focusSpecialties: [String]
}

// MARK: - AI Chat
protocol AIChatServiceProtocol {
    func fetchConversations(userId: String) async throws -> [AiConversation]
    func createConversation(userId: String, questionId: String?, title: String?) async throws -> AiConversation
    func fetchMessages(conversationId: String) async throws -> [AiMessage]
    func sendMessage(conversationId: String, content: String) async throws -> AiMessage
    func streamResponse(conversationId: String, userMessage: String) -> AsyncThrowingStream<String, Error>
}
