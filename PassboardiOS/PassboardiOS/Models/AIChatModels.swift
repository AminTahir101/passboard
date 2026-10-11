import Foundation

struct AiConversation: Codable, Identifiable {
    let id: String
    let userId: String
    var title: String?
    let questionId: String?
    let createdAt: String
    let updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id, title
        case userId = "user_id"
        case questionId = "question_id"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct AiMessage: Codable, Identifiable {
    let id: String
    let conversationId: String
    let role: MessageRole
    let content: String
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, role, content
        case conversationId = "conversation_id"
        case createdAt = "created_at"
    }
}
