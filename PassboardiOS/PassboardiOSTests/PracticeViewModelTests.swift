import Testing
@testable import PassboardiOS

final class MockQuestionService: QuestionServiceProtocol {
    var questionsToReturn: [Question] = []
    var recordedAttempt: NewQuestionAttempt? = nil
    var taskCompleted: String? = nil

    func fetchPublished(exam: String?, category: String?, topic: String?, count: Int) async throws -> [Question] { questionsToReturn }
    func fetchIncorrect(userId: String, count: Int) async throws -> [Question] { questionsToReturn }
    func fetchCategories(exam: String?) async throws -> [String] { ["Cardiology", "Neurology"] }
    func fetchTopics(category: String?) async throws -> [String] { ["ECG", "Arrhythmias"] }
    func recordAttempt(_ attempt: NewQuestionAttempt) async throws { recordedAttempt = attempt }
    func completeStudyTask(id: String) async throws { taskCompleted = id }
}

@MainActor
struct PracticeViewModelTests {
    @Test func loadsCategories() async throws {
        let service = MockQuestionService()
        let vm = PracticeSetupViewModel(questionService: service)
        await vm.loadCategories(exam: nil)
        #expect(vm.categories == ["Cardiology", "Neurology"])
    }

    @Test func recordsAttemptCorrectly() async throws {
        let service = MockQuestionService()
        let vm = PracticeSessionViewModel(
            questions: [makeQuestion()],
            userId: "user-1",
            planTaskId: nil,
            questionService: service
        )
        await vm.submitAnswer(.A)
        #expect(service.recordedAttempt != nil)
        #expect(service.recordedAttempt?.selectedAnswer == .A)
    }

    @Test func completesStudyTaskOnFinish() async throws {
        let service = MockQuestionService()
        let q = makeQuestion()
        let vm = PracticeSessionViewModel(
            questions: [q],
            userId: "user-1",
            planTaskId: "task-99",
            questionService: service
        )
        await vm.submitAnswer(.A)
        vm.nextQuestion()
        await Task.yield()
        #expect(service.taskCompleted == "task-99")
    }
}

private func makeQuestion() -> Question {
    Question(id: "q1", questionText: "Test?",
             optionA: "A", optionB: "B", optionC: "C", optionD: "D",
             correctAnswer: .A, justification: "Because A",
             explanationA: nil, explanationB: nil, explanationC: nil, explanationD: nil,
             exam: "SMLE", category: "Cardiology", topic: nil, subtopic: nil,
             difficulty: .medium, year: nil, source: nil, status: .published,
             createdAt: "", updatedAt: "")
}
