import SwiftUI

struct AIChatView: View {
    let conversationId: String
    @Bindable var viewModel: AIChatViewModel
    @Environment(AppState.self) private var appState
    @FocusState private var inputFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(viewModel.messages) { msg in
                            MessageBubble(message: msg)
                                .id(msg.id)
                        }
                        if viewModel.isStreaming && !viewModel.streamingContent.isEmpty {
                            MessageBubble(streamingContent: viewModel.streamingContent)
                                .id("streaming")
                        }
                    }
                    .padding()
                }
                .onChange(of: viewModel.messages.count) { _, _ in
                    withAnimation { proxy.scrollTo(viewModel.messages.last?.id) }
                }
                .onChange(of: viewModel.streamingContent) { _, _ in
                    withAnimation { proxy.scrollTo("streaming") }
                }
            }

            Divider()

            HStack(spacing: 8) {
                TextField(LocalizedStringKey("aiChat.placeholder"), text: $viewModel.inputText, axis: .vertical)
                    .lineLimit(1...5)
                    .padding(10)
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 20))
                    .focused($inputFocused)
                Button {
                    Task {
                        guard let uid = appState.session?.user.id.uuidString else { return }
                        await viewModel.sendMessage(userId: uid)
                    }
                } label: {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                        .foregroundStyle(viewModel.inputText.isEmpty ? .secondary : Color.accentColor)
                }
                .disabled(viewModel.inputText.isEmpty || viewModel.isStreaming)
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
        }
        .navigationTitle(LocalizedStringKey("nav.aiChat"))
        .task { await viewModel.selectConversation(conversationId) }
    }
}

private struct MessageBubble: View {
    var message: AiMessage? = nil
    var streamingContent: String? = nil

    private var isUser: Bool { message?.role == .user }
    private var content: String { message?.content ?? streamingContent ?? "" }

    var body: some View {
        HStack {
            if isUser { Spacer(minLength: 60) }
            Text(content)
                .padding(12)
                .background(isUser ? Color.accentColor : Color(.systemGray5))
                .foregroundStyle(isUser ? .white : .primary)
                .clipShape(RoundedRectangle(cornerRadius: 16))
            if !isUser { Spacer(minLength: 60) }
        }
        .frame(maxWidth: .infinity, alignment: isUser ? .trailing : .leading)
    }
}
