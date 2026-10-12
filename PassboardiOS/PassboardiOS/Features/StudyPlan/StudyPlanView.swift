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

    // MARK: - Plan Content (redesigned)
    private var planContent: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Title + Edit
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(LocalizedStringKey("nav.studyPlan"))
                            .font(.title.bold())
                            .foregroundStyle(.white)
                        if let plan = viewModel.plan,
                           let date = DateFormatter.yyyyMMdd.date(from: plan.examDate) {
                            Text(examDateLabel(date))
                                .font(.subheadline)
                                .foregroundStyle(Color.mutedForeground)
                        }
                    }
                    Spacer()
                    NavigationLink(destination: StudyPlanSetupView()) {
                        HStack(spacing: 5) {
                            Image(systemName: "pencil")
                                .font(.caption.weight(.semibold))
                            Text(LocalizedStringKey("studyPlan.edit"))
                                .font(.subheadline.weight(.semibold))
                        }
                        .foregroundStyle(Color.black)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(Color.brand)
                        .clipShape(Capsule())
                    }
                }
                .padding(.top, 8)

                // Countdown card
                CountdownCard(
                    daysToExam: viewModel.daysToExam ?? 0,
                    doneTasks: viewModel.tasks.filter(\.completed).count,
                    totalTasks: viewModel.tasks.count,
                    progress: viewModel.progress,
                    missedCount: viewModel.missedTasks.count,
                    missedDate: viewModel.missedTasks.first?.scheduledDate
                )

                // Today's tasks
                if !viewModel.todaysTasks.isEmpty {
                    TodaySectionView(tasks: viewModel.todaysTasks)
                }

                // This week
                ThisWeekSectionView(
                    tasksByWeek: viewModel.tasksByWeek,
                    examDate: viewModel.plan?.examDate
                )

                Spacer().frame(height: 20)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
    }

    private func examDateLabel(_ date: Date) -> String {
        let fmt = DateFormatter()
        fmt.dateFormat = "EEE, MMM d"
        return "Your exam is on \(fmt.string(from: date))."
    }
}

// MARK: - Countdown Card
private struct CountdownCard: View {
    let daysToExam: Int
    let doneTasks: Int
    let totalTasks: Int
    let progress: Double
    let missedCount: Int
    let missedDate: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .firstTextBaseline, spacing: 8) {
                Text("\(daysToExam)")
                    .font(.system(size: 52, weight: .bold))
                    .foregroundStyle(Color.brand)
                Text(LocalizedStringKey("dashboard.daysToExam"))
                    .font(.headline)
                    .foregroundStyle(.white)
                Spacer()
                Text("\(doneTasks) of \(totalTasks) done")
                    .font(.caption)
                    .foregroundStyle(Color.mutedForeground)
            }

            ProgressView(value: max(0, min(1, progress)))
                .tint(Color.brand)
                .frame(height: 4)
                .clipShape(Capsule())

            if missedCount > 0 {
                HStack(spacing: 10) {
                    Image(systemName: "info.circle.fill")
                        .foregroundStyle(Color.brand)
                    Text("\(missedCount) missed session\(missedCount > 1 ? "s" : "")\(missedDateStr)")
                        .font(.subheadline)
                        .foregroundStyle(.white)
                    Spacer()
                    NavigationLink(destination: StudyPlanSetupView()) {
                        Text("Catch up")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Color.black)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(Color.brand)
                            .clipShape(Capsule())
                    }
                }
                .padding(12)
                .background(Color.brand.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
        .padding(16)
        .background(Color.cardSurface)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 20, style: .continuous).strokeBorder(Color.cardBorder, lineWidth: 1))
    }

    private var missedDateStr: String {
        guard let ds = missedDate,
              let date = DateFormatter.yyyyMMdd.date(from: ds) else { return "" }
        let fmt = DateFormatter(); fmt.dateFormat = " · MMM d"
        return fmt.string(from: date)
    }
}

