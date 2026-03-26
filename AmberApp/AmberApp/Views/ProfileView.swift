//
//  ProfileView.swift
//  AmberApp
//
//  Created on 2026-03-26.
//

import SwiftUI

// MARK: - Profile Tab

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var selectedTab: ProfileContentTab = .moments
    @Namespace private var tabNamespace

    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(spacing: 0) {
                headerSection
                storyHighlights
                contentTabSelector
                contentBody
            }
            .padding(.bottom, 120)
        }
        .background(Color.amberBackground)
        .preferredColorScheme(.dark)
        .overlay(alignment: .top) {
            topBar
        }
    }

    // MARK: - Top Bar

    private var topBar: some View {
        HStack {
            Text("sagartiwari")
                .font(.amberHeadline)
                .foregroundStyle(Color.amberText)

            Spacer()

            Button(action: {}) {
                Image(systemName: "line.3.horizontal")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(Color.amberText)
            }

            Button(action: {}) {
                Image(systemName: "gearshape")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(Color.amberText)
            }
        }
        .padding(.horizontal, 16)
        .padding(.top, 8)
        .padding(.bottom, 10)
        .background(
            Color.amberBackground
                .opacity(0.9)
                .background(.ultraThinMaterial)
        )
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(spacing: 14) {
            // Avatar
            ZStack {
                Circle()
                    .strokeBorder(
                        LinearGradient(
                            colors: [.amberWarm, .amberGold, .amberHoney, .amberPrimary],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 3
                    )
                    .frame(width: 96, height: 96)

                Circle()
                    .fill(Color.amberCardElevated)
                    .frame(width: 90, height: 90)

                Text("ST")
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundStyle(Color.amberWarm)
            }

            // Name + Username + Bio
            VStack(spacing: 4) {
                Text("Sagar Tiwari")
                    .font(.amberTitle2)
                    .foregroundStyle(Color.amberText)

                Text("@sagartiwari")
                    .font(.amberSubheadline)
                    .foregroundStyle(Color.amberSecondaryText)

                Text("building amber \u{2022} USC '29 \u{2022} chicago")
                    .font(.amberCallout)
                    .foregroundStyle(Color.amberSecondaryText)
                    .padding(.top, 2)
            }

            // Stats Row
            HStack(spacing: 0) {
                profileStat(value: "143", label: "connections")
                profileStat(value: "12", label: "circles")
                profileStat(value: "47", label: "day streak")
            }
            .padding(.top, 4)

            // Edit Profile Button
            Button(action: {}) {
                Text("Edit Profile")
                    .font(.amberHeadline)
                    .foregroundStyle(Color.amberText)
                    .frame(maxWidth: .infinity)
                    .frame(height: 40)
                    .background(Color.amberCard, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .strokeBorder(Color.white.opacity(0.06), lineWidth: 0.5)
                    )
            }
            .padding(.horizontal, 16)
            .padding(.top, 4)
        }
        .padding(.top, 64)
    }

    private func profileStat(value: String, label: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.system(size: 18, weight: .bold))
                .foregroundStyle(Color.amberText)
            Text(label)
                .font(.amberCaption)
                .foregroundStyle(Color.amberSecondaryText)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Story Highlights

    private var storyHighlights: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 16) {
                ForEach(ProfileHighlight.samples) { highlight in
                    Button(action: {}) {
                        VStack(spacing: 6) {
                            ZStack {
                                Circle()
                                    .strokeBorder(
                                        LinearGradient(
                                            colors: [highlight.color, highlight.color.opacity(0.5)],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        ),
                                        lineWidth: 2
                                    )
                                    .frame(width: 68, height: 68)

                                Circle()
                                    .fill(Color.amberCard)
                                    .frame(width: 62, height: 62)

                                Image(systemName: highlight.icon)
                                    .font(.system(size: 22, weight: .medium))
                                    .foregroundStyle(highlight.color)
                            }

                            Text(highlight.label)
                                .font(.amberCaption2)
                                .foregroundStyle(Color.amberSecondaryText)
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 16)
        }
        .padding(.top, 20)
    }

    // MARK: - Content Tab Selector

    private var contentTabSelector: some View {
        HStack(spacing: 0) {
            ForEach(ProfileContentTab.allCases) { tab in
                Button {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                        selectedTab = tab
                    }
                } label: {
                    VStack(spacing: 10) {
                        Image(systemName: tab.icon)
                            .font(.system(size: 20, weight: .medium))
                            .foregroundStyle(selectedTab == tab ? Color.amberText : Color.amberTertiaryText)
                            .frame(maxWidth: .infinity)
                            .frame(height: 32)

                        ZStack(alignment: .bottom) {
                            Rectangle()
                                .fill(Color.clear)
                                .frame(height: 1)

                            if selectedTab == tab {
                                Rectangle()
                                    .fill(Color.amberWarm)
                                    .frame(height: 1.5)
                                    .matchedGeometryEffect(id: "tab_indicator", in: tabNamespace)
                            }
                        }
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.top, 20)
        .overlay(alignment: .bottom) {
            Rectangle()
                .fill(Color.white.opacity(0.04))
                .frame(height: 0.5)
        }
    }

    // MARK: - Content Body

    @ViewBuilder
    private var contentBody: some View {
        switch selectedTab {
        case .moments:
            momentsGrid
        case .timeline:
            timelineView
        case .about:
            aboutView
        }
    }

    // MARK: - Moments Grid

    private var momentsGrid: some View {
        let columns = Array(repeating: GridItem(.flexible(), spacing: 2), count: 3)

        return LazyVGrid(columns: columns, spacing: 2) {
            ForEach(ProfileMoment.samples) { moment in
                momentCell(moment)
            }
        }
        .padding(.top, 2)
    }

    private func momentCell(_ moment: ProfileMoment) -> some View {
        ZStack(alignment: .bottomLeading) {
            LinearGradient(
                colors: [moment.color, moment.color.opacity(0.4)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            // Darken bottom for text legibility
            LinearGradient(
                colors: [Color.clear, Color.black.opacity(0.6)],
                startPoint: .center,
                endPoint: .bottom
            )

            Text(moment.title)
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(.white)
                .lineLimit(2)
                .padding(8)
        }
        .frame(height: 120)
        .clipped()
    }

    // MARK: - Timeline

    private var timelineView: some View {
        VStack(spacing: 0) {
            ForEach(Array(ProfileTimelineEvent.samples.enumerated()), id: \.element.id) { index, event in
                timelineRow(event, isLast: index == ProfileTimelineEvent.samples.count - 1)
            }
        }
        .padding(.top, 16)
        .padding(.horizontal, 16)
    }

    private func timelineRow(_ event: ProfileTimelineEvent, isLast: Bool) -> some View {
        HStack(alignment: .top, spacing: 14) {
            // Date column
            VStack(spacing: 0) {
                Text(event.monthAbbrev)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(Color.amberSecondaryText)
                    .textCase(.uppercase)

                Text(event.day)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(Color.amberText)
            }
            .frame(width: 36)

            // Timeline line
            VStack(spacing: 0) {
                Circle()
                    .fill(Color.amberWarm)
                    .frame(width: 8, height: 8)

                if !isLast {
                    Rectangle()
                        .fill(Color.amberCard)
                        .frame(width: 1)
                }
            }

            // Content card
            VStack(alignment: .leading, spacing: 6) {
                Text(event.title)
                    .font(.amberHeadline)
                    .foregroundStyle(Color.amberText)

                Text(event.description)
                    .font(.amberSubheadline)
                    .foregroundStyle(Color.amberSecondaryText)

                if !event.people.isEmpty {
                    HStack(spacing: -8) {
                        ForEach(Array(event.people.enumerated()), id: \.offset) { idx, person in
                            Circle()
                                .fill(Color.amberCardElevated)
                                .frame(width: 24, height: 24)
                                .overlay(
                                    Text(person)
                                        .font(.system(size: 9, weight: .bold))
                                        .foregroundStyle(Color.amberSecondaryText)
                                )
                                .overlay(
                                    Circle()
                                        .strokeBorder(Color.amberBackground, lineWidth: 1.5)
                                )
                                .zIndex(Double(event.people.count - idx))
                        }
                    }
                    .padding(.top, 2)
                }

                if !event.tags.isEmpty {
                    HStack(spacing: 6) {
                        ForEach(event.tags, id: \.self) { tag in
                            Text(tag)
                                .font(.system(size: 11, weight: .medium))
                                .foregroundStyle(Color.amberWarm)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Color.amberWarm.opacity(0.12), in: Capsule())
                        }
                    }
                    .padding(.top, 2)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .amberCardStyle()
            .padding(.bottom, 16)
        }
    }

    // MARK: - About

    private var aboutView: some View {
        VStack(spacing: 24) {
            // Personal Section
            VStack(alignment: .leading, spacing: 0) {
                Text("Personal")
                    .amberSectionHeader()
                    .padding(.horizontal, 16)
                    .padding(.bottom, 12)

                VStack(spacing: 0) {
                    aboutRow(label: "Birthday", value: "Jun 15")
                    aboutDivider()
                    aboutRow(label: "Zodiac", value: "Gemini \u{264A}")
                    aboutDivider()
                    aboutRow(label: "MBTI", value: "ENTJ")
                    aboutDivider()
                    aboutRow(label: "Enneagram", value: "Type 3")
                }
                .amberCardStyle()
                .padding(.horizontal, 16)
            }

            // Connected Apps Section
            VStack(alignment: .leading, spacing: 0) {
                Text("Connected Apps")
                    .amberSectionHeader()
                    .padding(.horizontal, 16)
                    .padding(.bottom, 12)

                VStack(spacing: 0) {
                    connectedAppRow(name: "Apple Health", icon: "heart.fill", color: .healthPhysical, isConnected: true)
                    aboutDivider()
                    connectedAppRow(name: "Google Calendar", icon: "calendar", color: .amberBlue, isConnected: true)
                    aboutDivider()
                    connectedAppRow(name: "Instagram", icon: "camera.fill", color: .healthEmotional, isConnected: false)
                    aboutDivider()
                    connectedAppRow(name: "Spotify", icon: "music.note", color: .healthSpiritual, isConnected: false)
                }
                .amberCardStyle()
                .padding(.horizontal, 16)
            }

            // Sign Out
            Button {
                authViewModel.logout()
            } label: {
                Text("Sign Out")
                    .font(.amberHeadline)
                    .foregroundStyle(Color.amberError)
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .background(Color.amberCard, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .strokeBorder(Color.amberError.opacity(0.2), lineWidth: 0.5)
                    )
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
        }
        .padding(.top, 20)
    }

    private func aboutRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.amberSubheadline)
                .foregroundStyle(Color.amberSecondaryText)

            Spacer()

            Text(value)
                .font(.amberSubheadline)
                .foregroundStyle(Color.amberText)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 13)
    }

    private func connectedAppRow(name: String, icon: String, color: Color, isConnected: Bool) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 16, weight: .medium))
                .foregroundStyle(color)
                .frame(width: 28, height: 28)

            Text(name)
                .font(.amberSubheadline)
                .foregroundStyle(Color.amberText)

            Spacer()

            Toggle("", isOn: .constant(isConnected))
                .labelsHidden()
                .tint(.amberWarm)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
    }

    private func aboutDivider() -> some View {
        Rectangle()
            .fill(Color.white.opacity(0.04))
            .frame(height: 0.5)
            .padding(.leading, 16)
    }
}

