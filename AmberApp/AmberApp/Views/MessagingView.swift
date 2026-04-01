//
//  MessagingView.swift
//  AmberApp
//
//  Three-section messaging: Communities, Channels, Direct Messages.
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

    var body: some View {
        NavigationStack {
            ScrollView(.vertical, showsIndicators: false) {
                VStack(spacing: 24) {
                    communitiesSection
                    channelsSection
                    directMessagesSection
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

    // MARK: - Communities Section (many-to-many)

    private var communitiesSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("COMMUNITIES")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(Color.amberSecondaryText)
                .tracking(1)
                .padding(.horizontal, 20)

            VStack(spacing: 0) {
                ForEach(Array(Community.samples.enumerated()), id: \.element.id) { index, community in
                    NavigationLink {
                        CommunityDetailView(community: community)
                    } label: {
                        communityRow(community)
                    }
                    .buttonStyle(.plain)

                    if index < Community.samples.count - 1 {
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

    private func communityRow(_ community: Community) -> some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(community.avatarColor)
                    .frame(width: 44, height: 44)
                Image(systemName: community.icon)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(.white)
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text(community.name)
                        .font(.amberBody)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.amberText)
                        .lineLimit(1)

                    Image(systemName: "hexagon.fill")
                        .font(.system(size: 8))
                        .foregroundStyle(Color.amberWarm)

                    Spacer()

                    Text(community.lastActivity)
                        .font(.amberCaption)
                        .foregroundStyle(Color.amberSecondaryText)
                }

                HStack {
                    Text(community.subGroupPreview)
                        .font(.amberCaption)
                        .foregroundStyle(Color.amberSecondaryText)
                        .lineLimit(1)

                    Spacer()

                    if community.totalUnread > 0 {
                        Text("\(community.totalUnread)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundStyle(.white)
                            .frame(minWidth: 20, minHeight: 20)
                            .background(Color.amberWarm, in: Circle())
                    }

                    Image(systemName: "chevron.right")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(Color.amberTertiaryText)
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .contentShape(Rectangle())
    }

    // MARK: - Channels Section (one-to-many)

    private var channelsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("CHANNELS")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(Color.amberSecondaryText)
                .tracking(1)
                .padding(.horizontal, 20)

            VStack(spacing: 0) {
                ForEach(Array(channelData.enumerated()), id: \.element.id) { index, convo in
                    NavigationLink {
                        ChatDetailView(conversationName: convo.name, hasAmberAgent: convo.hasAmberAgent)
                    } label: {
                        conversationRow(convo)
                    }
                    .buttonStyle(.plain)

                    if index < channelData.count - 1 {
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

    // MARK: - Direct Messages Section (one-to-one)

    private var directMessagesSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("DIRECT MESSAGES")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(Color.amberSecondaryText)
                .tracking(1)
                .padding(.horizontal, 20)

            VStack(spacing: 0) {
                ForEach(Array(dmData.enumerated()), id: \.element.id) { index, convo in
                    NavigationLink {
                        ChatDetailView(conversationName: convo.name, hasAmberAgent: convo.hasAmberAgent)
                    } label: {
                        conversationRow(convo)
                    }
                    .buttonStyle(.plain)

                    if index < dmData.count - 1 {
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
                        Image(systemName: "sparkles")
                            .font(.system(size: 10, weight: .semibold))
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

    private var channelData: [Conversation] {
        [
            Conversation(name: "Club Announcements", icon: "megaphone.fill", lastMessage: "meeting moved to THH 301 this week", timeAgo: "2h", unreadCount: 0, hasActivity: true, hasAmberAgent: false),
            Conversation(name: "TA Updates — CS 270", icon: "graduationcap.fill", lastMessage: "office hours cancelled tomorrow", timeAgo: "4h", unreadCount: 1, hasActivity: false, hasAmberAgent: false),
            Conversation(name: "Sigma Chi Exec Board", icon: "crown.fill", lastMessage: "budget proposal due friday", timeAgo: "1d", unreadCount: 0, hasActivity: false, hasAmberAgent: false),
            Conversation(name: "MAYA Weekly Brief", icon: "doc.text.fill", lastMessage: "sprint 4 recap + Q2 goals", timeAgo: "1d", unreadCount: 0, hasActivity: false, hasAmberAgent: false),
            Conversation(name: "Campus Safety Alerts", icon: "exclamationmark.shield.fill", lastMessage: "reminder: emergency drill Thursday 2pm", timeAgo: "3d", unreadCount: 0, hasActivity: false, hasAmberAgent: false),
        ]
    }

    private var dmData: [Conversation] {
        [
            // Amber AI pinned at top
            Conversation(name: "Amber AI", icon: "hexagon.fill", lastMessage: "3 birthdays coming up this week!", timeAgo: "now", unreadCount: 1, hasActivity: true, hasAmberAgent: true),
            Conversation(name: "Angela & Me", icon: "person.fill", lastMessage: "omg yes that sounds perfect", timeAgo: "35m", unreadCount: 1, hasActivity: true, hasAmberAgent: false),
            Conversation(name: "Victor & Me", icon: "person.fill", lastMessage: "see you at the gym at 6", timeAgo: "1h", unreadCount: 0, hasActivity: false, hasAmberAgent: false),
            Conversation(name: "Mom", icon: "heart.fill", lastMessage: "call me when you can beta", timeAgo: "3h", unreadCount: 1, hasActivity: false, hasAmberAgent: false),
            Conversation(name: "Dev Kumar", icon: "person.fill", lastMessage: "sent the BMA deck to your email", timeAgo: "5h", unreadCount: 0, hasActivity: false, hasAmberAgent: false),
            Conversation(name: "Roommate — Roy", icon: "house.fill", lastMessage: "who took my oat milk", timeAgo: "6h", unreadCount: 0, hasActivity: false, hasAmberAgent: false),
        ]
    }
}

// MARK: - Preview

#Preview {
    MessagingView()
}
