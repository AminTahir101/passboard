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
        case .dashboard: return "square.grid.2x2"
        case .practice: return "doc.text"
        case .mockExam: return "clock"
        case .studyPlan: return "calendar"
        case .aiChat: return "bubble.left.and.bubble.right"
        case .profile: return "person.circle"
        }
    }
}
