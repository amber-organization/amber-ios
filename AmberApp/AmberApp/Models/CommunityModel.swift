//
//  CommunityModel.swift
//  AmberApp
//
//  WhatsApp-style Communities with embedded Amber AI agents.
//

import SwiftUI

struct CommunityGroup: Identifiable {
    let id = UUID()
    let name: String
    let icon: String
    let lastMessage: String
    let timeAgo: String
    let unreadCount: Int
}

struct Community: Identifiable {
    let id = UUID()
    let name: String
    let icon: String
    let avatarColor: Color
    let amberSystemPrompt: String
    let amberGreeting: String
    let announcements: CommunityGroup
    let joinedGroups: [CommunityGroup]
    let availableGroups: [CommunityGroup]
    let lastActivity: String
    let totalUnread: Int

    var subGroupPreview: String {
        let names = joinedGroups.prefix(3).map(\.name)
        return names.joined(separator: ", ")
    }
}

// MARK: - Sample Data

extension Community {
    static let samples: [Community] = [
        // Sigma Chi
        Community(
            name: "Sigma Chi",
            icon: "shield.fill",
            avatarColor: Color(hex: "1E3A5F"),
            amberSystemPrompt: "You are the Amber agent for Sigma Chi fraternity at USC. Help members with rush events, brotherhood activities, dues, chapter meetings, and social events. Be friendly and fraternal.",
            amberGreeting: "Hey! I'm Amber for Sigma Chi. Ask me about upcoming events, chapter duties, rush, or anything else.",
            announcements: CommunityGroup(name: "Announcements", icon: "megaphone.fill", lastMessage: "Chapter meeting moved to Thursday 7pm", timeAgo: "2h", unreadCount: 1),
            joinedGroups: [
                CommunityGroup(name: "Rush Committee", icon: "person.badge.plus", lastMessage: "~ Jake: new rushee list is out", timeAgo: "15m", unreadCount: 4),
                CommunityGroup(name: "Brotherhood Events", icon: "figure.2.arms.open", lastMessage: "camping trip confirmed for April 12", timeAgo: "1h", unreadCount: 0),
                CommunityGroup(name: "Social Chair", icon: "party.popper.fill", lastMessage: "mixer with DG this friday", timeAgo: "3h", unreadCount: 2),
                CommunityGroup(name: "Pledges Spring '26", icon: "star.fill", lastMessage: "~ Marcus: study hours tomorrow?", timeAgo: "4h", unreadCount: 0),
                CommunityGroup(name: "Intramural Sports", icon: "figure.run", lastMessage: "basketball game at 6pm", timeAgo: "5h", unreadCount: 0),
                CommunityGroup(name: "Exec Board", icon: "crown.fill", lastMessage: "budget proposal due friday", timeAgo: "1d", unreadCount: 0),
            ],
            availableGroups: [
                CommunityGroup(name: "Alumni Network", icon: "person.3.fill", lastMessage: "", timeAgo: "", unreadCount: 0),
                CommunityGroup(name: "Philanthropy Committee", icon: "heart.fill", lastMessage: "", timeAgo: "", unreadCount: 0),
            ],
            lastActivity: "15m",
            totalUnread: 7
        ),

        // MAYA Biotech
        Community(
            name: "MAYA Biotech",
            icon: "flask.fill",
            avatarColor: .healthPhysical,
            amberSystemPrompt: "You are the Amber agent for MAYA Biotech at USC. Help members track lab schedules, research deadlines, funding applications, team meetings, and project updates. Be precise and helpful.",
            amberGreeting: "Hi! I'm Amber for MAYA Biotech. Ask me about lab schedules, deadlines, funding, or team updates.",
            announcements: CommunityGroup(name: "Announcements", icon: "megaphone.fill", lastMessage: "Lab access hours changing next week", timeAgo: "30m", unreadCount: 1),
            joinedGroups: [
                CommunityGroup(name: "Lab Team Alpha", icon: "atom", lastMessage: "~ Dev: results look promising", timeAgo: "4m", unreadCount: 3),
                CommunityGroup(name: "Funding & Grants", icon: "dollarsign.circle.fill", lastMessage: "NIH deadline extended to April 15", timeAgo: "2h", unreadCount: 0),
                CommunityGroup(name: "Weekly Standup", icon: "calendar.badge.clock", lastMessage: "standup notes posted", timeAgo: "6h", unreadCount: 0),
                CommunityGroup(name: "Product Dev", icon: "wrench.and.screwdriver.fill", lastMessage: "~ Angela: prototype v2 ready", timeAgo: "1d", unreadCount: 1),
                CommunityGroup(name: "Investor Relations", icon: "chart.line.uptrend.xyaxis", lastMessage: "pitch deck final review", timeAgo: "2d", unreadCount: 0),
            ],
            availableGroups: [
                CommunityGroup(name: "Advisory Board Chat", icon: "person.2.circle.fill", lastMessage: "", timeAgo: "", unreadCount: 0),
            ],
            lastActivity: "4m",
            totalUnread: 5
        ),

        // CS 270
        Community(
            name: "CS 270 — Intro to Algorithms",
            icon: "chevron.left.forwardslash.chevron.right",
            avatarColor: .amberBlue,
            amberSystemPrompt: "You are the Amber agent for CS 270 Intro to Algorithms at USC. Help students with assignment deadlines, study groups, office hours, exam prep, and course logistics. Be encouraging and clear.",
            amberGreeting: "Hey! I'm Amber for CS 270. Ask me about assignments, study groups, office hours, or exam prep.",
            announcements: CommunityGroup(name: "Announcements", icon: "megaphone.fill", lastMessage: "Midterm 2 on April 8 — review session Friday", timeAgo: "1h", unreadCount: 1),
            joinedGroups: [
                CommunityGroup(name: "Study Group 4", icon: "book.fill", lastMessage: "~ Arjun: meeting at Leavey at 7?", timeAgo: "28m", unreadCount: 2),
                CommunityGroup(name: "Homework Help", icon: "questionmark.circle.fill", lastMessage: "anyone get Q3 on problem set 6?", timeAgo: "3h", unreadCount: 0),
                CommunityGroup(name: "Office Hours Q&A", icon: "person.fill.questionmark", lastMessage: "Prof said dynamic programming is fair game", timeAgo: "1d", unreadCount: 0),
                CommunityGroup(name: "Final Exam Prep", icon: "pencil.and.ruler.fill", lastMessage: "sharing my notes from lecture 12", timeAgo: "2d", unreadCount: 0),
            ],
            availableGroups: [
                CommunityGroup(name: "TA Chat", icon: "person.badge.shield.checkmark.fill", lastMessage: "", timeAgo: "", unreadCount: 0),
                CommunityGroup(name: "Project Partners", icon: "person.2.fill", lastMessage: "", timeAgo: "", unreadCount: 0),
            ],
            lastActivity: "28m",
            totalUnread: 3
        ),

        // Trojan Knights
        Community(
            name: "USC Trojan Knights",
            icon: "shield.lefthalf.filled",
            avatarColor: Color(hex: "9E1B32"),
            amberSystemPrompt: "You are the Amber agent for USC Trojan Knights. Help members with service events, meeting schedules, new member orientation, and campus traditions. Be spirited and supportive.",
            amberGreeting: "Fight on! I'm Amber for Trojan Knights. Ask about service events, meetings, or traditions.",
            announcements: CommunityGroup(name: "Announcements", icon: "megaphone.fill", lastMessage: "New member ceremony Saturday at 3pm", timeAgo: "5h", unreadCount: 0),
            joinedGroups: [
                CommunityGroup(name: "Service Events", icon: "hands.sparkles.fill", lastMessage: "beach cleanup this Sunday", timeAgo: "6h", unreadCount: 1),
                CommunityGroup(name: "New Member Class", icon: "star.fill", lastMessage: "~ Michelle: when is the next meeting?", timeAgo: "1d", unreadCount: 0),
                CommunityGroup(name: "Traditions Committee", icon: "building.columns.fill", lastMessage: "song girl tryouts coordination", timeAgo: "3d", unreadCount: 0),
            ],
            availableGroups: [
                CommunityGroup(name: "Alumni Council", icon: "graduationcap.fill", lastMessage: "", timeAgo: "", unreadCount: 0),
            ],
            lastActivity: "5h",
            totalUnread: 1
        ),

        // Delta Gamma
        Community(
            name: "Delta Gamma",
            icon: "shield.fill",
            avatarColor: Color(hex: "C4A35A"),
            amberSystemPrompt: "You are the Amber agent for Delta Gamma chapter at USC. Help with philanthropy events, sisterhood activities, mixers, and chapter updates. Be warm and supportive.",
            amberGreeting: "Hey! I'm Amber for Delta Gamma. Ask about philanthropy, sisterhood events, mixers, or chapter news.",
            announcements: CommunityGroup(name: "Announcements", icon: "megaphone.fill", lastMessage: "Anchor Splash prep meeting Wednesday", timeAgo: "12m", unreadCount: 2),
            joinedGroups: [
                CommunityGroup(name: "Philanthropy", icon: "heart.fill", lastMessage: "volunteer sign-up sheet is live", timeAgo: "1h", unreadCount: 1),
                CommunityGroup(name: "Sisterhood Events", icon: "figure.2.arms.open", lastMessage: "paint night this Thursday!", timeAgo: "4h", unreadCount: 0),
                CommunityGroup(name: "Mixer Planning", icon: "party.popper.fill", lastMessage: "~ Kaitlyn: sigma chi confirmed for friday", timeAgo: "6h", unreadCount: 3),
                CommunityGroup(name: "Anchor Splash Committee", icon: "drop.fill", lastMessage: "need 5 more volunteers", timeAgo: "1d", unreadCount: 0),
            ],
            availableGroups: [
                CommunityGroup(name: "Alumnae Network", icon: "person.3.fill", lastMessage: "", timeAgo: "", unreadCount: 0),
            ],
            lastActivity: "12m",
            totalUnread: 6
        ),
    ]
}
