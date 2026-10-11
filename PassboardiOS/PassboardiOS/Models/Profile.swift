import Foundation

enum UserRole: String, Codable { case student, admin }
enum AccessStatus: String, Codable { case pending, active, suspended, expired }
enum Difficulty: String, Codable { case easy, medium, hard }
enum QuestionStatus: String, Codable { case draft, published, archived }
enum CorrectAnswer: String, Codable { case A, B, C, D }
enum MessageRole: String, Codable { case user, assistant, system }

struct Profile: Codable, Identifiable {
    let id: String
    var fullName: String?
    let email: String
    var phone: String?
    let role: UserRole
    var targetExam: String?
    var examDate: String?
    let accessStatus: AccessStatus
    let accessExpiresAt: String?
    let createdAt: String
    let updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id, email, phone, role
        case fullName = "full_name"
        case targetExam = "target_exam"
        case examDate = "exam_date"
        case accessStatus = "access_status"
        case accessExpiresAt = "access_expires_at"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct AccessRequest: Codable, Identifiable {
    let id: String
    let fullName: String
    let email: String
    let phone: String?
    let targetExam: String?
    let expectedExamDate: String?
    let notes: String?

    enum CodingKeys: String, CodingKey {
        case id, email, phone, notes
        case fullName = "full_name"
        case targetExam = "target_exam"
        case expectedExamDate = "expected_exam_date"
    }
}
