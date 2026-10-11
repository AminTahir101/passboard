import SwiftUI
struct PracticeSetupView: View {
    var planTaskId: String? = nil
    var presetCount: Int? = nil
    var presetCategory: String? = nil
    var body: some View { Text("Practice").navigationTitle(LocalizedStringKey("nav.practice")) }
}
