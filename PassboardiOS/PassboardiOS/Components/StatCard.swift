import SwiftUI

struct StatCard: View {
    let title: LocalizedStringKey
    let value: String
    let subtitle: String?
    let icon: String
    let color: Color

    init(title: LocalizedStringKey, value: String, subtitle: String? = nil,
         icon: String, color: Color = Color.accentColor) {
        self.title = title; self.value = value; self.subtitle = subtitle
        self.icon = icon; self.color = color
    }

    var body: some View {
        CardView {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: icon)
                        .foregroundStyle(color)
                        .font(.title3)
                    Spacer()
                }
                Text(value)
                    .font(.title.bold())
                Text(title)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                if let subtitle {
                    Text(subtitle)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
    }
}