// MARK: - Today Section
private struct TodaySectionView: View {
    let tasks: [StudyTask]
    private var todayLabel: String {
        let fmt = DateFormatter(); fmt.dateFormat = "EEE, MMM d"
        return fmt.string(from: Date())
    }
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 6) {
                Text("Today")
                    .font(.headline.bold())
                    .foregroundStyle(.white)
                Text("· \(todayLabel)")
                    .font(.subheadline)
                    .foregroundStyle(Color.mutedForeground)
            }
            ForEach(tasks) { task in
                TodayTaskCard(task: task)
            }
        }
    }
}

// MARK: - Today Task Card
private struct TodayTaskCard: View {
    let task: StudyTask
    var body: some View {
        VStack(spacing: 14) {
            HStack(spacing: 14) {
                IconBox(systemName: "doc.text.fill", size: 40)
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(task.taskType.rawValue.capitalized) · \(task.specialty ?? "General")")
                        .font(.headline.bold())
                        .foregroundStyle(.white)
                    Text("\(task.questionCount) questions")
                        .font(.subheadline)
                        .foregroundStyle(Color.mutedForeground)
                }
                Spacer()
            }
            NavigationLink(destination: PracticeSetupView(
                planTaskId: task.id,
                presetCount: task.questionCount,
                presetCategory: task.specialty
            )) {
                HStack(spacing: 6) {
                    Text(LocalizedStringKey("studyPlan.startSession"))
                    Image(systemName: "arrow.right")
                        .font(.subheadline.weight(.semibold))
                }
            }
            .buttonStyle(BrandButtonStyle())
        }
        .padding(16)
        .background(Color.cardSurface)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).strokeBorder(Color.brand.opacity(0.4), lineWidth: 1.5))
    }
}

// MARK: - This Week Section
private struct ThisWeekSectionView: View {
    let tasksByWeek: [(key: String, tasks: [StudyTask])]
    let examDate: String?

    private var currentWeekTasks: [StudyTask] {
        let today = DateFormatter.yyyyMMdd.string(from: Date())
        let cal = Calendar(identifier: .iso8601)
        guard let todayDate = DateFormatter.yyyyMMdd.date(from: today) else { return [] }
        let weekOfYear = cal.component(.weekOfYear, from: todayDate)
        let year = cal.component(.yearForWeekOfYear, from: todayDate)
        let weekKey = String(format: "%04d-W%02d", year, weekOfYear)
        return tasksByWeek.first(where: { $0.key == weekKey })?.tasks ?? []
    }

    private var weekRangeLabel: String {
        let tasks = currentWeekTasks
        guard let first = tasks.first.flatMap({ DateFormatter.yyyyMMdd.date(from: $0.scheduledDate) }),
              let last = tasks.last.flatMap({ DateFormatter.yyyyMMdd.date(from: $0.scheduledDate) }) else {
            let fmt = DateFormatter(); fmt.dateFormat = "MMM d"
            let now = Date()
            let end = Calendar.current.date(byAdding: .day, value: 6, to: now) ?? now
            return "\(fmt.string(from: now)) – \(fmt.string(from: end))"
        }
        let fmt = DateFormatter(); fmt.dateFormat = "MMM d"
        return "\(fmt.string(from: first)) – \(fmt.string(from: last))"
    }

    private var doneCount: Int { currentWeekTasks.filter(\.completed).count }

