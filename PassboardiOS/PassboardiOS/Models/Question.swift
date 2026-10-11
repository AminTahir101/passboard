import Foundation

struct Question: Codable, Identifiable {
    let id: String
    let questionText: String
    let optionA: String
    let optionB: String
    let optionC: String
    let optionD: String
    let correctAnswer: CorrectAnswer
    let justification: String?
    let explanationA: String?
    let explanationB: String?
    let explanationC: String?
    let explanationD: String?
    let exam: String?
    let category: String?
    let topic: String?
    let subtopic: String?
    let difficulty: Difficulty
    let year: Int?
    let source: String?
    let status: QuestionStatus
    let createdAt: String
    let updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id, exam, category, topic, subtopic, difficulty, year, source, status
        case questionText = "question_text"
        case optionA = "option_a"
        case optionB = "option_b"
        case optionC = "option_c"
        case optionD = "option_d"
        case correctAnswer = "correct_answer"
        case justification
        case explanationA = "explanation_a"
        case explanationB = "explanation_b"
        case explanationC = "explanation_c"
        case explanationD = "explanation_d"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    func option(for answer: CorrectAnswer) -> String {
        switch answer {
        case .A: return optionA
        case .B: return optionB
        case .C: return optionC
        case .D: return optionD
        }
    }

    func explanation(for answer: CorrectAnswer) -> String? {
        switch answer {
        case .A: return explanationA
        case .B: return explanationB
        case .C: return explanationC
        case .D: return explanationD
        }
    }
}
