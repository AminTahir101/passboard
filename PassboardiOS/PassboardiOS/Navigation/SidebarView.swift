import SwiftUI

struct SidebarView: View {
    @Binding var selection: AppTab

    var body: some View {
        ScrollView {
            VStack(spacing: 4) {
                // Branding header
                HStack(spacing: 10) {
                    Image(systemName: "waveform.path.ecg")
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundStyle(Color.brand)
                    Text("Passboard.ai")
                        .font(.title3.bold())
                        .foregroundStyle(.white)
                    Spacer()
                }
                .padding(.horizontal, 20)
                .padding(.top, 28)
                .padding(.bottom, 24)

                // Nav items
                ForEach(AppTab.allCases) { tab in
                    SidebarRow(tab: tab, isSelected: selection == tab)
                        .onTapGesture { selection = tab }
                }
            }
            .padding(.horizontal, 12)
            .padding(.bottom, 24)
        }
        .background(Color.appBackground)
        .scrollContentBackground(.hidden)
    }
}

private struct SidebarRow: View {
    let tab: AppTab
    let isSelected: Bool

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: tab.icon)
                .font(.system(size: 17, weight: .medium))
                .foregroundStyle(isSelected ? Color.brand : Color.mutedForeground)
                .frame(width: 24)

            Text(tab.titleKey)
                .font(.system(size: 15, weight: isSelected ? .semibold : .regular))
                .foregroundStyle(isSelected ? .white : Color.mutedForeground)

            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 13)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(isSelected ? Color.brand.opacity(0.15) : Color.clear)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .strokeBorder(
                            isSelected ? Color.brand.opacity(0.35) : Color.clear,
                            lineWidth: 1
                        )
                )
        )
        .contentShape(Rectangle())
        .animation(.easeInOut(duration: 0.15), value: isSelected)
    }
}
