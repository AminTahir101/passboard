import SwiftUI

// MARK: - Brand Colors

extension Color {
    /// Amber #F2B632 — the single Passboard accent color.
    static let brand = Color("AccentColor")
    /// Deep navy #0D1520 — app background.
    static let appBackground = Color(red: 0.051, green: 0.082, blue: 0.125)
    /// Elevated card surface on navy background.
    static let cardSurface = Color(red: 0.098, green: 0.141, blue: 0.188)
    /// Subtle card border.
    static let cardBorder = Color.white.opacity(0.08)
    /// Muted secondary text.
    static let mutedForeground = Color.white.opacity(0.45)
}

// MARK: - Brand Primary Button
/// Amber fill, black text, press-scale animation.
struct BrandButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
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

// MARK: - Icon Box
/// Small amber-tinted icon in a rounded square — used in cards.
struct IconBox: View {
    let systemName: String
    var size: CGFloat = 36
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: size * 0.28, style: .continuous)
                .fill(Color.brand.opacity(0.18))
                .frame(width: size, height: size)
            Image(systemName: systemName)
                .font(.system(size: size * 0.42, weight: .medium))
                .foregroundStyle(Color.brand)
        }
    }
}
