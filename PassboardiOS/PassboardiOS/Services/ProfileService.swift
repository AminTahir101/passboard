import Supabase
import Foundation

final class ProfileService: ProfileServiceProtocol {
    func fetchProfile(userId: String) async throws -> Profile {
        let profiles: [Profile] = try await supabase
            .from("profiles").select().eq("id", value: userId).limit(1).execute().value
        guard let profile = profiles.first else { throw AppError.notFound }
        return profile
    }

    func fetchStats(userId: String) async throws -> UserStats {
        // Total attempts
        let total = try await supabase
            .from("question_attempts")
            .select("id", head: true, count: .exact)
            .eq("user_id", value: userId)
            .execute()
            .count ?? 0
        // Correct attempts
        let correct = try await supabase
            .from("question_attempts")
            .select("id", head: true, count: .exact)
            .eq("user_id", value: userId)
            .eq("is_correct", value: true)
            .execute()
            .count ?? 0
        let accuracy = total > 0 ? Double(correct) / Double(total) : 0.0
        return UserStats(totalAttempts: total, correctAttempts: correct, accuracy: accuracy, streak: 0)
    }

    func fetchTodaysTasks(planId: String) async throws -> [StudyTask] {
        let today = ISO8601DateFormatter.localDate(Date())
        let tasks: [StudyTask] = try await supabase
            .from("study_tasks")
            .select()
            .eq("plan_id", value: planId)
            .eq("scheduled_date", value: today)
            .order("position")
            .execute()
            .value
        return tasks
    }
}

enum AppError: Error {
    case notFound
    case unauthorized
}

extension ISO8601DateFormatter {
    static func localDate(_ date: Date) -> String {
        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd"
        return fmt.string(from: date)
    }
}
