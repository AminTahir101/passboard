import SwiftUI

@Observable
@MainActor
final class StudyPlanSetupViewModel {
    var exam = "SMLE"
    var examDate = ""
    var studyDays: Set<Int> = [0, 1, 2, 3, 4] // Sun-Thu
    var questionsPerDay: Int = 20
    var mockEnabled = false
    var mockDay: Int = 5
    var mockSize: Int = 50
    var selectedSpecialties: Set<String> = []
    var isLoading = false
    var saved = false
    var error: String? = nil

    private let studyPlanService: StudyPlanServiceProtocol

    init(studyPlanService: StudyPlanServiceProtocol = StudyPlanService()) {
        self.studyPlanService = studyPlanService
    }

    func save(userId: String) async {
        guard !examDate.isEmpty else { error = "Please select an exam date."; return }
        isLoading = true; error = nil
        let input = StudyPlanInput(
            exam: exam, examDate: examDate,
            studyDays: Array(studyDays).sorted(),
            questionsPerDay: questionsPerDay,
            mockDay: mockEnabled ? mockDay : nil,
            mockSize: mockEnabled ? mockSize : nil,
            focusSpecialties: Array(selectedSpecialties)
        )
        do {
            _ = try await studyPlanService.savePlan(input, userId: userId)
            saved = true
        } catch { self.error = error.localizedDescription }
        isLoading = false
    }
}

struct StudyPlanSetupView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = StudyPlanSetupViewModel()

    private let weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    private let exams = ["SMLE", "USMLE Step 1", "USMLE Step 2", "PLAB", "MRCPsych"]

    var body: some View {
        Form {
            Section(LocalizedStringKey("studyPlan.exam")) {
                Picker(LocalizedStringKey("studyPlan.exam"), selection: $viewModel.exam) {
                    ForEach(exams, id: \.self) { Text($0).tag($0) }
                }
                DatePicker(LocalizedStringKey("studyPlan.examDate"),
                           selection: Binding(
                            get: { DateFormatter.yyyyMMdd.date(from: viewModel.examDate) ?? Date() },
                            set: { viewModel.examDate = DateFormatter.yyyyMMdd.string(from: $0) }
                           ),
                           in: Date()...,
                           displayedComponents: .date)
            }

            Section(LocalizedStringKey("studyPlan.studyDays")) {
                HStack {
                    ForEach(0..<7, id: \.self) { day in
                        Button(weekdays[day]) {
                            if viewModel.studyDays.contains(day) { viewModel.studyDays.remove(day) }
                            else { viewModel.studyDays.insert(day) }
                        }
                        .buttonStyle(.bordered)
                        .tint(viewModel.studyDays.contains(day) ? Color.accentColor : .secondary)
                    }
                }
            }

            Section(LocalizedStringKey("studyPlan.questionsPerDay")) {
                Stepper("\(viewModel.questionsPerDay) \(NSLocalizedString("common.questions", comment: ""))",
                        value: $viewModel.questionsPerDay, in: 5...100, step: 5)
            }

            Section(LocalizedStringKey("studyPlan.mockExam")) {
                Toggle(LocalizedStringKey("studyPlan.includeMock"), isOn: $viewModel.mockEnabled)
                if viewModel.mockEnabled {
                    Picker(LocalizedStringKey("studyPlan.mockDay"), selection: $viewModel.mockDay) {
                        ForEach(0..<7, id: \.self) { Text(weekdays[$0]).tag($0) }
                    }
                    Picker(LocalizedStringKey("studyPlan.mockSize"), selection: $viewModel.mockSize) {
                        Text("50").tag(50); Text("100").tag(100)
                    }
                    .pickerStyle(.segmented)
                }
            }

            if let err = viewModel.error {
                Section { Text(err).foregroundStyle(.red).font(.caption) }
            }
        }
        .navigationTitle(LocalizedStringKey("studyPlan.setup"))
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(LocalizedStringKey("common.save")) {
                    Task {
                        guard let uid = appState.session?.user.id.uuidString else { return }
                        await viewModel.save(userId: uid)
                    }
                }
                .disabled(viewModel.isLoading)
            }
        }
        .overlay { LoadingOverlay(isLoading: viewModel.isLoading) }
        .navigationDestination(isPresented: $viewModel.saved) {
            StudyPlanView()
        }
    }
}
