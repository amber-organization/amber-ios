//
//  WrapFeedView.swift
//  AmberApp
//
//  Premium cinematic Feed/Wrap tab — your relationship journal, alive.
//  Created on 2026-03-25.
//

import SwiftUI

// MARK: - Data Models

struct SurfacedItem: Identifiable {
    let id = UUID()
    let icon: String
    let text: String
}

struct StreakEntry: Identifiable {
    let id = UUID()
    let name: String
    let days: Int
    let maxDays: Int
    let icon: String?
}

enum CircleActivityType {
    case milestone
    case growth
    case event
    case memory

    var icon: String {
        switch self {
        case .milestone: return "star.fill"
        case .growth: return "person.badge.plus"
        case .event: return "calendar"
        case .memory: return "heart.fill"
        }
    }

    var color: Color {
        switch self {
        case .milestone: return .amberGold
        case .growth: return .healthSocial
        case .event: return .amberWarm
        case .memory: return .healthEmotional
        }
    }

    var label: String {
        switch self {
        case .milestone: return "Milestone"
        case .growth: return "Growth"
        case .event: return "Event"
        case .memory: return "Memory"
        }
    }
}

struct CircleActivity: Identifiable {
    let id = UUID()
    let type: CircleActivityType
    let headline: String
    let timeAgo: String
}

// MARK: - Wrap Feed View

struct WrapFeedView: View {
    @State private var selectedMood: String? = nil
    @State private var showMoodConfirmation = false
    @Namespace private var animation

    private let moods = ["😊", "😌", "😤", "😢", "🔥"]

