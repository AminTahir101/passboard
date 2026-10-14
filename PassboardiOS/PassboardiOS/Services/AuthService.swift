import Supabase
import Foundation

final class AuthService: AuthServiceProtocol {
    func signIn(email: String, password: String) async throws {
        try await supabase.auth.signIn(email: email, password: password)
    }

    func signInWithApple(idToken: String, nonce: String) async throws {
        try await supabase.auth.signInWithIdToken(
            credentials: OpenIDConnectCredentials(
                provider: .apple,
                idToken: idToken,
                nonce: nonce
            )
        )
    }

    func signOut() async throws {
        try await supabase.auth.signOut()
    }

    func submitAccessRequest(_ input: AccessRequestInput) async throws {
        struct Payload: Encodable {
            let full_name: String
            let email: String
            let phone: String
            let target_exam: String
            let expected_exam_date: String
            let notes: String
        }
        let payload = Payload(
            full_name: input.fullName,
            email: input.email,
            phone: input.phone,
            target_exam: input.targetExam,
            expected_exam_date: input.expectedExamDate,
            notes: input.notes
        )
        try await supabase.from("access_requests").insert(payload).execute()
    }
}
