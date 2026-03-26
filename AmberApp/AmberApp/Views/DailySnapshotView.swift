//
//  DailySnapshotView.swift
//  AmberApp
//
//  Created on 2026-03-26.
//

import SwiftUI

// MARK: - Data Models

private struct HealthMetric: Identifiable {
    let id = UUID()
    let icon: String
    let value: String
    let label: String
    let color: Color
}

private struct PersonCard: Identifiable {
    let id = UUID()
    let name: String
    let initials: String
    let context: String
    let action: String
    let avatarColor: Color
}

private struct ScheduleEvent: Identifiable {
    let id = UUID()
    let time: String
    let title: String
    let subtitle: String?
    let dotColor: Color
}

private struct ScreenTimeEntry: Identifiable {
    let id = UUID()
    let app: String
    let minutes: Int
    let color: Color
}

private struct WeekDay: Identifiable {
    let id = UUID()
    let letter: String
    let checkedIn: Bool
    let isToday: Bool
}

// MARK: - Daily Snapshot View

struct DailySnapshotView: View {
    @State private var streakTapped = false
    @State private var reflectionExpanded = false
    @State private var selectedMetric: UUID?

    // MARK: - Sample Data

    private let healthMetrics: [HealthMetric] = [
        HealthMetric(icon: "moon.fill", value: "7.2h", label: "Sleep", color: Color(hex: "6C5CE7")),
        HealthMetric(icon: "figure.walk", value: "6,840", label: "Steps", color: .healthPhysical),
        HealthMetric(icon: "heart.fill", value: "62 bpm", label: "Heart", color: .healthEmotional),
        HealthMetric(icon: "iphone", value: "2.4h", label: "Screen", color: .amberWarm),
        HealthMetric(icon: "flame.fill", value: "1,850", label: "Calories", color: .amberWarm),
        HealthMetric(icon: "brain", value: "12 min", label: "Mindful", color: .healthSpiritual),
    ]

    private let people: [PersonCard] = [
        PersonCard(name: "Angela", initials: "AC", context: "Design review at 3pm", action: "Message", avatarColor: .amberGold),
        PersonCard(name: "Mom", initials: "CT", context: "Haven't called in 8 days", action: "Call", avatarColor: .healthEmotional),
        PersonCard(name: "Victor", initials: "VS", context: "Product sync at 5pm", action: "Message", avatarColor: .healthSocial),
        PersonCard(name: "Kaitlyn", initials: "KM", context: "Check in — last msg 5 days ago", action: "Message", avatarColor: .healthSpiritual),
        PersonCard(name: "Rohan", initials: "RP", context: "Birthday tomorrow!", action: "Message", avatarColor: .amberHoney),
    ]

    private let schedule: [ScheduleEvent] = [
        ScheduleEvent(time: "9:00 AM", title: "Morning workout", subtitle: nil, dotColor: .healthPhysical),
        ScheduleEvent(time: "11:00 AM", title: "MAYA standup", subtitle: nil, dotColor: .amberWarm),
        ScheduleEvent(time: "1:00 PM", title: "Lunch with Dev", subtitle: "Sweetgreen on Clark", dotColor: .healthSocial),
        ScheduleEvent(time: "3:00 PM", title: "Design review with Angela", subtitle: "Figma walkthrough", dotColor: .amberGold),
        ScheduleEvent(time: "5:00 PM", title: "Product sync with Victor", subtitle: nil, dotColor: .amberPrimary),
    ]

    private let screenTimeApps: [ScreenTimeEntry] = [
        ScreenTimeEntry(app: "Instagram", minutes: 45, color: Color(hex: "E1306C")),
        ScreenTimeEntry(app: "Messages", minutes: 32, color: .healthPhysical),
        ScreenTimeEntry(app: "Amber", minutes: 28, color: .amberWarm),
        ScreenTimeEntry(app: "Safari", minutes: 22, color: .healthSocial),
        ScreenTimeEntry(app: "TikTok", minutes: 18, color: .amberText),
    ]

