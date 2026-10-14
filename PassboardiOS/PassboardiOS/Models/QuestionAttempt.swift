import Foundation

struct QuestionAttempt: Codable, Identifiable {
    let id: String
    let userId: String
    let questionId: String
    let selectedAnswer: CorrectAnswer
    let isCorrect: Bool
    let attemptedAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case questionId = "question_id"
        case selectedAnswer = "selected_answer"
        case isCorrect = "is_correct"
        case attemptedAt = "attempted_at"
    }
}

struct NewQuestionAttempt: Codable {
    let userId: String
    let questionId: String
    let selectedAnswer: CorrectAnswer
    let isCorrect: Bool

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case questionId = "question_id"
        case selectedAnswer = "selected_answer"
        case isCorrect = "is_correct"
    }
}