    var body: some View {
        NavigationStack {
            ZStack {
                Color.amberBackground
                    .ignoresSafeArea()

                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: 24) {
                        todayCard
                            .padding(.top, 8)

                        weeklyWrapCard

                        streaksSection

                        circleActivitySection

                        reflectionCard

                        Spacer(minLength: 0)
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 140)
                }
            }
            .navigationTitle("Feed")
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItemGroup(placement: .topBarTrailing) {
                    Button(action: {}) {
                        Image(systemName: "bell.fill")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundStyle(Color.amberSecondaryText)
                            .overlay(alignment: .topTrailing) {
                                Circle()
                                    .fill(.red)
                                    .frame(width: 8, height: 8)
                                    .offset(x: 3, y: -3)
                            }
                    }

                    Button(action: {}) {
                        Circle()
                            .fill(Color.amberCardElevated)
                            .frame(width: 32, height: 32)
                            .overlay(
                                Text("S")
                                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                                    .foregroundStyle(Color.amberWarm)
                            )
                            .overlay(
                                Circle()
                                    .strokeBorder(Color.amberWarm.opacity(0.3), lineWidth: 1)
                            )
                    }
                }
            }
        }
        .preferredColorScheme(.dark)
    }

    // MARK: - Today Card

    private var todayCard: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Greeting
            VStack(alignment: .leading, spacing: 4) {
                Text(greetingText)
                    .font(.amberTitle)
                    .foregroundStyle(Color.amberText)

                Text(formattedDate)
                    .font(.amberFootnote)
                    .foregroundStyle(Color.amberSecondaryText)
            }

            // Mood check-in
            VStack(alignment: .leading, spacing: 12) {
                Text("How are you feeling?")
                    .font(.amberCallout)
                    .foregroundStyle(Color.amberSecondaryText)

                HStack(spacing: 12) {
                    ForEach(moods, id: \.self) { mood in
                        Button {
                            withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                                selectedMood = mood
                                showMoodConfirmation = true
                            }
                        } label: {
                            Text(mood)
                                .font(.system(size: 28))
                                .frame(width: 48, height: 48)
                                .background(
                                    selectedMood == mood
                                        ? Color.amberWarm.opacity(0.2)
                                        : Color.amberCardElevated.opacity(0.6),
                                    in: RoundedRectangle(cornerRadius: 14, style: .continuous)
                                )
                                .overlay(
                                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                                        .strokeBorder(
                                            selectedMood == mood
                                                ? Color.amberWarm.opacity(0.5)
                                                : Color.white.opacity(0.04),
                                            lineWidth: 1
                                        )
                                )
                                .scaleEffect(selectedMood == mood ? 1.1 : 1.0)
                        }
                        .buttonStyle(.plain)
                    }
                    Spacer()
                }
            }

            // Divider
            Rectangle()
                .fill(Color.white.opacity(0.04))
                .frame(height: 1)

            // Surfaced items
            VStack(spacing: 10) {
                ForEach(surfacedItems) { item in
                    HStack(spacing: 12) {
                        Text(item.icon)
                            .font(.system(size: 16))
                            .frame(width: 32, height: 32)
                            .background(Color.amberCardElevated, in: RoundedRectangle(cornerRadius: 10, style: .continuous))

                        Text(item.text)
                            .font(.amberSubheadline)
                            .foregroundStyle(Color.amberText.opacity(0.85))
                            .lineLimit(2)

                        Spacer(minLength: 0)

                        Image(systemName: "chevron.right")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundStyle(Color.amberTertiaryText)
                    }
                    .padding(.vertical, 6)
                    .padding(.horizontal, 12)
                    .background(
                        Color.amberWarm.opacity(0.04),
                        in: RoundedRectangle(cornerRadius: 12, style: .continuous)
                    )
                }
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(.ultraThinMaterial)
                .environment(\.colorScheme, .dark)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .strokeBorder(
                    LinearGradient(
                        colors: [
                            Color.amberWarm.opacity(0.15),
                            Color.amberGold.opacity(0.05),
                            Color.clear
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        )
    }

    // MARK: - Weekly Wrap Card

    private var weeklyWrapCard: some View {
        VStack(alignment: .leading, spacing: 20) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Your Week")
                        .font(.amberTitle2)
                        .foregroundStyle(Color.amberText)

                    Text("Mar 18 — Mar 24")
                        .font(.amberCaption)
                        .foregroundStyle(Color.amberSecondaryText)
                }
                Spacer()
                Image(systemName: "sparkles")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(Color.amberGold)
            }

            // Stats grid
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 12),
                GridItem(.flexible(), spacing: 12),
                GridItem(.flexible(), spacing: 12)
            ], spacing: 12) {
                wrapStat(value: "12", label: "conversations")
                wrapStat(value: "3", label: "new memories")
                wrapStat(value: "47", label: "messages")
            }

            // Divider
            Rectangle()
                .fill(Color.white.opacity(0.04))
                .frame(height: 1)

            // Top people
            HStack(spacing: 8) {
                Text("Top people")
                    .font(.amberFootnote)
                    .foregroundStyle(Color.amberSecondaryText)

                Spacer()

                HStack(spacing: -8) {
                    topPersonAvatar(initial: "A", color: .healthEmotional)
                    topPersonAvatar(initial: "K", color: .healthSocial)
                    topPersonAvatar(initial: "V", color: .healthIntellectual)
                }

                Text("Angela, Kaitlyn, Victor")
                    .font(.amberCaption)
                    .foregroundStyle(Color.amberText.opacity(0.7))
            }

            // Share button
            Button {
                // Share action
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "square.and.arrow.up")
                        .font(.system(size: 14, weight: .semibold))
                    Text("Share your wrap")
                        .font(.amberRounded)
                }
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(
                    Color.amberWarm,
                    in: RoundedRectangle(cornerRadius: 14, style: .continuous)
                )
            }
            .buttonStyle(.plain)
        }
        .padding(20)
        .background(
            ZStack {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .environment(\.colorScheme, .dark)

                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [
                                Color.amberGradientStart.opacity(0.12),
                                Color.amberGradientMid.opacity(0.06),
                                Color.amberGradientEnd.opacity(0.03)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            }
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .strokeBorder(Color.amberWarm.opacity(0.08), lineWidth: 0.5)
        )
    }

    // MARK: - Streaks Section

    private var streaksSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("STREAKS")
                .amberSectionHeader()
                .padding(.leading, 4)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(streaks) { streak in
                        streakCard(streak)
                    }
                }
                .padding(.horizontal, 2)
            }
        }
    }

    // MARK: - Circle Activity Section

    private var circleActivitySection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("CIRCLE ACTIVITY")
                .amberSectionHeader()
                .padding(.leading, 4)

            VStack(spacing: 10) {
                ForEach(circleActivities) { activity in
                    circleActivityCard(activity)
                }
            }
        }
    }

    // MARK: - Reflection Card

    private var reflectionCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 8) {
                Image(systemName: "leaf.fill")
                    .font(.system(size: 14))
                    .foregroundStyle(Color.amberGold.opacity(0.7))

                Text("Take a moment")
                    .font(.amberHeadline)
                    .foregroundStyle(Color.amberText)
            }

            Text("Who made your week better? Send them a note.")
                .font(.amberBody)
                .foregroundStyle(Color.amberSecondaryText)
                .lineSpacing(3)

            Button {
                // Reflect action
            } label: {
                Text("Reflect")
                    .font(.amberRounded)
                    .foregroundStyle(Color.amberGold)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(
                        Color.amberGold.opacity(0.1),
                        in: Capsule()
                    )
                    .overlay(
                        Capsule()
                            .strokeBorder(Color.amberGold.opacity(0.2), lineWidth: 0.5)
                    )
            }
            .buttonStyle(.plain)
            .padding(.top, 2)
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(.ultraThinMaterial)
                .environment(\.colorScheme, .dark)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(Color.amberSubtleGradient)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .strokeBorder(Color.amberGold.opacity(0.06), lineWidth: 0.5)
        )
    }

    // MARK: - Sub-components

    private func wrapStat(value: String, label: String) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.system(size: 28, weight: .bold, design: .rounded))
                .foregroundStyle(Color.amberText)

            Text(label)
                .font(.amberCaption)
                .foregroundStyle(Color.amberSecondaryText)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(
            Color.amberCardElevated.opacity(0.5),
            in: RoundedRectangle(cornerRadius: 14, style: .continuous)
        )
    }

    private func topPersonAvatar(initial: String, color: Color) -> some View {
        Text(initial)
            .font(.system(size: 11, weight: .bold, design: .rounded))
            .foregroundStyle(.white)
            .frame(width: 26, height: 26)
            .background(color.opacity(0.8), in: Circle())
            .overlay(
                Circle()
                    .strokeBorder(Color.amberCard, lineWidth: 2)
            )
    }

    private func streakCard(_ streak: StreakEntry) -> some View {
        VStack(spacing: 12) {
            // Progress ring
            ZStack {
                Circle()
                    .strokeBorder(Color.amberCardElevated, lineWidth: 4)
                    .frame(width: 52, height: 52)

                Circle()
                    .trim(from: 0, to: CGFloat(streak.days) / CGFloat(streak.maxDays))
                    .stroke(
                        Color.amberBrandGradient,
                        style: StrokeStyle(lineWidth: 4, lineCap: .round)
                    )
                    .frame(width: 52, height: 52)
                    .rotationEffect(.degrees(-90))

                if let icon = streak.icon {
                    Text(icon)
                        .font(.system(size: 18))
                } else {
                    Text("\(streak.days)")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.amberText)
                }
            }

            VStack(spacing: 2) {
                if streak.icon == nil {
                    Text("\(streak.days) days")
                        .font(.system(size: 13, weight: .semibold, design: .rounded))
                        .foregroundStyle(Color.amberText)
                } else {
                    Text("\(streak.days) days")
                        .font(.system(size: 13, weight: .semibold, design: .rounded))
                        .foregroundStyle(Color.amberText)
                }

                Text(streak.name)
                    .font(.amberCaption)
                    .foregroundStyle(Color.amberSecondaryText)
                    .lineLimit(1)
            }
        }
        .frame(width: 120)
        .padding(.vertical, 16)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .environment(\.colorScheme, .dark)
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .strokeBorder(Color.white.opacity(0.06), lineWidth: 0.5)
        )
    }

    private func circleActivityCard(_ activity: CircleActivity) -> some View {
        HStack(spacing: 14) {
            // Icon
            Image(systemName: activity.type.icon)
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(activity.type.color)
                .frame(width: 36, height: 36)
                .background(
                    activity.type.color.opacity(0.12),
                    in: RoundedRectangle(cornerRadius: 11, style: .continuous)
                )

            VStack(alignment: .leading, spacing: 4) {
                // Type badge
                Text(activity.type.label)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(activity.type.color)
                    .textCase(.uppercase)
                    .tracking(0.3)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 2)
                    .background(
                        activity.type.color.opacity(0.1),
                        in: Capsule()
                    )

                // Headline
                Text(activity.headline)
                    .font(.amberSubheadline)
                    .foregroundStyle(Color.amberText.opacity(0.9))
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 0)

            // Time
            Text(activity.timeAgo)
                .font(.amberCaption)
                .foregroundStyle(Color.amberTertiaryText)
        }
        .padding(14)
        .amberCardStyle()
    }

    // MARK: - Greeting Logic

    private var greetingText: String {
        let hour = Calendar.current.component(.hour, from: Date())
        let greeting: String
        if hour < 12 {
            greeting = "Good morning"
        } else if hour < 17 {
            greeting = "Good afternoon"
        } else {
            greeting = "Good evening"
        }
        return "\(greeting), Sagar"
    }

    private var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMMM d"
        return formatter.string(from: Date())
    }

    // MARK: - Sample Data

    private var surfacedItems: [SurfacedItem] {
        [
            SurfacedItem(icon: "🎂", text: "Angela's birthday in 3 days"),
            SurfacedItem(icon: "📅", text: "MAYA Biotech meeting at 5pm"),
            SurfacedItem(icon: "💬", text: "You haven't talked to Victor in 14 days"),
        ]
    }

    private var streaks: [StreakEntry] {
        [
            StreakEntry(name: "Angela", days: 42, maxDays: 50, icon: nil),
            StreakEntry(name: "Kaitlyn", days: 28, maxDays: 50, icon: nil),
            StreakEntry(name: "Check-in", days: 7, maxDays: 10, icon: "🔥"),
        ]
    }

    private var circleActivities: [CircleActivity] {
        [
            CircleActivity(
                type: .milestone,
                headline: "MAYA Biotech hit 10 meetings this semester",
                timeAgo: "2h"
            ),
            CircleActivity(
                type: .growth,
                headline: "Delta Gamma added 3 new members",
                timeAgo: "5h"
            ),
            CircleActivity(
                type: .event,
                headline: "CS 270 Study Group — new event: Final Review Session",
                timeAgo: "8h"
            ),
            CircleActivity(
                type: .memory,
                headline: "Victor shared a memory in Family circle",
                timeAgo: "1d"
            ),
        ]
    }
}

// MARK: - Preview

#Preview {
    WrapFeedView()
}
