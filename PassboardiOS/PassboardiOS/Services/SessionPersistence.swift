import Foundation

// MARK: - Saved session model

struct SavedPracticeSession: Codable {
    let userId: String
    let questions: [Question]
    var currentIndex: Int
    var answers: [String: String]   // questionId → CorrectAnswer rawValue
    var correctCount: Int
    let startedAt: Date
    // Display info for the resume banner
    let mode: String
    let category: String?

    var questionsRemaining: Int { questions.count - currentIndex }
    var progressFraction: Double { Double(currentIndex) / Double(questions.count) }
}

// MARK: - Persistence

enum SessionPersistence {
    private static func key(userId: String) -> String { "passboard.practice.session.\(userId)" }

    static func save(_ session: SavedPracticeSession) {
        guard let data = try? JSONEncoder().encode(session) else { return }
        UserDefaults.standard.set(data, forKey: key(userId: session.userId))
    }

    static func load(userId: String) -> SavedPracticeSession? {
        guard let data = UserDefaults.standard.data(forKey: key(userId: userId)),
              let session = try? JSONDecoder().decode(SavedPracticeSession.self, from: data)
        else { return nil }
        // Discard sessions older than 7 days
        if Date().timeIntervalSince(session.startedAt) > 7 * 86400 {
            clear(userId: userId)
            return nil
        }
        return session
    }

    static func clear(userId: String) {
        UserDefaults.standard.removeObject(forKey: key(userId: userId))
    }

    static func hasSavedSession(userId: String) -> Bool {
        load(userId: userId) != nil
    }
}
