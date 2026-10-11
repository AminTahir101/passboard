import SwiftUI

// MARK: - Brand Colors

extension Color {
    /// Amber #F2B632 — the single Passboard accent color.
    static let brand = Color("AccentColor")
}

// MARK: - Brand Primary Button
/// Amber fill, black text, press-scale animation.
struct BrandButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(maxWidth: .infinity)
            .padding(.vertical, 15)
            .background(Color.brand.opacity(configuration.isPressed ? 0.78 : 1.0))
            .foregroundStyle(Color.black)
            .fontWeight(.semibold)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}

// MARK: - Press Feedback Style
/// Subtle scale + opacity for cards and secondary tappable surfaces.
struct PressButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .opacity(configuration.isPressed ? 0.80 : 1.0)
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}
