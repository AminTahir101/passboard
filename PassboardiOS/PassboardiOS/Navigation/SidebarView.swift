import SwiftUI

struct SidebarView: View {
    @Binding var selection: AppTab

    var body: some View {
        List(AppTab.allCases, id: \.id) { tab in
            Label(tab.titleKey, systemImage: tab.icon)
                .tag(tab)
                .listRowBackground(selection == tab ? Color.accentColor.opacity(0.15) : Color.clear)
                .onTapGesture { selection = tab }
        }
        .navigationTitle("Passboard")
        .listStyle(.sidebar)
    }
}
