import Supabase
import Foundation

final class MockExamService: MockExamServiceProtocol {
    func createExam(userId: String, questionCount: Int) async throws -> (MockExam, [Question]) {
        // Insert exam row
        struct ExamPayload: Encodable {
            let user_id: String; let question_count: Int
        }
        let exam: MockExam = try await supabase
            .from("mock_exams")
            .insert(ExamPayload(user_id: userId, question_count: questionCount))
            .select()
            .single()
            .execute()
            .value

        // Fetch random published questions
        let questions: [Question] = try await supabase
            .from("questions")
            .select()
            .eq("status", value: "published")
            .limit(questionCount)
            .execute()
            .value

        // Insert mock_exam_questions junction rows
        struct JunctionRow: Encodable {
            let mock_exam_id: String; let question_id: String; let position: Int
        }
        let rows = questions.enumerated().map { i, q in
            JunctionRow(mock_exam_id: exam.id, question_id: q.id, position: i)
        }
        try await supabase.from("mock_exam_questions").insert(rows).execute()

        // Insert blank mock_answers rows
        struct AnswerRow: Encodable {
            let mock_exam_id: String; let question_id: String
        }
        let answerRows = questions.map { AnswerRow(mock_exam_id: exam.id, question_id: $0.id) }
        try await supabase.from("mock_answers").insert(answerRows).execute()

        return (exam, questions.shuffled())
    }

    func saveAnswer(mockExamId: String, questionId: String, answer: CorrectAnswer, isCorrect: Bool) async throws {
        struct Payload: Encodable { let selected_answer: String; let is_correct: Bool }
        try await supabase
            .from("mock_answers")
            .update(Payload(selected_answer: answer.rawValue, is_correct: isCorrect))
            .eq("mock_exam_id", value: mockExamId)
            .eq("question_id", value: questionId)
            .execute()
    }

    func completeExam(id: String, score: Int, percentage: Double, durationSeconds: Int) async throws {
        struct Payload: Encodable {
            let completed_at: String; let score: Int
            let percentage: Double; let duration_seconds: Int
        }
        try await supabase
            .from("mock_exams")
            .update(Payload(completed_at: ISO8601DateFormatter().string(from: Date()),
                            score: score, percentage: percentage, duration_seconds: durationSeconds))
            .eq("id", value: id)
            .execute()
    }

    func fetchExamHistory(userId: String) async throws -> [MockExam] {
        try await supabase
            .from("mock_exams")
            .select()
            .eq("user_id", value: userId)
            .not("completed_at", operator: .is, value: "null")
            .order("started_at", ascending: false)
            .execute()
            .value
    }
}
