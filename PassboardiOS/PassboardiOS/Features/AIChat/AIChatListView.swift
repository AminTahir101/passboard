import SwiftUI

struct AIChatListView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = AIChatViewModel()
    @State private var navigateToNew = false

    var body: some View {
        ZStack(alignment: .top) {
            Color.appBackground.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Header
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(LocalizedStringKey("nav.aiChat"))
                                .font(.title.bold())
                                .foregroundStyle(.white)
                            Text(LocalizedStringKey("aiChat.subtitle"))
                                .font(.subheadline)
                                .foregroundStyle(Color.mutedForeground)
                        }
                        Spacer()
                        Button {
                            Task {
                                guard let uid = appState.session?.user.id.uuidString else { return }
                                await viewModel.newConversation(userId: uid)
                                navigateToNew = true
                            }
                        } label: {
                            ZStack {
                                Circle().fill(Color.brand).frame(width: 44, height: 44)
                                Image(systemName: "plus")
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundStyle(Color.black)
                            }
                        }
                        .accessibilityLabel(Text("New conversation"))
                    }
                    .padding(.top, 8)

                    // Ask anything bar
                    NavigationLink(destination: {
                        if let conv = viewModel.conversations.first {
                            AIChatView(conversationId: conv.id, viewModel: viewModel)
                        }
                    }) {
                        HStack {
                            Text(LocalizedStringKey("aiChat.askAnything"))
                                .font(.subheadline)
                                .foregroundStyle(Color.mutedForeground)
                            Spacer()
                            ZStack {
                                Circle().fill(Color.brand).frame(width: 32, height: 32)
                                Image(systemName: "arrow.up")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundStyle(Color.black)
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .background(Color.cardSurface)
                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                        .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).strokeBorder(Color.cardBorder, lineWidth: 1))
                    }
                    .buttonStyle(PressButtonStyle())

                    // Recent conversations
                    if !viewModel.conversations.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            SectionLabel("aiChat.recent")
                            VStack(spacing: 0) {
                                ForEach(Array(viewModel.conversations.enumerated()), id: \.element.id) { idx, conv in
                                    NavigationLink(destination: AIChatView(conversationId: conv.id, viewModel: viewModel)) {
                                        ConversationRow(conversation: conv)
                                    }
                                    .buttonStyle(PressButtonStyle())
                                    if idx < viewModel.conversations.count - 1 {
                                        Divider().background(Color.cardBorder).padding(.leading, 56)
                                    }
                                }
                            }
                            .background(Color.cardSurface)
                            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).strokeBorder(Color.cardBorder, lineWidth: 1))
                        }
                    }

                    Spacer().frame(height: 20)
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
            }
        }
        .navigationBarHidden(true)
        .navigationDestination(isPresented: $navigateToNew) {
            if let conv = viewModel.conversations.first {
                AIChatView(conversationId: conv.id, viewModel: viewModel)
            }
        }
        .task {
            guard let uid = appState.session?.user.id.uuidString else { return }
            await viewModel.loadConversations(userId: uid)
        }
    }
}

// MARK: - Conversation Row
private struct ConversationRow: View {
    let conversation: AiConversation
    var body: some View {
        HStack(spacing: 14) {
            IconBox(systemName: "bubble.left.and.bubble.right.fill", size: 36)
            VStack(alignment: .leading, spacing: 3) {
                Text(conversation.title ?? NSLocalizedString("aiChat.newConversation", comment: ""))
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white)
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)
                if conversation.questionId != nil {
                    Text(NSLocalizedString("aiChat.fromQuestion", comment: ""))
                        .font(.caption)
                        .foregroundStyle(Color.mutedForeground)
                }
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.mutedForeground)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 14)
    }
}
