import Foundation

enum TaskType: String, Codable { case practice, mock_exam, review }
enum PlanPhase: String, Codable { case foundation, reinforcement, final_review }

struct StudyPlan: Codable, Identifiable {
    let id: String
    let userId: String
    let exam: String
    let examDate: String
    let studyDays: [Int]
    let questionsPerDay: Int
    let mockDay: Int?
    let mockSize: Int?
    let focusSpecialties: [String]
    let createdAt: String
    let updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id, exam
        case userId = "user_id"
        case examDate = "exam_date"
        case studyDays = "study_days"
        case questionsPerDay = "questions_per_day"
        case mockDay = "mock_day"
        case mockSize = "mock_size"
        case focusSpecialties = "focus_specialties"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct StudyTask: Codable, Identifiable {
    let id: String
    let planId: String
    let userId: String
    let scheduledDate: String
    let taskType: TaskType
    let phase: PlanPhase
    let specialty: String?
    let questionCount: Int
    var completed: Bool
    var completedAt: String?
    let position: Int
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, specialty, position, completed
        case planId = "plan_id"
        case userId = "user_id"
        case scheduledDate = "scheduled_date"
        case taskType = "task_type"
        case phase
        case questionCount = "question_count"
        case completedAt = "completed_at"
        case createdAt = "created_at"
    }
}
