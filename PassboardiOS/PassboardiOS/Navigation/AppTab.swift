import SwiftUI

enum AppTab: String, CaseIterable, Identifiable {
    case dashboard, practice, mockExam, studyPlan, profile

    var id: String { rawValue }

    var titleKey: LocalizedStringKey {
        switch self {
        case .dashboard: return "nav.dashboard"
        case .practice: return "nav.practice"
        case .mockExam: return "nav.mockExam"
        case .studyPlan: return "nav.studyPlan"
        case .profile: return "nav.profile"
        }
    }

    var icon: String {
        switch self {
        case .dashboard: return "square.grid.2x2"
        case .practice: return "doc.text"
        case .mockExam: return "clock"
        case .studyPlan: return "calendar"
        case .profile: return "person.circle"
        }
    }
}
