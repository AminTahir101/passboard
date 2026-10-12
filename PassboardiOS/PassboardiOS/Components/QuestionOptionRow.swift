import SwiftUI

enum OptionState { case unanswered, selected, correct, incorrect }

struct QuestionOptionRow: View {
    let label: String           // "A", "B", "C", "D"
    let text: String
    let state: OptionState
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 14) {
                // Letter circle
                ZStack {
                    Circle()
                        .fill(circleBackground)
                        .frame(width: 36, height: 36)
                    if state == .correct {
                        Image(systemName: "checkmark")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundStyle(.white)
                    } else if state == .incorrect {
                        Image(systemName: "xmark")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundStyle(.white)
                    } else {
                        Text(label)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(letterColor)
                    }
                }

                Text(text)
                    .font(.subheadline)
                    .foregroundStyle(textColor)
                    .multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(16)
            .background(rowBackground)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .strokeBorder(borderColor, lineWidth: 1.5)
            )
        }
        .buttonStyle(PressButtonStyle())
        .allowsHitTesting(state == .unanswered || state == .selected)
    }

    private var circleBackground: Color {
        switch state {
        case .unanswered: return Color.white.opacity(0.1)
        case .selected:   return Color.brand
        case .correct:    return Color.green
        case .incorrect:  return Color.red
        }
    }
    private var letterColor: Color {
        switch state {
        case .unanswered: return Color.mutedForeground
        case .selected:   return .white
        default:          return .white
        }
    }
    private var textColor: Color {
        switch state {
        case .unanswered: return .white
        case .selected:   return .white
        case .correct:    return .white
        case .incorrect:  return .white.opacity(0.7)
        }
    }
    private var rowBackground: Color {
        switch state {
        case .unanswered: return Color.cardSurface
        case .selected:   return Color.brand.opacity(0.1)
        case .correct:    return Color.green.opacity(0.15)
        case .incorrect:  return Color.red.opacity(0.12)
        }
    }
    private var borderColor: Color {
        switch state {
        case .unanswered: return Color.cardBorder
        case .selected:   return Color.brand.opacity(0.6)
        case .correct:    return Color.green
        case .incorrect:  return Color.red
        }
    }
}
