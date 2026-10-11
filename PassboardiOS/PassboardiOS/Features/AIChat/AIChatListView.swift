import SwiftUI

struct AIChatListView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = AIChatViewModel()

    var body: some View {
        List(viewModel.conversations) { conv in
            NavigationLink(conv.title ?? NSLocalizedString("aiChat.newConversation", comment: "")) {
                AIChatView(conversationId: conv.id, viewModel: viewModel)
            }
        }
        .navigationTitle(LocalizedStringKey("nav.aiChat"))
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(action: {
                    Task {
                        guard let uid = appState.session?.user.id.uuidString else { return }
                        await viewModel.newConversation(userId: uid)
                    }
                }) {
                    Image(systemName: "square.and.pencil")
                }
            }
        }
        .task {
            guard let uid = appState.session?.user.id.uuidString else { return }
            await viewModel.loadConversations(userId: uid)
        }
    }
}
