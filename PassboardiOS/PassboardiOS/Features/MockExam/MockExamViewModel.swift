import SwiftUI

@Observable
@MainActor
final class MockExamViewModel {
    enum State { case setup, loading, session, results }
    var state: State = .setup

    var questionCount: Int = 50
    var exam: MockExam? = nil
    var questions: [Question] = []
    var answers: [String: CorrectAnswer] = [:]  // questionId -> answer
    var flagged: Set<String> = []
    var currentIndex: Int = 0
    var startTime: Date = Date()
    var error: String? = nil

    private let mockExamService: MockExamServiceProtocol
    var userId: String = ""

    init(mockExamService: MockExamServiceProtocol = MockExamService()) {
        self.mockExamService = mockExamService
    }

    var current: Question? { questions.isEmpty ? nil : questions[currentIndex] }
    var isLast: Bool { currentIndex == questions.count - 1 }
    var answeredCount: Int { answers.count }
    var score: Int { answers.filter { id, ans in questions.first(where: { $0.id == id })?.correctAnswer == ans } .count }
    var percentage: Double { questions.isEmpty ? 0 : Double(score) / Double(questions.count) }
    var durationSeconds: Int { Int(Date().timeIntervalSince(startTime)) }

    func startExam() async {
        state = .loading
        do {
            let (exam, qs) = try await mockExamService.createExam(userId: userId, questionCount: questionCount)
            self.exam = exam
            self.questions = qs
            self.startTime = Date()
            state = .session
        } catch {
            self.error = error.localizedDescription
            state = .setup
        }
    }

    func selectAnswer(_ answer: CorrectAnswer) async {
        guard let q = current, answers[q.id] == nil else { return }
        answers[q.id] = answer
        let isCorrect = answer == q.correctAnswer
        try? await mockExamService.saveAnswer(
            mockExamId: exam!.id, questionId: q.id, answer: answer, isCorrect: isCorrect)
    }

    func toggleFlag() {
        guard let q = current else { return }
        if flagged.contains(q.id) { flagged.remove(q.id) } else { flagged.insert(q.id) }
    }

    func navigate(to index: Int) {
        currentIndex = index
    }

    func finishExam() async {
        guard let exam else { return }
        try? await mockExamService.completeExam(
            id: exam.id, score: score, percentage: percentage, durationSeconds: durationSeconds)
        state = .results
    }
}
