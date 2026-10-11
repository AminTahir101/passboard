import Supabase
import Foundation

final class QuestionService: QuestionServiceProtocol {
    func fetchPublished(exam: String?, category: String?, topic: String?, count: Int) async throws -> [Question] {
        var query = supabase
            .from("questions")
            .select()
            .eq("status", value: "published")
        if let exam { query = query.eq("exam", value: exam) }
        if let category { query = query.eq("category", value: category) }
        if let topic { query = query.eq("topic", value: topic) }
        let questions: [Question] = try await query.limit(count).execute().value
        return questions.shuffled()
    }

    func fetchIncorrect(userId: String, count: Int) async throws -> [Question] {
        // Fetch question IDs the user got wrong most recently
        struct AttemptRow: Decodable {
            let questionId: String
            enum CodingKeys: String, CodingKey { case questionId = "question_id" }
        }
        let attempts: [AttemptRow] = try await supabase
            .from("question_attempts")
            .select("question_id")
            .eq("user_id", value: userId)
            .eq("is_correct", value: false)
            .order("attempted_at", ascending: false)
            .limit(count * 3)
            .execute()
            .value
        let ids = Array(Set(attempts.map(\.questionId).prefix(count)))
        guard !ids.isEmpty else { return [] }
        let questions: [Question] = try await supabase
            .from("questions")
            .select()
            .in("id", values: ids)
            .execute()
            .value
        return Array(questions.shuffled().prefix(count))
    }

    func fetchCategories(exam: String?) async throws -> [String] {
        struct Row: Decodable { let category: String? }
        var query = supabase.from("questions").select("category").eq("status", value: "published")
        if let exam { query = query.eq("exam", value: exam) }
        let rows: [Row] = try await query.execute().value
        return Array(Set(rows.compactMap(\.category))).sorted()
    }

    func fetchTopics(category: String?) async throws -> [String] {
        struct Row: Decodable { let topic: String? }
        var query = supabase.from("questions").select("topic").eq("status", value: "published")
        if let category { query = query.eq("category", value: category) }
        let rows: [Row] = try await query.execute().value
        return Array(Set(rows.compactMap(\.topic))).sorted()
    }

    func recordAttempt(_ attempt: NewQuestionAttempt) async throws {
        try await supabase.from("question_attempts").insert(attempt).execute()
    }

    func completeStudyTask(id: String) async throws {
        struct Payload: Encodable {
            let completed: Bool
            let completed_at: String
        }
        let now = ISO8601DateFormatter().string(from: Date())
        try await supabase
            .from("study_tasks")
            .update(Payload(completed: true, completed_at: now))
            .eq("id", value: id)
            .execute()
    }
}
