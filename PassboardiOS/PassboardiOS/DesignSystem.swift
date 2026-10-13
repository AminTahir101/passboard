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
    static let mutedForeground = Color.white.opacity(0.55)
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
            .onChange(of: configuration.isPressed) { _, isPressed in
                if isPressed {
                    let generator = UIImpactFeedbackGenerator(style: .medium)
                    generator.impactOccurred()
                }
            }
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

// MARK: - Section Label (shared)
/// Uppercase muted caption used as a section header throughout the app.
struct SectionLabel: View {
    let key: LocalizedStringKey
    init(_ key: String) { self.key = LocalizedStringKey(key) }
    var body: some View {
        Text(key)
            .font(.caption)
            .fontWeight(.semibold)
            .foregroundStyle(Color.mutedForeground)
            .textCase(.uppercase)
            .tracking(0.8)
    }
}

// MARK: - Passboard Logo Mark (shared)
/// Rounded-square amber ECG logo — matches the web SVG exactly.
struct PassboardLogoMark: View {
    var size: CGFloat = 88

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: size * 0.227, style: .continuous)
                .fill(Color.cardSurface)
                .frame(width: size, height: size)
            RoundedRectangle(cornerRadius: size * 0.227, style: .continuous)
                .strokeBorder(Color.brand.opacity(0.45), lineWidth: 1.5)
                .frame(width: size, height: size)
            ECGLogoShape()
                .stroke(Color.brand,
                        style: StrokeStyle(lineWidth: size * 0.034, lineCap: .round, lineJoin: .round))
                .frame(width: size * 0.72, height: size * 0.72)
        }
    }
}

/// Translated from web SVG viewBox="0 0 36 36"
/// points="3,18 7,18 9,9 12,27 15,18 18,18 20.5,23.5 29,11"
struct ECGLogoShape: Shape {
    func path(in rect: CGRect) -> Path {
        let w = rect.width, h = rect.height, s: CGFloat = 36
        func px(_ v: CGFloat) -> CGFloat { v / s * w }
        func py(_ v: CGFloat) -> CGFloat { v / s * h }
        var p = Path()
        p.move(to:    CGPoint(x: px(3),    y: py(18)))
        p.addLine(to: CGPoint(x: px(7),    y: py(18)))
        p.addLine(to: CGPoint(x: px(9),    y: py(9)))
        p.addLine(to: CGPoint(x: px(12),   y: py(27)))
        p.addLine(to: CGPoint(x: px(15),   y: py(18)))
        p.addLine(to: CGPoint(x: px(18),   y: py(18)))
        p.addLine(to: CGPoint(x: px(20.5), y: py(23.5)))
        p.addLine(to: CGPoint(x: px(29),   y: py(11)))
        return p
    }
}
