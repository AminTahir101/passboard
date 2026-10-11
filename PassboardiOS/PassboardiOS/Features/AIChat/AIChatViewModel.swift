import SwiftUI

@Observable
@MainActor
final class AIChatViewModel {
    var conversations: [AiConversation] = []
    var messages: [AiMessage] = []
    var inputText: String = ""
    var isStreaming: Bool = false
    var streamingContent: String = ""
    var error: String? = nil
    var selectedConversationId: String? = nil

    private let service: AIChatServiceProtocol

    init(service: AIChatServiceProtocol = AIChatService()) {
        self.service = service
    }

    func loadConversations(userId: String) async {
        do { conversations = try await service.fetchConversations(userId: userId) }
        catch { self.error = error.localizedDescription }
    }

    func selectConversation(_ id: String) async {
        selectedConversationId = id
        do { messages = try await service.fetchMessages(conversationId: id) }
        catch { self.error = error.localizedDescription }
    }

    func newConversation(userId: String, questionId: String? = nil) async {
        do {
            let conv = try await service.createConversation(userId: userId, questionId: questionId, title: nil)
            conversations.insert(conv, at: 0)
            await selectConversation(conv.id)
        } catch { self.error = error.localizedDescription }
    }

    func sendMessage(userId: String) async {
        guard !inputText.trimmingCharacters(in: .whitespaces).isEmpty,
              let convId = selectedConversationId else { return }
        let text = inputText
        inputText = ""

        let userMsg = AiMessage(id: UUID().uuidString, conversationId: convId,
                                role: .user, content: text, createdAt: ISO8601DateFormatter().string(from: Date()))
        messages.append(userMsg)
        _ = try? await service.sendMessage(conversationId: convId, content: text)

        isStreaming = true
        streamingContent = ""
        do {
            for try await token in service.streamResponse(conversationId: convId, userMessage: text) {
                streamingContent += token
            }
        } catch {
            self.error = error.localizedDescription
        }
        let assistantMsg = AiMessage(id: UUID().uuidString, conversationId: convId,
                                     role: .assistant, content: streamingContent,
                                     createdAt: ISO8601DateFormatter().string(from: Date()))
        messages.append(assistantMsg)
        streamingContent = ""
        isStreaming = false
    }
}
