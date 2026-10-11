import SwiftUI

struct StatCard: View {
    let title: LocalizedStringKey
    let value: String
    let subtitle: String?
    let icon: String
    let color: Color

    init(title: LocalizedStringKey, value: String, subtitle: String? = nil,
         icon: String, color: Color = .brand) {
        self.title = title; self.value = value; self.subtitle = subtitle
        self.icon = icon; self.color = color
    }

    var body: some View {
        CardView {
            VStack(alignment: .leading, spacing: 10) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .fill(color.opacity(0.15))
                        .frame(width: 36, height: 36)
                    Image(systemName: icon)
                        .foregroundStyle(color)
                        .font(.system(size: 15, weight: .medium))
                }
                Text(value)
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .monospacedDigit()
                Text(title)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                if let subtitle {
                    Text(subtitle)
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                        .lineLimit(1)
                }
            }
        }
    }
}
