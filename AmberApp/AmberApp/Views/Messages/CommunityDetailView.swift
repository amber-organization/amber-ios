//
//  CommunityDetailView.swift
//  AmberApp
//
//  WhatsApp-style community detail — Amber agent, announcements, sub-groups.
//

import SwiftUI

struct CommunityDetailView: View {
    let community: Community

    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(spacing: 0) {
                // Header
                communityHeader

                // Amber agent row
                amberRow

                divider

                // Announcements
                groupRow(community.announcements, isAnnouncement: true)

                // Joined groups
                if !community.joinedGroups.isEmpty {
                    sectionHeader("Groups you're in")
                    VStack(spacing: 0) {
                        ForEach(Array(community.joinedGroups.enumerated()), id: \.element.id) { index, group in
                            NavigationLink {
                                ChatDetailView(conversationName: group.name, hasAmberAgent: false)
                            } label: {
                                groupRow(group)
                            }
                            .buttonStyle(.plain)

                            if index < community.joinedGroups.count - 1 {
                                Color.glassStroke.frame(height: 0.5).padding(.leading, 68)
                            }
                        }
                    }
                    .liquidGlassCard()
                    .padding(.horizontal, 16)
                }

                // Available groups
                if !community.availableGroups.isEmpty {
                    sectionHeader("Groups you can join")
                    VStack(spacing: 0) {
                        ForEach(Array(community.availableGroups.enumerated()), id: \.element.id) { index, group in
                            joinableGroupRow(group)

                            if index < community.availableGroups.count - 1 {
                                Color.glassStroke.frame(height: 0.5).padding(.leading, 68)
                            }
                        }
                    }
                    .liquidGlassCard()
                    .padding(.horizontal, 16)
                }

                // Add group button
                addGroupButton
            }
            .padding(.bottom, 120)
        }
        .background(Color.black.ignoresSafeArea())
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Color.black, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .principal) {
                VStack(spacing: 1) {
                    Text(community.name)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(Color.amberText)
                    Text("Community")
                        .font(.system(size: 11))
                        .foregroundStyle(Color.amberSecondaryText)
                }
            }
            ToolbarItem(placement: .topBarTrailing) {
                Button {} label: {
                    Image(systemName: "ellipsis")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(Color.amberText)
                }
            }
        }
    }

    // MARK: - Header

    private var communityHeader: some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(community.avatarColor)
                    .frame(width: 72, height: 72)
                Image(systemName: community.icon)
                    .font(.system(size: 28, weight: .medium))
                    .foregroundStyle(.white)
            }

            Text(community.name)
                .font(.amberTitle2)
                .foregroundStyle(Color.amberText)

            Text("Community")
                .font(.amberCaption)
                .foregroundStyle(Color.amberSecondaryText)
        }
        .padding(.top, 20)
        .padding(.bottom, 24)
    }

    // MARK: - Amber Agent Row

    private var amberRow: some View {
        NavigationLink {
            ChatDetailView(
                conversationName: "Amber",
                hasAmberAgent: true,
                customSystemPrompt: community.amberSystemPrompt,
                customGreeting: community.amberGreeting
            )
        } label: {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(Color.amberWarm)
                        .frame(width: 44, height: 44)
                    Image(systemName: "hexagon.fill")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundStyle(.white)
                }

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text("Amber")
                            .font(.amberBody)
                            .fontWeight(.semibold)
                            .foregroundStyle(Color.amberText)
                        Image(systemName: "sparkles")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundStyle(Color.amberWarm)
                    }
                    Text("AI assistant for this community")
                        .font(.amberCaption)
                        .foregroundStyle(Color.amberSecondaryText)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(Color.amberTertiaryText)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
        }
        .buttonStyle(.plain)
        .liquidGlassCard()
        .padding(.horizontal, 16)
        .padding(.bottom, 8)
    }

    // MARK: - Group Row

    private func groupRow(_ group: CommunityGroup, isAnnouncement: Bool = false) -> some View {
        let content = HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(isAnnouncement ? Color.amberGold.opacity(0.2) : Color.amberSurface)
                    .frame(width: 44, height: 44)
                Image(systemName: group.icon)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(isAnnouncement ? Color.amberGold : Color.amberSecondaryText)
            }

            VStack(alignment: .leading, spacing: 3) {
                HStack {
                    Text(group.name)
                        .font(.amberBody)
                        .fontWeight(.medium)
                        .foregroundStyle(Color.amberText)
                        .lineLimit(1)
                    Spacer()
                    if !group.timeAgo.isEmpty {
                        Text(group.timeAgo)
                            .font(.amberCaption)
                            .foregroundStyle(Color.amberSecondaryText)
                    }
                }
                if !group.lastMessage.isEmpty {
                    HStack {
                        Text(group.lastMessage)
                            .font(.amberCaption)
                            .foregroundStyle(Color.amberSecondaryText)
                            .lineLimit(1)
                        Spacer()
                        if group.unreadCount > 0 {
                            Text("\(group.unreadCount)")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundStyle(.white)
                                .frame(minWidth: 20, minHeight: 20)
                                .background(Color.amberWarm, in: Circle())
                        }
                    }
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .contentShape(Rectangle())

        if isAnnouncement {
            return AnyView(
                NavigationLink {
                    ChatDetailView(conversationName: group.name, hasAmberAgent: false)
                } label: {
                    content
                }
                .buttonStyle(.plain)
                .liquidGlassCard()
                .padding(.horizontal, 16)
                .padding(.bottom, 8)
            )
        } else {
            return AnyView(content)
        }
    }

    // MARK: - Joinable Group Row

    private func joinableGroupRow(_ group: CommunityGroup) -> some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color.amberSurface)
                    .frame(width: 44, height: 44)
                Image(systemName: group.icon)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(Color.amberTertiaryText)
            }

            Text(group.name)
                .font(.amberBody)
                .foregroundStyle(Color.amberSecondaryText)

            Spacer()

            Button {} label: {
                Text("Join")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Color.amberWarm)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 6)
                    .background(Color.amberWarm.opacity(0.15), in: Capsule())
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
    }

    // MARK: - Section Header

    private func sectionHeader(_ title: String) -> some View {
        HStack {
            Text(title.uppercased())
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(Color.amberSecondaryText)
                .tracking(1)
            Spacer()
        }
        .padding(.horizontal, 20)
        .padding(.top, 20)
        .padding(.bottom, 8)
    }

    // MARK: - Add Group Button

    private var addGroupButton: some View {
        Button {} label: {
            HStack {
                Image(systemName: "plus")
                    .font(.system(size: 14, weight: .semibold))
                Text("Add group")
                    .font(.system(size: 15, weight: .semibold))
            }
            .foregroundStyle(Color.amberWarm)
            .frame(maxWidth: .infinity)
            .frame(height: 48)
            .background(Color.amberWarm.opacity(0.12), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .strokeBorder(Color.amberWarm.opacity(0.3), lineWidth: 0.5)
            )
        }
        .padding(.horizontal, 16)
        .padding(.top, 20)
    }

    // MARK: - Helpers

    private var divider: some View {
        Color.glassStroke.frame(height: 0.5).padding(.horizontal, 16).padding(.vertical, 4)
    }
}
