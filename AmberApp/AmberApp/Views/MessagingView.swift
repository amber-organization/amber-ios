//
//  MessagingView.swift
//  AmberApp
//
//  Premium cinematic messaging view — warm, intimate, zero clutter.
//  Replaces MessagesView.swift.
//

import SwiftUI

// MARK: - Data Models (CircleType defined in Models/Circle.swift)

struct ClosestPerson: Identifiable {
    let id = UUID()
    let name: String
    let initials: String
    let isOnline: Bool
    let isActive: Bool // recently active — shows gradient ring
}

struct CircleConversation: Identifiable {
    let id = UUID()
    let name: String
    let icon: String
    let type: CircleType
    let lastMessage: String
    let timeAgo: String
    let unreadCount: Int
    let hasAmberAgent: Bool
}

// MARK: - MessagingView

struct MessagingView: View {
    @State private var showCreateCircle = false
    @State private var otherExpanded = false
    @State private var appeared = false

    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottomTrailing) {
                Color.amberBackground.ignoresSafeArea()

                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: 32) {
                        closestSection
                        circlesSection
                        otherSection
                    }
                    .padding(.top, 8)
                    .padding(.bottom, 180)
                }

                // FAB
                fabButton
            }
            .navigationTitle("Messages")
            .navigationBarTitleDisplayMode(.large)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    HStack(spacing: 12) {
                        Button(action: { showCreateCircle = true }) {
                            Image(systemName: "square.and.pencil")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.amberWarm)
                        }
                        ProfileAvatarButton()
                    }
                }
            }
            .sheet(isPresented: $showCreateCircle) {
                createCirclePlaceholder
            }
            .onAppear {
                withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
                    appeared = true
                }
            }
        }
    }

    // MARK: - Closest Section

    private var closestSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Closest")
                .amberSectionHeader()
                .padding(.horizontal, 20)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 20) {
                    ForEach(Array(closestPeople.enumerated()), id: \.element.id) { index, person in
                        closestAvatar(person)
                            .opacity(appeared ? 1 : 0)
                            .offset(y: appeared ? 0 : 12)
                            .animation(
                                .spring(response: 0.35, dampingFraction: 0.75)
                                    .delay(Double(index) * 0.05),
                                value: appeared
                            )
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 4)
            }
        }
    }

    private func closestAvatar(_ person: ClosestPerson) -> some View {
        VStack(spacing: 8) {
            ZStack(alignment: .bottomTrailing) {
                // Subtle glow behind active avatars
                if person.isActive {
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [Color.amberWarm.opacity(0.25), Color.amberWarm.opacity(0)],
                                center: .center,
                                startRadius: 0,
                                endRadius: 40
                            )
                        )
                        .frame(width: 72, height: 72)
                }

                // Avatar circle
                ZStack {
                    Circle()
                        .fill(Color.amberCard)
                        .frame(width: 56, height: 56)

                    Text(person.initials)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.amberText)
                }
                .overlay(
                    Circle()
                        .strokeBorder(
                            person.isActive
                                ? LinearGradient(
                                    colors: [.amberWarm, .amberGold],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                                : LinearGradient(
                                    colors: [Color.white.opacity(0.08), Color.white.opacity(0.04)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                            lineWidth: person.isActive ? 2.5 : 1
                        )
                )

                // Online indicator
                if person.isOnline {
                    Circle()
                        .fill(Color.amberSuccess)
                        .frame(width: 14, height: 14)
                        .overlay(
                            Circle()
                                .strokeBorder(Color.amberBackground, lineWidth: 2.5)
                        )
                        .offset(x: 2, y: 2)
                }
            }

            Text(person.name.components(separatedBy: " ").first ?? person.name)
                .font(.amberCaption)
                .foregroundColor(.amberSecondaryText)
                .lineLimit(1)
        }
        .frame(width: 64)
    }

    // MARK: - Circles Section

    private var circlesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Circles")
                .amberSectionHeader()
                .padding(.horizontal, 20)

            VStack(spacing: 0) {
                ForEach(Array(circleConversations.enumerated()), id: \.element.id) { index, circle in
                    circleRow(circle)
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 8)
                        .animation(
                            .spring(response: 0.35, dampingFraction: 0.75)
                                .delay(0.15 + Double(index) * 0.04),
                            value: appeared
                        )

                    if index < circleConversations.count - 1 {
                        Divider()
                            .background(Color.white.opacity(0.04))
                            .padding(.leading, 80)
                    }
                }
            }
            .padding(.vertical, 4)
            .amberCardStyle()
            .padding(.horizontal, 16)
        }
    }

    private func circleRow(_ circle: CircleConversation) -> some View {
        HStack(spacing: 14) {
            // Circle icon
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(circle.type.color.opacity(0.12))
                .frame(width: 48, height: 48)
                .overlay(
                    Image(systemName: circle.icon)
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(circle.type.color)
                )

            // Content
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text(circle.name)
                        .font(.amberSubheadline)
                        .fontWeight(circle.unreadCount > 0 ? .semibold : .regular)
                        .foregroundColor(.amberText)

                    if circle.hasAmberAgent {
                        Image(systemName: "hexagon.fill")
                            .font(.system(size: 8))
                            .foregroundColor(.amberGold)
                    }

                    typeBadge(circle.type)

                    Spacer()

                    Text(circle.timeAgo)
                        .font(.amberCaption)
                        .foregroundColor(.amberSecondaryText)
                }

                HStack {
                    Text(circle.lastMessage)
                        .font(.amberFootnote)
                        .foregroundColor(.amberSecondaryText)
                        .lineLimit(1)

                    Spacer()

                    if circle.unreadCount > 0 {
                        Text("\(circle.unreadCount)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.white)
                            .frame(minWidth: 20, minHeight: 20)
                            .background(circle.type.color, in: Circle())
                    }
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .contentShape(Rectangle())
    }

    private func typeBadge(_ type: CircleType) -> some View {
        Text(type.label)
            .font(.system(size: 9, weight: .bold))
            .foregroundColor(type.color)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(type.color.opacity(0.12), in: Capsule())
    }

    // MARK: - Other Section

    private var otherSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Button {
                withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                    otherExpanded.toggle()
                }
            } label: {
                HStack(spacing: 6) {
                    Text("Other")
                        .amberSectionHeader()

                    Image(systemName: "chevron.right")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(.amberSecondaryText)
                        .rotationEffect(.degrees(otherExpanded ? 90 : 0))

                    Spacer()
                }
                .padding(.horizontal, 20)
            }

            if otherExpanded {
                VStack(spacing: 0) {
                    ForEach(Array(otherConversations.enumerated()), id: \.element.id) { index, circle in
                        circleRow(circle)
                            .opacity(0.65)

                        if index < otherConversations.count - 1 {
                            Divider()
                                .background(Color.white.opacity(0.04))
                                .padding(.leading, 80)
                        }
                    }
                }
                .padding(.vertical, 4)
                .amberCardStyle()
                .padding(.horizontal, 16)
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
    }

    // MARK: - FAB

    private var fabButton: some View {
        Button {
            showCreateCircle = true
        } label: {
            Image(systemName: "plus")
                .font(.system(size: 22, weight: .semibold))
                .foregroundColor(.white)
                .frame(width: 56, height: 56)
                .background(
                    LinearGradient(
                        colors: [.amberWarm, .amberGold],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    in: Circle()
                )
                .shadow(color: .amberWarm.opacity(0.3), radius: 16, x: 0, y: 8)
        }
        .padding(.trailing, 20)
        .padding(.bottom, 140)
        .opacity(appeared ? 1 : 0)
        .scaleEffect(appeared ? 1 : 0.6)
        .animation(
            .spring(response: 0.35, dampingFraction: 0.75).delay(0.4),
            value: appeared
        )
    }

    // MARK: - Create Circle Sheet

    private var createCirclePlaceholder: some View {
        ZStack {
            Color.amberBackground.ignoresSafeArea()

            VStack(spacing: 20) {
                RoundedRectangle(cornerRadius: 3, style: .continuous)
                    .fill(Color.white.opacity(0.2))
                    .frame(width: 40, height: 5)
                    .padding(.top, 12)

                Spacer()

                VStack(spacing: 12) {
                    Image(systemName: "circle.hexagongrid.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [.amberWarm, .amberGold],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )

                    Text("Create a Circle")
                        .font(.amberTitle2)
                        .foregroundColor(.amberText)

                    Text("Coming soon")
                        .font(.amberFootnote)
                        .foregroundColor(.amberSecondaryText)
                }

                Spacer()
            }
        }
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
    }

    // MARK: - Sample Data

    private var closestPeople: [ClosestPerson] {
        [
            ClosestPerson(name: "Angela Chen", initials: "AC", isOnline: true, isActive: true),
            ClosestPerson(name: "Kaitlyn Lee", initials: "KL", isOnline: true, isActive: true),
            ClosestPerson(name: "Victor Reyes", initials: "VR", isOnline: false, isActive: true),
            ClosestPerson(name: "Michelle Park", initials: "MP", isOnline: true, isActive: false),
            ClosestPerson(name: "Rohan Mehta", initials: "RM", isOnline: false, isActive: true),
            ClosestPerson(name: "Priya Sharma", initials: "PS", isOnline: false, isActive: false),
            ClosestPerson(name: "Dev Patel", initials: "DP", isOnline: true, isActive: false),
            ClosestPerson(name: "Sindhu Tiwari", initials: "ST", isOnline: false, isActive: true),
        ]
    }

    private var circleConversations: [CircleConversation] {
        [
            CircleConversation(
                name: "MAYA Biotech",
                icon: "flask.fill",
                type: .manyToMany,
                lastMessage: "lab results came back — let's debrief tmrw",
                timeAgo: "4m",
                unreadCount: 3,
                hasAmberAgent: true
            ),
            CircleConversation(
                name: "Delta Gamma Chapter",
                icon: "triangle.fill",
                type: .manyToMany,
                lastMessage: "philanthropy event sign-ups due friday",
                timeAgo: "12m",
                unreadCount: 7,
                hasAmberAgent: false
            ),
            CircleConversation(
                name: "CS 270 Study Group",
                icon: "chevron.left.forwardslash.chevron.right",
                type: .manyToMany,
                lastMessage: "anyone free to review proofs tonight?",
                timeAgo: "28m",
                unreadCount: 2,
                hasAmberAgent: false
            ),
            CircleConversation(
                name: "Angela & Me",
                icon: "person.fill",
                type: .oneToOne,
                lastMessage: "omg yes that sounds perfect",
                timeAgo: "35m",
                unreadCount: 1,
                hasAmberAgent: true
            ),
            CircleConversation(
                name: "Victor & Me",
                icon: "person.fill",
                type: .oneToOne,
                lastMessage: "see you at the gym at 6",
                timeAgo: "1h",
                unreadCount: 0,
                hasAmberAgent: false
            ),
            CircleConversation(
                name: "Club Announcements",
                icon: "megaphone.fill",
                type: .oneToMany,
                lastMessage: "meeting moved to THH 301 this week",
                timeAgo: "2h",
                unreadCount: 0,
                hasAmberAgent: true
            ),
            CircleConversation(
                name: "Family",
                icon: "heart.fill",
                type: .manyToMany,
                lastMessage: "call me when you can beta",
                timeAgo: "3h",
                unreadCount: 1,
                hasAmberAgent: false
            ),
            CircleConversation(
                name: "Roommates",
                icon: "house.fill",
                type: .manyToMany,
                lastMessage: "who took my oat milk",
                timeAgo: "5h",
                unreadCount: 0,
                hasAmberAgent: false
            ),
        ]
    }

    private var otherConversations: [CircleConversation] {
        [
            CircleConversation(
                name: "USC Housing",
                icon: "building.2.fill",
                type: .oneToMany,
                lastMessage: "room selection opens April 1",
                timeAgo: "1d",
                unreadCount: 0,
                hasAmberAgent: false
            ),
            CircleConversation(
                name: "Intramural Soccer",
                icon: "figure.soccer",
                type: .manyToMany,
                lastMessage: "game rescheduled to wednesday",
                timeAgo: "2d",
                unreadCount: 0,
                hasAmberAgent: false
            ),
            CircleConversation(
                name: "Orientation Group 14",
                icon: "person.3.fill",
                type: .manyToMany,
                lastMessage: "throwback to week 1 lol",
                timeAgo: "5d",
                unreadCount: 0,
                hasAmberAgent: false
            ),
        ]
    }
}

// MARK: - Preview

#Preview {
    MessagingView()
        .preferredColorScheme(.dark)
}
