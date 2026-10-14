import SwiftUI

struct SidebarView: View {
    @Binding var selection: AppTab

    var body: some View {
        List(AppTab.allCases, selection: $selection) { tab in
            Label(tab.titleKey, systemImage: tab.icon)
                .tag(tab)
        }
        .navigationTitle("Passboard")
        .listStyle(.sidebar)
    }
}