// MARK: - Supporting Types

private enum ProfileContentTab: String, CaseIterable, Identifiable {
    case moments, timeline, about

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .moments:  return "square.grid.2x2.fill"
        case .timeline: return "clock.fill"
        case .about:    return "info.circle.fill"
        }
    }
}

private struct ProfileHighlight: Identifiable {
    let id = UUID()
    let label: String
    let icon: String
    let color: Color

    static let samples: [ProfileHighlight] = [
        .init(label: "Health",  icon: "heart.fill",             color: .healthPhysical),
        .init(label: "Sleep",   icon: "moon.fill",              color: .healthSpiritual),
        .init(label: "Social",  icon: "person.2.fill",          color: .healthSocial),
        .init(label: "Mind",    icon: "brain.head.profile",     color: .healthIntellectual),
        .init(label: "Move",    icon: "figure.run",             color: .healthPhysical),
        .init(label: "Cycle",   icon: "circle.dotted",          color: .healthEmotional),
    ]
}

private struct ProfileMoment: Identifiable {
    let id = UUID()
    let title: String
    let color: Color

    static let samples: [ProfileMoment] = [
        .init(title: "Trip to Japan",         color: .amberWarm),
        .init(title: "USC Move-In Day",       color: .healthSocial),
        .init(title: "Coffee with Angela",    color: .amberGold),
        .init(title: "MAYA Biotech Launch",   color: .healthIntellectual),
        .init(title: "Family Dinner",         color: .healthEmotional),
        .init(title: "Lakefront Run",         color: .healthPhysical),
        .init(title: "First Day at USC",      color: .amberPrimary),
        .init(title: "Concert at Metro",      color: .healthSpiritual),
        .init(title: "Friendsgiving",         color: .amberHoney),
    ]
}

