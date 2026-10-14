import SwiftUI

enum AppTab: String, CaseIterable, Identifiable {
    case dashboard, practice, mockExam, studyPlan, aiChat, profile

    var id: String { rawValue }

    var titleKey: LocalizedStringKey {
        switch self {
        case .dashboard: return "nav.dashboard"
        case .practice: return "nav.practice"
        case .mockExam: return "nav.mockExam"
        case .studyPlan: return "nav.studyPlan"
        case .aiChat: return "nav.aiChat"
        case .profile: return "nav.profile"
        }
    }

    var icon: String {
        switch self {
        case .dashboard: return "square.grid.2x2.fill"
        case .practice: return "doc.text.fill"
        case .mockExam: return "checkmark.seal.fill"
        case .studyPlan: return "calendar"
        case .aiChat: return "bubble.left.and.bubble.right.fill"
        case .profile: return "person.circle.fill"
        }
    }

    var color: Color {
        switch self {
        case .dashboard: return .accentColor
        case .practice: return .blue
        case .mockExam: return .purple
        case .studyPlan: return .green
        case .aiChat: return .orange
        case .profile: return .teal
        }
    }
}
