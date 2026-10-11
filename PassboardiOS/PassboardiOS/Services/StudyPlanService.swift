import Supabase
import Foundation

final class StudyPlanService: StudyPlanServiceProtocol {
    func fetchPlan(userId: String) async throws -> StudyPlan? {
        let plans: [StudyPlan] = try await supabase
            .from("study_plans").select().eq("user_id", value: userId).limit(1).execute().value
        return plans.first
    }

    func fetchTasks(planId: String) async throws -> [StudyTask] {
        try await supabase
            .from("study_tasks").select()
            .eq("plan_id", value: planId)
            .order("scheduled_date")
            .order("position")
            .execute().value
    }

    func savePlan(_ input: StudyPlanInput, userId: String) async throws -> StudyPlan {
        let body: [String: Any] = [
            "exam": input.exam,
            "examDate": input.examDate,
            "studyDays": input.studyDays,
            "questionsPerDay": input.questionsPerDay,
            "mockDay": input.mockDay as Any,
            "mockSize": input.mockSize as Any,
            "focusSpecialties": input.focusSpecialties
        ]
        let data = try JSONSerialization.data(withJSONObject: body)
        struct Response: Decodable { let plan: StudyPlan }
        let result: Response = try await supabase.functions.invoke(
            "study-plan",
            options: FunctionInvokeOptions(body: data)
        )
        return result.plan
    }

    func completeTask(id: String) async throws {
        struct Payload: Encodable { let completed: Bool; let completed_at: String }
        try await supabase
            .from("study_tasks")
            .update(Payload(completed: true, completed_at: ISO8601DateFormatter().string(from: Date())))
            .eq("id", value: id).execute()
    }
}