private struct ProfileTimelineEvent: Identifiable {
    let id = UUID()
    let monthAbbrev: String
    let day: String
    let title: String
    let description: String
    let people: [String]
    let tags: [String]

    static let samples: [ProfileTimelineEvent] = [
        .init(monthAbbrev: "Mar", day: "24",
              title: "Coffee chat with Angela",
              description: "Talked about Amber product strategy at Verve",
              people: ["AT", "ST"],
              tags: ["product", "amber"]),
        .init(monthAbbrev: "Mar", day: "20",
              title: "MAYA Biotech meeting",
              description: "Sprint review, planned next release",
              people: ["ST", "JL", "MR"],
              tags: ["work", "sprint"]),
        .init(monthAbbrev: "Mar", day: "15",
              title: "Family video call",
              description: "Talked about India trip in May",
              people: ["CT", "UT", "SiT"],
              tags: ["family"]),
        .init(monthAbbrev: "Mar", day: "10",
              title: "USC volleyball",
              description: "Met Michelle, great match",
              people: ["ST", "MK"],
              tags: ["social", "usc"]),
        .init(monthAbbrev: "Mar", day: "5",
              title: "Trip to SF",
              description: "Class trip, visited Anthropic office",
              people: ["ST", "RK", "NP"],
              tags: ["travel", "usc"]),
    ]
}

// MARK: - Preview

#Preview {
    ProfileView()
        .environmentObject(AuthViewModel())
}