    private let weekDays: [WeekDay] = [
        WeekDay(letter: "M", checkedIn: true, isToday: false),
        WeekDay(letter: "T", checkedIn: true, isToday: false),
        WeekDay(letter: "W", checkedIn: true, isToday: true),
        WeekDay(letter: "T", checkedIn: false, isToday: false),
        WeekDay(letter: "F", checkedIn: false, isToday: false),
        WeekDay(letter: "S", checkedIn: true, isToday: false),
        WeekDay(letter: "S", checkedIn: true, isToday: false),
    ]

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12: return "Good morning, Sagar"
        case 12..<17: return "Good afternoon, Sagar"
        default: return "Good evening, Sagar"
        }
    }

    private var dateString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMMM d"
        return formatter.string(from: Date())
    }

    private let dailyCompletion: CGFloat = 0.68

    // MARK: - Body

    var body: some View {
        ZStack(alignment: .topTrailing) {
            Color.amberBackground
                .ignoresSafeArea()

            ScrollView(.vertical, showsIndicators: false) {
                VStack(alignment: .leading, spacing: 24) {
                    headerSection
                    streakBanner
                    healthSnapshot
                    peopleSection
                    scheduleSection
                    weeklyStreakGrid
                    screenTimeSection
                    reflectionPrompt
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
                .padding(.bottom, 120)
            }

            // Notification bell
            notificationBell
                .padding(.top, 16)
                .padding(.trailing, 20)
        }
        .preferredColorScheme(.dark)
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 10) {
                // Small amber logo
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [.amberWarm, .amberGold],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 20, height: 20)
                    .overlay(
                        Image(systemName: "leaf.fill")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.white)
                    )

                Text(greeting)
                    .font(.amberTitle)
                    .foregroundColor(.amberText)
            }

            Text(dateString)
                .font(.amberSubheadline)
                .foregroundColor(.amberSecondaryText)
                .padding(.leading, 30)
        }
        .padding(.trailing, 44) // space for bell icon
    }

    // MARK: - Notification Bell

    private var notificationBell: some View {
        Button(action: {}) {
            ZStack(alignment: .topTrailing) {
                Image(systemName: "bell.fill")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.amberSecondaryText)

                Circle()
                    .fill(Color.amberWarm)
                    .frame(width: 8, height: 8)
                    .offset(x: 2, y: -2)
            }
        }
    }

    // MARK: - Streak Banner

    private var streakBanner: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 8) {
                    Image(systemName: "flame.fill")
                        .font(.system(size: 20))
                        .foregroundColor(.amberWarm)

                    Text("47 Day Streak")
                        .font(.amberRoundedLarge)
                        .foregroundColor(.amberText)
                }

                Text("You've checked in every day since Feb 7")
                    .font(.amberCaption)
                    .foregroundColor(.amberSecondaryText)
            }

            Spacer()

            // Circular progress ring
            ZStack {
                Circle()
                    .stroke(Color.amberTertiaryText.opacity(0.2), lineWidth: 5)
                    .frame(width: 52, height: 52)

                Circle()
                    .trim(from: 0, to: dailyCompletion)
                    .stroke(
                        LinearGradient(
                            colors: [.amberWarm, .amberGold, .amberEmber],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        style: StrokeStyle(lineWidth: 5, lineCap: .round)
                    )
                    .frame(width: 52, height: 52)
                    .rotationEffect(.degrees(-90))

                Text("\(Int(dailyCompletion * 100))%")
                    .font(.system(size: 13, weight: .bold, design: .rounded))
                    .foregroundColor(.amberText)
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(Color.amberCard)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .strokeBorder(
                    LinearGradient(
                        colors: [.amberWarm.opacity(0.5), .amberGold.opacity(0.3), .amberWarm.opacity(0.1)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        )
        .onTapGesture {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                streakTapped.toggle()
            }
        }
        .scaleEffect(streakTapped ? 0.97 : 1.0)
        .animation(.spring(response: 0.35, dampingFraction: 0.75), value: streakTapped)
    }

    // MARK: - Health Snapshot

    private var healthSnapshot: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("YOUR BODY TODAY")
                .amberSectionHeader()

            LazyVGrid(
                columns: [
                    GridItem(.flexible(), spacing: 10),
                    GridItem(.flexible(), spacing: 10),
                    GridItem(.flexible(), spacing: 10),
                ],
                spacing: 10
            ) {
                ForEach(healthMetrics) { metric in
                    metricCard(metric)
                }
            }
        }
        .padding(20)
        .amberCardStyle()
    }

    private func metricCard(_ metric: HealthMetric) -> some View {
        VStack(spacing: 8) {
            Image(systemName: metric.icon)
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(metric.color)

            Text(metric.value)
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(.amberText)
                .minimumScaleFactor(0.7)
                .lineLimit(1)

            Text(metric.label)
                .font(.amberCaption2)
                .foregroundColor(.amberSecondaryText)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .padding(.horizontal, 6)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color.amberCardElevated)
        )
        .scaleEffect(selectedMetric == metric.id ? 0.95 : 1.0)
        .animation(.spring(response: 0.35, dampingFraction: 0.75), value: selectedMetric)
        .onTapGesture {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                selectedMetric = selectedMetric == metric.id ? nil : metric.id
            }
        }
    }

    // MARK: - People Section

    private var peopleSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("PEOPLE TODAY")
                .amberSectionHeader()
                .padding(.leading, 4)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(people) { person in
                        personCardView(person)
                    }
                }
            }
        }
    }

    private func personCardView(_ person: PersonCard) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            // Avatar
            Circle()
                .fill(person.avatarColor.opacity(0.2))
                .frame(width: 44, height: 44)
                .overlay(
                    Text(person.initials)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(person.avatarColor)
                )

            // Name
            Text(person.name)
                .font(.amberHeadline)
                .foregroundColor(.amberText)
                .lineLimit(1)

            // Context
            Text(person.context)
                .font(.amberCaption)
                .foregroundColor(.amberSecondaryText)
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)

            Spacer()

            // Action pill
            Text(person.action)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.amberWarm)
                .padding(.horizontal, 14)
                .padding(.vertical, 6)
                .background(
                    Capsule()
                        .fill(Color.amberWarm.opacity(0.12))
                )
        }
        .frame(width: 160, height: 190)
        .padding(16)
        .amberCardStyle()
    }

    // MARK: - Schedule Section

    private var scheduleSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("YOUR DAY")
                .amberSectionHeader()
                .padding(.leading, 4)

            VStack(spacing: 0) {
                ForEach(Array(schedule.enumerated()), id: \.element.id) { index, event in
                    scheduleRow(event: event, isLast: index == schedule.count - 1)
                }
            }
            .padding(20)
            .amberCardStyle()
        }
    }

    private func scheduleRow(event: ScheduleEvent, isLast: Bool) -> some View {
        HStack(alignment: .top, spacing: 16) {
            // Time
            Text(event.time)
                .font(.amberMono)
                .foregroundColor(.amberSecondaryText)
                .frame(width: 72, alignment: .trailing)

            // Timeline
            VStack(spacing: 0) {
                Circle()
                    .fill(event.dotColor)
                    .frame(width: 10, height: 10)

                if !isLast {
                    Rectangle()
                        .fill(Color.amberTertiaryText.opacity(0.3))
                        .frame(width: 1.5)
                        .frame(maxHeight: .infinity)
                }
            }
            .frame(width: 10)

            // Content
            VStack(alignment: .leading, spacing: 3) {
                Text(event.title)
                    .font(.amberCallout)
                    .foregroundColor(.amberText)

                if let subtitle = event.subtitle {
                    Text(subtitle)
                        .font(.amberCaption)
                        .foregroundColor(.amberSecondaryText)
                }
            }

            Spacer()
        }
        .padding(.bottom, isLast ? 0 : 20)
    }

    // MARK: - Weekly Streak Grid

    private var weeklyStreakGrid: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("THIS WEEK")
                .amberSectionHeader()
                .padding(.leading, 4)

            VStack(spacing: 12) {
                HStack(spacing: 0) {
                    ForEach(weekDays) { day in
                        VStack(spacing: 8) {
                            Text(day.letter)
                                .font(.amberCaption2)
                                .foregroundColor(.amberSecondaryText)

                            ZStack {
                                if day.checkedIn {
                                    Circle()
                                        .fill(Color.amberWarm)
                                        .frame(width: 32, height: 32)
                                } else {
                                    Circle()
                                        .strokeBorder(Color.amberTertiaryText.opacity(0.4), lineWidth: 1.5)
                                        .frame(width: 32, height: 32)
                                }

                                if day.isToday {
                                    Circle()
                                        .strokeBorder(Color.amberGold, lineWidth: 2)
                                        .frame(width: 40, height: 40)
                                        .shadow(color: .amberGold.opacity(0.4), radius: 6, x: 0, y: 0)
                                }

                                if day.checkedIn {
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 12, weight: .bold))
                                        .foregroundColor(.white)
                                }
                            }
                            .frame(width: 42, height: 42)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }

                let checkedCount = weekDays.filter(\.checkedIn).count
                Text("\(checkedCount) of 7 days — keep going!")
                    .font(.amberFootnote)
                    .foregroundColor(.amberSecondaryText)
                    .frame(maxWidth: .infinity, alignment: .center)
            }
            .padding(20)
            .amberCardStyle()
        }
    }

    // MARK: - Screen Time Section

    private var screenTimeSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("SCREEN TIME")
                .amberSectionHeader()
                .padding(.leading, 4)

            VStack(spacing: 14) {
                let maxMinutes = screenTimeApps.map(\.minutes).max() ?? 1

                ForEach(screenTimeApps) { entry in
                    HStack(spacing: 12) {
                        Text(entry.app)
                            .font(.amberCallout)
                            .foregroundColor(.amberText)
                            .frame(width: 80, alignment: .leading)

                        GeometryReader { geo in
                            RoundedRectangle(cornerRadius: 4, style: .continuous)
                                .fill(entry.color.opacity(0.8))
                                .frame(
                                    width: geo.size.width * CGFloat(entry.minutes) / CGFloat(maxMinutes)
                                )
                        }
                        .frame(height: 14)

                        Text("\(entry.minutes) min")
                            .font(.amberCaption)
                            .foregroundColor(.amberSecondaryText)
                            .frame(width: 50, alignment: .trailing)
                    }
                }

                // Total
                let totalMinutes = screenTimeApps.reduce(0) { $0 + $1.minutes }
                let hours = totalMinutes / 60
                let mins = totalMinutes % 60
                let totalColor: Color = totalMinutes < 180 ? .amberSuccess : .amberWarning

                HStack {
                    Spacer()
                    Circle()
                        .fill(totalColor)
                        .frame(width: 8, height: 8)
                    Text("\(hours)h \(mins)m total")
                        .font(.amberFootnote)
                        .foregroundColor(.amberSecondaryText)
                }
                .padding(.top, 4)
            }
            .padding(20)
            .amberCardStyle()
        }
    }

    // MARK: - Reflection Prompt

    private var reflectionPrompt: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 10) {
                Image(systemName: "leaf.fill")
                    .font(.system(size: 18))
                    .foregroundColor(.amberGold)

                Text("Take a moment")
                    .font(.amberHeadline)
                    .foregroundColor(.amberText)
            }

            Text("What's one thing you're grateful for today?")
                .font(.amberCallout)
                .foregroundColor(.amberSecondaryText)

            if reflectionExpanded {
                TextField("Start writing...", text: .constant(""), axis: .vertical)
                    .font(.amberBody)
                    .foregroundColor(.amberText)
                    .padding(12)
                    .background(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .fill(Color.amberCardElevated)
                    )
                    .lineLimit(3...6)
                    .transition(.opacity.combined(with: .move(edge: .top)))
            }

            Button(action: {
                withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                    reflectionExpanded.toggle()
                }
            }) {
                Text(reflectionExpanded ? "Done" : "Reflect")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.amberBackground)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 10)
                    .background(
                        Capsule()
                            .fill(Color.amberGold)
                    )
            }
        }
        .padding(20)
        .amberCardStyle()
    }
}

// MARK: - Preview

#Preview {
    DailySnapshotView()
}
