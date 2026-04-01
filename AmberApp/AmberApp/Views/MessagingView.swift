//
//  MessagingView.swift
//  AmberApp
//
//  Minimal dark messaging view — search bar, status bubbles,
//  Circles + Other sections in liquid glass cards.
//

import SwiftUI

// MARK: - Data Models

struct Conversation: Identifiable {
    let id = UUID()
    let name: String
    let icon: String
    let lastMessage: String
    let timeAgo: String
    let unreadCount: Int
    let hasActivity: Bool
    let hasAmberAgent: Bool
}

// MARK: - MessagingView

struct MessagingView: View {
    @State private var showCompose = false
    @State private var searchText = ""

    private var filteredCircles: [Conversation] {
        guard !searchText.isEmpty else { return circleData }
        let q = searchText.lowercased()
        return circleData.filter {
            $0.name.lowercased().contains(q) || $0.lastMessage.lowercased().contains(q)
        }
    }

    private var filteredOther: [Conversation] {
        guard !searchText.isEmpty else { return otherData }
        let q = searchText.lowercased()
        return otherData.filter {
            $0.name.lowercased().contains(q) || $0.lastMessage.lowercased().contains(q)
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView(.vertical, showsIndicators: false) {
                VStack(spacing: 20) {
                    // Search bar
                    searchBar

                    // Status bubbles
                    StatusRowView(statuses: StatusNote.samples) {
                        print("[StatusNote] Your note tapped — compose sheet TBD")
                    }

                    // Conversation sections
                    if !filteredCircles.isEmpty {
                        circlesSection
                    }
                    if !filteredOther.isEmpty {
                        otherSection
                    }

                    // Empty state when search yields nothing
                    if filteredCircles.isEmpty && filteredOther.isEmpty && !searchText.isEmpty {
                        VStack(spacing: 10) {
                            Image(systemName: "magnifyingglass")
                                .font(.system(size: 32, weight: .light))
                                .foregroundStyle(Color.amberTertiaryText)
                            Text("No conversations found")
                                .font(.amberCaption)
                                .foregroundStyle(Color.amberSecondaryText)
                        }
                        .padding(.top, 40)
                    }
                }
                .padding(.top, 8)
                .padding(.bottom, 120)
            }
            .background(Color.black.ignoresSafeArea())
            .navigationTitle("Messages")
            .navigationBarTitleDisplayMode(.large)
            .toolbarBackground(Color.black, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { showCompose = true } label: {
                        Image(systemName: "square.and.pencil")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(Color.amberText)
                            .frame(width: 32, height: 32)
                            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 8, style: .continuous)
                                    .strokeBorder(Color.glassStroke, lineWidth: 0.5)
                            )
                    }
                }
            }
            .sheet(isPresented: $showCompose) {
                composePlaceholder
            }
        }
        .preferredColorScheme(.dark)
    }

    // MARK: - Search Bar

    private var searchBar: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(Color.amberSecondaryText)

            TextField("Search", text: $searchText)
                .font(.system(size: 16))
                .foregroundStyle(Color.amberText)

            if !searchText.isEmpty {
                Button { searchText = "" } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 16))
                        .foregroundStyle(Color.amberSecondaryText)
                }
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(Color(hex: "1F2C34"), in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        .padding(.horizontal, 16)
    }

    // MARK: - Circles Section

    private var circlesSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("CIRCLES")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(Color.amberSecondaryText)
                .tracking(1)
                .padding(.horizontal, 20)

            VStack(spacing: 0) {
                ForEach(Array(filteredCircles.enumerated()), id: \.element.id) { index, convo in
                    NavigationLink {
                        ChatDetailView(conversationName: convo.name, hasAmberAgent: convo.hasAmberAgent)
                    } label: {
                        conversationRow(convo)
                    }
                    .buttonStyle(.plain)

                    if index < filteredCircles.count - 1 {
                        Color.glassStroke
                            .frame(height: 0.5)
                            .padding(.leading, 68)
                    }
                }
            }
            .liquidGlassCard()
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Other Section

    private var otherSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("OTHER")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(Color.amberSecondaryText)
                .tracking(1)
                .padding(.horizontal, 20)

            VStack(spacing: 0) {
                ForEach(Array(filteredOther.enumerated()), id: \.element.id) { index, convo in
                    NavigationLink {
                        ChatDetailView(conversationName: convo.name, hasAmberAgent: convo.hasAmberAgent)
                    } label: {
                        conversationRow(convo)
                    }
                    .buttonStyle(.plain)

                    if index < filteredOther.count - 1 {
                        Color.glassStroke
                            .frame(height: 0.5)
                            .padding(.leading, 68)
                    }
                }
            }
            .liquidGlassCard()
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Conversation Row

    private func conversationRow(_ convo: Conversation) -> some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color.amberSurface)
                    .frame(width: 44, height: 44)
                Image(systemName: convo.icon)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(Color.amberSecondaryText)
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text(convo.name)
                        .font(.amberBody)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.amberText)
                        .lineLimit(1)

                    if convo.hasActivity {
                        Circle()
                            .fill(Color.amberWarm)
                            .frame(width: 7, height: 7)
                    }

                    if convo.hasAmberAgent {
                        Image(systemName: "hexagon.fill")
                            .font(.system(size: 8))
                            .foregroundStyle(Color.amberWarm)
                    }

                    Spacer()

                    Text(convo.timeAgo)
                        .font(.amberCaption)
                        .foregroundStyle(Color.amberSecondaryText)
                }

                HStack {
                    Text(convo.lastMessage)
                        .font(.amberCaption)
                        .foregroundStyle(Color.amberSecondaryText)
                        .lineLimit(1)

                    Spacer()

                    if convo.unreadCount > 0 {
                        Text("\(convo.unreadCount)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundStyle(.white)
                            .frame(minWidth: 20, minHeight: 20)
                            .background(Color.amberWarm, in: Circle())
                    }
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .contentShape(Rectangle())
    }

    // MARK: - Compose Placeholder

    private var composePlaceholder: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            VStack(spacing: 20) {
                RoundedRectangle(cornerRadius: 3, style: .continuous)
                    .fill(Color.white.opacity(0.2))
                    .frame(width: 40, height: 5)
                    .padding(.top, 12)
                Spacer()
                VStack(spacing: 12) {
                    Image(systemName: "circle.hexagongrid.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(Color.amberWarm)
                    Text("New Message")
                        .font(.amberTitle2)
                        .foregroundStyle(Color.amberText)
                    Text("Coming soon")
                        .font(.amberFootnote)
                        .foregroundStyle(Color.amberSecondaryText)
                }
                Spacer()
            }
        }
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
    }

    // MARK: - Sample Data

    private var circleData: [Conversation] {
        [
            Conversation(name: "MAYA Biotech", icon: "flask.fill", lastMessage: "lab results came back — let's debrief tmrw", timeAgo: "4m", unreadCount: 3, hasActivity: false, hasAmberAgent: true),
            Conversation(name: "Delta Gamma Chapter", icon: "shield.fill", lastMessage: "philanthropy event sign-ups due friday", timeAgo: "12m", unreadCount: 7, hasActivity: false, hasAmberAgent: false),
            Conversation(name: "CS 270 Study Group", icon: "chevron.left.forwardslash.chevron.right", lastMessage: "anyone free to review proofs tonight?", timeAgo: "28m", unreadCount: 2, hasActivity: false, hasAmberAgent: false),
            Conversation(name: "Angela & Me", icon: "person.fill", lastMessage: "omg yes that sounds perfect", timeAgo: "35m", unreadCount: 1, hasActivity: true, hasAmberAgent: true),
        ]
    }

    private var otherData: [Conversation] {
        [
            Conversation(name: "Victor & Me", icon: "person.fill", lastMessage: "see you at the gym at 6", timeAgo: "1h", unreadCount: 0, hasActivity: false, hasAmberAgent: false),
            Conversation(name: "Club Announcements", icon: "megaphone.fill", lastMessage: "meeting moved to THH 301 this week", timeAgo: "2h", unreadCount: 0, hasActivity: true, hasAmberAgent: true),
            Conversation(name: "Family", icon: "heart.fill", lastMessage: "call me when you can beta", timeAgo: "3h", unreadCount: 1, hasActivity: false, hasAmberAgent: false),
            Conversation(name: "Roommates", icon: "house.fill", lastMessage: "who took my oat milk", timeAgo: "5h", unreadCount: 0, hasActivity: false, hasAmberAgent: false),
            Conversation(name: "Intramural Soccer", icon: "figure.soccer", lastMessage: "game time changed to 4pm", timeAgo: "2d", unreadCount: 0, hasActivity: false, hasAmberAgent: false),
        ]
    }
}

// MARK: - Preview

#Preview {
    MessagingView()
}
