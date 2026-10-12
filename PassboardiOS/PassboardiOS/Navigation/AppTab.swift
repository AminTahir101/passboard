import SwiftUI

enum AppTab: String, CaseIterable, Identifiable {
    case dashboard, practice, mockExam, aiChat, studyPlan, profile

    var id: String { rawValue }

    var titleKey: LocalizedStringKey {
        switch self {
        case .dashboard: return "nav.dashboard"
        case .practice:  return "nav.practice"
        case .mockExam:  return "nav.mockExam"
        case .aiChat:    return "nav.aiChat"
        case .studyPlan: return "nav.studyPlan"
        case .profile:   return "nav.profile"
        }
    }

    var icon: String {
        switch self {
        case .dashboard: return "square.grid.2x2.fill"
        case .practice:  return "doc.text.fill"
        case .mockExam:  return "clock.fill"
        case .aiChat:    return "bubble.left.and.bubble.right.fill"
        case .studyPlan: return "calendar"
        case .profile:   return "person.circle.fill"
        }
    }
}
