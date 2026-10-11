import Supabase
import Foundation

final class AIChatService: AIChatServiceProtocol {
    func fetchConversations(userId: String) async throws -> [AiConversation] {
        try await supabase.from("ai_conversations").select()
            .eq("user_id", value: userId)
            .order("updated_at", ascending: false)
            .execute().value
    }

    func createConversation(userId: String, questionId: String?, title: String?) async throws -> AiConversation {
        struct Payload: Encodable {
            let user_id: String; let question_id: String?; let title: String?
        }
        return try await supabase.from("ai_conversations")
            .insert(Payload(user_id: userId, question_id: questionId, title: title))
            .select().single().execute().value
    }

    func fetchMessages(conversationId: String) async throws -> [AiMessage] {
        try await supabase.from("ai_messages").select()
            .eq("conversation_id", value: conversationId)
            .order("created_at")
            .execute().value
    }

    func sendMessage(conversationId: String, content: String) async throws -> AiMessage {
        struct Payload: Encodable { let conversation_id: String; let role: String; let content: String }
        return try await supabase.from("ai_messages")
            .insert(Payload(conversation_id: conversationId, role: "user", content: content))
            .select().single().execute().value
    }

    func streamResponse(conversationId: String, userMessage: String) -> AsyncThrowingStream<String, Error> {
        AsyncThrowingStream { continuation in
            Task {
                do {
                    guard let session = try? await supabase.auth.session else {
                        continuation.finish(throwing: AppError.unauthorized)
                        return
                    }
                    let urlString = (Bundle.main.infoDictionary?["SUPABASE_URL"] as? String ?? "")
                        + "/functions/v1/ai-chat"
                    guard let url = URL(string: urlString) else {
                        continuation.finish(throwing: AppError.notFound)
                        return
                    }
                    var request = URLRequest(url: url)
                    request.httpMethod = "POST"
                    request.setValue("Bearer \(session.accessToken)", forHTTPHeaderField: "Authorization")
                    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
                    let body = ["conversationId": conversationId, "message": userMessage]
                    request.httpBody = try? JSONSerialization.data(withJSONObject: body)

                    let (bytes, _) = try await URLSession.shared.bytes(for: request)
                    for try await line in bytes.lines {
                        if line.hasPrefix("data: ") {
                            let data = String(line.dropFirst(6))
                            if data == "[DONE]" { break }
                            if let jsonData = data.data(using: .utf8),
                               let obj = try? JSONDecoder().decode([String: String].self, from: jsonData),
                               let token = obj["content"] {
                                continuation.yield(token)
                            }
                        }
                    }
                    continuation.finish()
                } catch {
                    continuation.finish(throwing: error)
                }
            }
        }
    }
}
