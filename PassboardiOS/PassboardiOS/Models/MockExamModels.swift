import Foundation

struct MockExam: Codable, Identifiable {
    let id: String
    let userId: String
    let examName: String?
    let startedAt: String
    var completedAt: String?
    let questionCount: Int
    var score: Int?
    var percentage: Double?
    var durationSeconds: Int?

    enum CodingKeys: String, CodingKey {
        case id, score, percentage
        case userId = "user_id"
        case examName = "exam_name"
        case startedAt = "started_at"
        case completedAt = "completed_at"
        case questionCount = "question_count"
        case durationSeconds = "duration_seconds"
    }
}

struct MockExamQuestion: Codable, Identifiable {
    let id: String
    let mockExamId: String
    let questionId: String
    let position: Int
    var flagged: Bool

    enum CodingKeys: String, CodingKey {
        case id, position, flagged
        case mockExamId = "mock_exam_id"
        case questionId = "question_id"
    }
}

struct MockAnswer: Codable, Identifiable {
    let id: String
    let mockExamId: String
    let questionId: String
    var selectedAnswer: CorrectAnswer?
    var isCorrect: Bool?

    enum CodingKeys: String, CodingKey {
        case id
        case mockExamId = "mock_exam_id"
        case questionId = "question_id"
        case selectedAnswer = "selected_answer"
        case isCorrect = "is_correct"
    }
}
