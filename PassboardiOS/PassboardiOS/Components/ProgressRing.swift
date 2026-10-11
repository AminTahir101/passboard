import SwiftUI

struct ProgressRing: View {
    let progress: Double  // 0.0 – 1.0
    let lineWidth: CGFloat
    let color: Color

    init(progress: Double, lineWidth: CGFloat = 8, color: Color = Color.accentColor) {
        self.progress = progress; self.lineWidth = lineWidth; self.color = color
    }

    var body: some View {
        ZStack {
            Circle()
                .stroke(color.opacity(0.2), lineWidth: lineWidth)
            Circle()
                .trim(from: 0, to: progress)
                .stroke(color, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut, value: progress)
        }
    }
}
