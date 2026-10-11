import SwiftUI

enum OptionState { case unanswered, selected, correct, incorrect }

struct QuestionOptionRow: View {
    let label: String           // "A", "B", "C", "D"
    let text: String
    let state: OptionState
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(circleColor)
                        .frame(width: 36, height: 36)
                    Text(label)
                        .font(.headline)
                        .foregroundStyle(labelColor)
                }
                Text(text)
                    .font(.body)
                    .foregroundStyle(.primary)
                    .multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
                Spacer()
                if state == .correct {
                    Image(systemName: "checkmark").foregroundStyle(.green)
                } else if state == .incorrect {
                    Image(systemName: "xmark").foregroundStyle(.red)
                }
            }
            .padding()
            .background(rowBackground)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(borderColor, lineWidth: state == .unanswered ? 0 : 1.5)
            )
        }
        .buttonStyle(.plain)
        .disabled(state == .correct || state == .incorrect)
    }

    private var circleColor: Color {
        switch state {
        case .unanswered: return Color(.systemGray5)
        case .selected: return Color.accentColor
        case .correct: return .green
        case .incorrect: return .red
        }
    }
    private var labelColor: Color { state == .unanswered ? .primary : .white }
    private var rowBackground: Color {
        switch state {
        case .unanswered: return Color(.systemGray6)
        case .selected: return Color.accentColor.opacity(0.08)
        case .correct: return .green.opacity(0.08)
        case .incorrect: return .red.opacity(0.08)
        }
    }
    private var borderColor: Color {
        switch state {
        case .unanswered: return .clear
        case .selected: return Color.accentColor
        case .correct: return .green
        case .incorrect: return .red
        }
    }
}
