import SwiftUI

struct StudyPlanView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = StudyPlanViewModel()
    @State private var expandedWeek: String? = nil

    var body: some View {
        Group {
            if viewModel.hasNoPlan {
                noPlaceholder
            } else {
                planContent
            }
        }
        .background(Color.appBackground.ignoresSafeArea())
        .navigationBarHidden(true)
        .overlay { LoadingOverlay(isLoading: viewModel.isLoading) }
        .task {
            guard let uid = appState.session?.user.id.uuidString else { return }
            await viewModel.load(userId: uid)
            let today = DateFormatter.yyyyMMdd.string(from: Date())
            expandedWeek = viewModel.tasksByWeek.first(where: {
                $0.tasks.contains(where: { $0.scheduledDate == today })
            })?.key
        }
    }

    // MARK: - Empty State
    private var noPlaceholder: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Title
                VStack(alignment: .leading, spacing: 4) {
                    Text(LocalizedStringKey("nav.studyPlan"))
                        .font(.system(size: 28, weight: .bold))
                        .foregroundStyle(.white)
                    Text(LocalizedStringKey("studyPlan.subtitle"))
                        .font(.subheadline)
                        .foregroundStyle(Color.mutedForeground)
                }
                .padding(.top, 8)

                // Empty state card
                VStack(spacing: 16) {
                    IconBox(systemName: "calendar.badge.plus", size: 56)
                    Text(LocalizedStringKey("studyPlan.noPlan"))
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(.white)
                    Text(LocalizedStringKey("studyPlan.noPlanDesc"))
                        .font(.subheadline)
                        .foregroundStyle(Color.mutedForeground)
                        .multilineTextAlignment(.center)
                    NavigationLink { StudyPlanSetupView() } label: {
                        Label(LocalizedStringKey("studyPlan.createPlan"), systemImage: "plus")
                    }
                    .buttonStyle(BrandButtonStyle())
                    .padding(.top, 4)
                }
                .padding(24)
                .frame(maxWidth: .infinity)
                .background(Color.cardSurface)
                .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 20, style: .continuous).strokeBorder(Color.cardBorder, lineWidth: 1))

                // How it works
                VStack(alignment: .leading, spacing: 10) {
                    Text(LocalizedStringKey("studyPlan.howItWorks"))
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.mutedForeground)
                        .textCase(.uppercase)
                        .tracking(0.8)

                    VStack(spacing: 8) {
                        HowItWorksRow(number: 1, textKey: "studyPlan.step1")
                        HowItWorksRow(number: 2, textKey: "studyPlan.step2")
                        HowItWorksRow(number: 3, textKey: "studyPlan.step3")
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
    }

    // MARK: - Plan Content
    private var planContent: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Title row with edit button
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(LocalizedStringKey("nav.studyPlan"))
                            .font(.system(size: 28, weight: .bold))
                            .foregroundStyle(.white)
                        Text(LocalizedStringKey("studyPlan.subtitle"))
                            .font(.subheadline)
                            .foregroundStyle(Color.mutedForeground)
                    }
                    Spacer()
                    NavigationLink { StudyPlanSetupView() } label: {
                        Text(LocalizedStringKey("studyPlan.edit"))
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(Color.brand)
                    }
                }
                .padding(.top, 8)

                // Stats
                HStack(spacing: 12) {
                    if let days = viewModel.daysToExam {
                        PlanStatTile(value: "\(days)", label: LocalizedStringKey("dashboard.daysToExam"))
                    }
                    PlanStatTile(value: "\(Int(viewModel.progress * 100))%", label: LocalizedStringKey("studyPlan.progress"))
                    if !viewModel.missedTasks.isEmpty {
                        PlanStatTile(value: "\(viewModel.missedTasks.count)", label: LocalizedStringKey("studyPlan.missed"), accent: true)
                    }
                }

                // Today's tasks
                if !viewModel.todaysTasks.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        SectionHeading("studyPlan.today")
                        ForEach(viewModel.todaysTasks) { task in
                            StudyTaskRow(task: task, onToggle: {
                                Task { await viewModel.toggleTask(task.id) }
                            })
                        }
                    }
                }

                // Week accordion
                VStack(alignment: .leading, spacing: 8) {
                    SectionHeading("studyPlan.calendar")
                    ForEach(viewModel.tasksByWeek, id: \.key) { week in
                        WeekAccordion(
                            weekKey: week.key,
                            tasks: week.tasks,
                            isExpanded: expandedWeek == week.key,
                            onToggle: { expandedWeek = expandedWeek == week.key ? nil : week.key },
                            onTaskToggle: { id in Task { await viewModel.toggleTask(id) } }
                        )
                    }
                }

                Spacer().frame(height: 20)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
    }
}