    var body: some View {
        let tasks = currentWeekTasks
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                HStack(spacing: 6) {
                    Text("This week")
                        .font(.headline.bold())
                        .foregroundStyle(.white)
                    Text("· \(weekRangeLabel)")
                        .font(.subheadline)
                        .foregroundStyle(Color.mutedForeground)
                }
                Spacer()
                Text("\(doneCount)/\(tasks.count)")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Color.mutedForeground)
            }

            VStack(spacing: 0) {
                ForEach(Array(tasks.enumerated()), id: \.element.id) { idx, task in
                    WeekDayRow(task: task, examDate: examDate)
                    if idx < tasks.count - 1 {
                        Divider()
                            .background(Color.cardBorder)
                            .padding(.leading, 60)
                    }
                }
                // Exam day row if applicable
                if let examDs = examDate,
                   tasks.contains(where: { sameWeek($0.scheduledDate, examDs) }) {
                    Divider().background(Color.cardBorder).padding(.leading, 60)
                    ExamDayRow(dateString: examDs)
                }
            }
            .background(Color.cardSurface)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).strokeBorder(Color.cardBorder, lineWidth: 1))
        }
    }

    private func sameWeek(_ d1: String, _ d2: String) -> Bool {
        guard let date1 = DateFormatter.yyyyMMdd.date(from: d1),
              let date2 = DateFormatter.yyyyMMdd.date(from: d2) else { return false }
        let cal = Calendar(identifier: .iso8601)
        return cal.isDate(date1, equalTo: date2, toGranularity: .weekOfYear)
    }
}

// MARK: - Week Day Row
private struct WeekDayRow: View {
    let task: StudyTask
    let examDate: String?

    private var isToday: Bool {
        task.scheduledDate == DateFormatter.yyyyMMdd.string(from: Date())
    }
    private var taskDate: Date? { DateFormatter.yyyyMMdd.date(from: task.scheduledDate) }
    private var dayAbbrev: String {
        guard let d = taskDate else { return "" }
        let fmt = DateFormatter(); fmt.dateFormat = "EEE"
        return fmt.string(from: d).uppercased()
    }
    private var dayNumber: String {
        guard let d = taskDate else { return "" }
        let fmt = DateFormatter(); fmt.dateFormat = "d"
        return fmt.string(from: d)
    }

    var body: some View {
        HStack(spacing: 12) {
            // Day column
            VStack(spacing: 1) {
                Text(dayAbbrev)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundStyle(isToday ? Color.brand : Color.mutedForeground)
                Text(dayNumber)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(isToday ? Color.brand : .white)
            }
            .frame(width: 36)

            // Task info
            VStack(alignment: .leading, spacing: 2) {
                Text("\(task.taskType.rawValue.capitalized) · \(task.specialty ?? "General")")
                    .font(.subheadline.bold())
                    .foregroundStyle(.white)
                Text("\(task.questionCount) questions")
                    .font(.caption)
                    .foregroundStyle(Color.mutedForeground)
            }
            Spacer()

            if isToday {
                Text("Today")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Color.black)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(Color.brand)
                    .clipShape(Capsule())
            } else {
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Color.mutedForeground)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
    }
}

// MARK: - Exam Day Row
private struct ExamDayRow: View {
    let dateString: String
    private var date: Date? { DateFormatter.yyyyMMdd.date(from: dateString) }
    private var dayAbbrev: String {
        guard let d = date else { return "" }
        let fmt = DateFormatter(); fmt.dateFormat = "EEE"
        return fmt.string(from: d).uppercased()
    }
    private var dayNumber: String {
        guard let d = date else { return "" }
        let fmt = DateFormatter(); fmt.dateFormat = "d"
        return fmt.string(from: d)
    }
    var body: some View {
        HStack(spacing: 12) {
            VStack(spacing: 1) {
                Text(dayAbbrev)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundStyle(Color.brand)
                Text(dayNumber)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(Color.brand)
            }
            .frame(width: 36)
            VStack(alignment: .leading, spacing: 2) {
                Text("Exam day")
                    .font(.subheadline.bold())
                    .foregroundStyle(Color.brand)
                Text("Good luck — you've got this")
                    .font(.caption)
                    .foregroundStyle(Color.mutedForeground)
            }
            Spacer()
            Image(systemName: "flag.fill")
                .foregroundStyle(Color.brand)
                .font(.subheadline)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
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