// MARK: - How It Works Row
private struct HowItWorksRow: View {
    let number: Int
    let textKey: LocalizedStringKey
    init(number: Int, textKey: String) {
        self.number = number; self.textKey = LocalizedStringKey(textKey)
    }
    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .strokeBorder(Color.brand, lineWidth: 1.5)
                    .frame(width: 32, height: 32)
                Text("\(number)")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(Color.brand)
            }
            Text(textKey)
                .font(.subheadline)
                .foregroundStyle(.white)
            Spacer()
        }
        .padding(14)
        .background(Color.cardSurface)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).strokeBorder(Color.cardBorder, lineWidth: 1))
    }
}

// MARK: - Plan Stat Tile
private struct PlanStatTile: View {
    let value: String
    let label: LocalizedStringKey
    var accent: Bool = false
    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(accent ? .red : .white)
            Text(label)
                .font(.caption)
                .foregroundStyle(Color.mutedForeground)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(Color.cardSurface)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).strokeBorder(Color.cardBorder, lineWidth: 1))
    }
}

// MARK: - Section Heading
private struct SectionHeading: View {
    let key: LocalizedStringKey
    init(_ key: String) { self.key = LocalizedStringKey(key) }
    var body: some View {
        Text(key)
            .font(.headline)
            .foregroundStyle(.white)
    }
}

// MARK: - Study Task Row
private struct StudyTaskRow: View {
    let task: StudyTask
    let onToggle: () -> Void
    var body: some View {
        HStack {
            Button(action: onToggle) {
                Image(systemName: task.completed ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(task.completed ? Color.brand : Color.mutedForeground)
                    .font(.title3)
            }
            .buttonStyle(.plain)
            VStack(alignment: .leading, spacing: 2) {
                Text(task.taskType.rawValue.capitalized)
                    .font(.subheadline.bold())
                    .foregroundStyle(.white)
                Text(task.specialty ?? "General")
                    .font(.caption)
                    .foregroundStyle(Color.mutedForeground)
                Text("\(task.questionCount) questions")
                    .font(.caption)
                    .foregroundStyle(Color.mutedForeground)
            }
            Spacer()
            if !task.completed {
                NavigationLink(LocalizedStringKey("common.start")) {
                    PracticeSetupView(planTaskId: task.id, presetCount: task.questionCount,
                                     presetCategory: task.specialty)
                }
                .buttonStyle(.borderedProminent)
                .tint(Color.brand)
                .controlSize(.small)
            }
        }
        .padding(14)
        .background(Color.cardSurface)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).strokeBorder(Color.cardBorder, lineWidth: 1))
    }
}

// MARK: - Week Accordion
private struct WeekAccordion: View {
    let weekKey: String
    let tasks: [StudyTask]
    let isExpanded: Bool
    let onToggle: () -> Void
    let onTaskToggle: (String) -> Void

    var body: some View {
        VStack(spacing: 0) {
            Button(action: onToggle) {
                HStack {
                    Text(weekLabel)
                        .font(.subheadline.bold())
                        .foregroundStyle(.white)
                    Spacer()
                    Text("\(tasks.filter(\.completed).count)/\(tasks.count)")
                        .font(.caption)
                        .foregroundStyle(Color.mutedForeground)
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .foregroundStyle(Color.mutedForeground)
                        .font(.caption.weight(.semibold))
                }
                .padding(14)
                .background(Color.cardSurface)
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(Color.cardBorder, lineWidth: 1))
            }
            .buttonStyle(.plain)

            if isExpanded {
                VStack(spacing: 8) {
                    ForEach(tasks) { task in
                        StudyTaskRow(task: task) { onTaskToggle(task.id) }
                    }
                }
                .padding(.top, 8)
            }
        }
    }

    private var weekLabel: String {
        guard let firstDate = tasks.first.flatMap({ DateFormatter.yyyyMMdd.date(from: $0.scheduledDate) }),
              let lastDate = tasks.last.flatMap({ DateFormatter.yyyyMMdd.date(from: $0.scheduledDate) })
        else { return weekKey }
        let fmt = DateFormatter(); fmt.dateFormat = "MMM d"
        return "\(weekKey) · \(fmt.string(from: firstDate)) – \(fmt.string(from: lastDate))"
    }
}
