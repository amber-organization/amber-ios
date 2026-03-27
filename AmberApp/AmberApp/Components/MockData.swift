//
//  MockData.swift
//  AmberApp
//

import SwiftUI

// MARK: - Mock Contact

struct MockContact: Identifiable {
    let id = UUID()
    let name: String
    let relationship: String
    let lastInteraction: String
    let daysAgo: Int
    let isFavorite: Bool
    let tags: [String]
    let sharedEvents: [String]
    let connectionStrength: Double
    let recentInteractions: [MockInteraction]

    var initials: String {
        let parts = name.components(separatedBy: " ")
        let first = parts.first?.prefix(1) ?? ""
        let last = parts.count > 1 ? parts.last?.prefix(1) ?? "" : ""
        return "\(first)\(last)".uppercased()
    }

    var isRecent: Bool { daysAgo <= 3 }

    var firstLetter: String {
        String(name.prefix(1)).uppercased()
    }
}

struct MockInteraction: Identifiable {
    let id = UUID()
    let icon: String
    let description: String
    let timeAgo: String
}

// MARK: - Mock Chat

struct MockChat: Identifiable {
    let id = UUID()
    let name: String
    let emoji: String?
    let lastMessage: String
    let timestamp: String
    let unreadCount: Int
    let memberCount: Int?
    let isGroup: Bool
    let messages: [MockMessage]
}

struct MockMessage: Identifiable {
    let id = UUID()
    let text: String
    let isOutgoing: Bool
    let senderName: String?
    let timestamp: String
}

// MARK: - Mock Widget

struct MockWidget: Identifiable {
    let id = UUID()
    let emoji: String
    let title: String
    let subtitle: String?
    let actionLabel: String?
    let gradientColors: [Color]
    let type: WidgetType

    enum WidgetType {
        case birthday, achievement, health, suggestion, countdown, insight, social, reminder
    }
}

// MARK: - Mock Data Store

enum MockData {
    // MARK: - Contacts
    static let contacts: [MockContact] = [
        MockContact(name: "Maya Chen", relationship: "Close Friend", lastInteraction: "Today", daysAgo: 0, isFavorite: true, tags: ["Friend", "College"], sharedEvents: ["Japan Trip March", "Book Club"], connectionStrength: 0.92, recentInteractions: [
            MockInteraction(icon: "message.fill", description: "Chatted about Japan trip", timeAgo: "2h ago"),
            MockInteraction(icon: "phone.fill", description: "Video call", timeAgo: "2 days ago"),
            MockInteraction(icon: "calendar", description: "Book Club meeting", timeAgo: "5 days ago"),
        ]),
        MockContact(name: "James Rodriguez", relationship: "Gym Buddy", lastInteraction: "Today", daysAgo: 0, isFavorite: true, tags: ["Friend", "Fitness"], sharedEvents: ["Sunday Hoops", "Fantasy Football"], connectionStrength: 0.85, recentInteractions: [
            MockInteraction(icon: "figure.run", description: "Workout together", timeAgo: "5h ago"),
            MockInteraction(icon: "message.fill", description: "Shared workout plan", timeAgo: "1 day ago"),
            MockInteraction(icon: "sportscourt.fill", description: "Sunday basketball", timeAgo: "4 days ago"),
        ]),
        MockContact(name: "Priya Patel", relationship: "Work", lastInteraction: "Yesterday", daysAgo: 1, isFavorite: true, tags: ["Work", "Friend"], sharedEvents: ["Startup Ideas", "Amber Team"], connectionStrength: 0.88, recentInteractions: [
            MockInteraction(icon: "laptopcomputer", description: "Brainstorm session", timeAgo: "1 day ago"),
            MockInteraction(icon: "message.fill", description: "Discussed prototype", timeAgo: "2 days ago"),
            MockInteraction(icon: "cup.and.saucer.fill", description: "Coffee catch-up", timeAgo: "1 week ago"),
        ]),
        MockContact(name: "Alex Kim", relationship: "College Friend", lastInteraction: "2 days ago", daysAgo: 2, isFavorite: true, tags: ["Friend", "College"], sharedEvents: ["Japan Trip March", "Coachella 2026"], connectionStrength: 0.80, recentInteractions: [
            MockInteraction(icon: "airplane", description: "Booked flights together", timeAgo: "2 days ago"),
            MockInteraction(icon: "message.fill", description: "Coachella planning", timeAgo: "4 days ago"),
        ]),
        MockContact(name: "Sarah Johnson", relationship: "Best Friend", lastInteraction: "Today", daysAgo: 0, isFavorite: true, tags: ["Friend", "Family"], sharedEvents: ["Book Club", "Family Group"], connectionStrength: 0.95, recentInteractions: [
            MockInteraction(icon: "heart.fill", description: "Sent birthday wishes", timeAgo: "3h ago"),
            MockInteraction(icon: "book.fill", description: "Book discussion", timeAgo: "2 days ago"),
            MockInteraction(icon: "fork.knife", description: "Dinner together", timeAgo: "5 days ago"),
        ]),
        MockContact(name: "Marcus Williams", relationship: "Work", lastInteraction: "3 days ago", daysAgo: 3, isFavorite: false, tags: ["Work"], sharedEvents: ["Amber Team"], connectionStrength: 0.70, recentInteractions: [
            MockInteraction(icon: "laptopcomputer", description: "Code review", timeAgo: "3 days ago"),
            MockInteraction(icon: "message.fill", description: "Slack discussion", timeAgo: "5 days ago"),
        ]),
        MockContact(name: "Aisha Ibrahim", relationship: "Mentor", lastInteraction: "1 week ago", daysAgo: 7, isFavorite: false, tags: ["Work", "Mentor"], sharedEvents: [], connectionStrength: 0.65, recentInteractions: [
            MockInteraction(icon: "video.fill", description: "Monthly mentoring call", timeAgo: "1 week ago"),
        ]),
        MockContact(name: "Tyler O'Brien", relationship: "College Friend", lastInteraction: "23 days ago", daysAgo: 23, isFavorite: false, tags: ["Friend", "College"], sharedEvents: ["Fantasy Football"], connectionStrength: 0.40, recentInteractions: [
            MockInteraction(icon: "message.fill", description: "Fantasy trade discussion", timeAgo: "23 days ago"),
        ]),
        MockContact(name: "Riya Sharma", relationship: "Friend", lastInteraction: "5 days ago", daysAgo: 5, isFavorite: false, tags: ["Friend"], sharedEvents: ["Japan Trip March"], connectionStrength: 0.72, recentInteractions: [
            MockInteraction(icon: "airplane", description: "Japan itinerary planning", timeAgo: "5 days ago"),
            MockInteraction(icon: "message.fill", description: "Sent restaurant recs", timeAgo: "1 week ago"),
        ]),
        MockContact(name: "David Park", relationship: "Roommate", lastInteraction: "Today", daysAgo: 0, isFavorite: false, tags: ["Friend", "Roommate"], sharedEvents: ["Sunday Hoops"], connectionStrength: 0.82, recentInteractions: [
            MockInteraction(icon: "house.fill", description: "Home together", timeAgo: "Today"),
            MockInteraction(icon: "sportscourt.fill", description: "Basketball", timeAgo: "4 days ago"),
        ]),
        MockContact(name: "Emma Thompson", relationship: "Family", lastInteraction: "2 days ago", daysAgo: 2, isFavorite: false, tags: ["Family"], sharedEvents: ["Family Group"], connectionStrength: 0.78, recentInteractions: [
            MockInteraction(icon: "phone.fill", description: "Family call", timeAgo: "2 days ago"),
        ]),
        MockContact(name: "Carlos Rivera", relationship: "Work", lastInteraction: "4 days ago", daysAgo: 4, isFavorite: false, tags: ["Work", "Friend"], sharedEvents: ["Startup Ideas"], connectionStrength: 0.68, recentInteractions: [
            MockInteraction(icon: "lightbulb.fill", description: "Startup brainstorm", timeAgo: "4 days ago"),
        ]),
        MockContact(name: "Nina Volkov", relationship: "Friend", lastInteraction: "18 days ago", daysAgo: 18, isFavorite: false, tags: ["Friend", "College"], sharedEvents: [], connectionStrength: 0.35, recentInteractions: [
            MockInteraction(icon: "message.fill", description: "Birthday message", timeAgo: "18 days ago"),
        ]),
        MockContact(name: "Jordan Lee", relationship: "Friend", lastInteraction: "1 week ago", daysAgo: 7, isFavorite: false, tags: ["Friend"], sharedEvents: ["Coachella 2026"], connectionStrength: 0.60, recentInteractions: [
            MockInteraction(icon: "music.note", description: "Shared Coachella lineup", timeAgo: "1 week ago"),
        ]),
        MockContact(name: "Fatima Al-Hassan", relationship: "Work", lastInteraction: "6 days ago", daysAgo: 6, isFavorite: false, tags: ["Work"], sharedEvents: ["Amber Team"], connectionStrength: 0.62, recentInteractions: [
            MockInteraction(icon: "laptopcomputer", description: "Sprint planning", timeAgo: "6 days ago"),
        ]),
        MockContact(name: "Ben Cooper", relationship: "Friend", lastInteraction: "15 days ago", daysAgo: 15, isFavorite: false, tags: ["Friend"], sharedEvents: ["Fantasy Football"], connectionStrength: 0.42, recentInteractions: [
            MockInteraction(icon: "sportscourt.fill", description: "Fantasy league chat", timeAgo: "15 days ago"),
        ]),
        MockContact(name: "Yuki Tanaka", relationship: "Friend", lastInteraction: "3 days ago", daysAgo: 3, isFavorite: false, tags: ["Friend", "Travel"], sharedEvents: ["Japan Trip March"], connectionStrength: 0.75, recentInteractions: [
            MockInteraction(icon: "map.fill", description: "Shared Tokyo guide", timeAgo: "3 days ago"),
            MockInteraction(icon: "message.fill", description: "Ryokan recommendations", timeAgo: "5 days ago"),
        ]),
        MockContact(name: "Olivia Wright", relationship: "Friend", lastInteraction: "1 week ago", daysAgo: 7, isFavorite: false, tags: ["Friend"], sharedEvents: ["Book Club"], connectionStrength: 0.58, recentInteractions: [
            MockInteraction(icon: "book.fill", description: "Book recommendation", timeAgo: "1 week ago"),
        ]),
        MockContact(name: "Rahul Mehta", relationship: "Work", lastInteraction: "4 days ago", daysAgo: 4, isFavorite: false, tags: ["Work", "Friend"], sharedEvents: [], connectionStrength: 0.55, recentInteractions: [
            MockInteraction(icon: "cup.and.saucer.fill", description: "Lunch together", timeAgo: "4 days ago"),
        ]),
        MockContact(name: "Sam Okafor", relationship: "Friend", lastInteraction: "9 days ago", daysAgo: 9, isFavorite: false, tags: ["Friend", "Fitness"], sharedEvents: ["Sunday Hoops"], connectionStrength: 0.50, recentInteractions: [
            MockInteraction(icon: "sportscourt.fill", description: "Basketball game", timeAgo: "9 days ago"),
        ]),
    ]

    static var favorites: [MockContact] {
        contacts.filter { $0.isFavorite }
    }

    static var groupedContacts: [(String, [MockContact])] {
        let grouped = Dictionary(grouping: contacts) { $0.firstLetter }
        return grouped.sorted { $0.key < $1.key }
    }

    // MARK: - Chats
    static let chats: [MockChat] = [
        MockChat(name: "Japan Trip March", emoji: "🇯🇵", lastMessage: "Just booked the ryokan!", timestamp: "2m", unreadCount: 2, memberCount: 6, isGroup: true, messages: [
            MockMessage(text: "Has everyone booked their flights?", isOutgoing: false, senderName: "Alex", timestamp: "10:30 AM"),
            MockMessage(text: "Yep! Landing March 15th", isOutgoing: true, senderName: nil, timestamp: "10:32 AM"),
            MockMessage(text: "Same here! Can't wait 🎉", isOutgoing: false, senderName: "Riya", timestamp: "10:33 AM"),
            MockMessage(text: "I found an amazing ryokan in Hakone", isOutgoing: false, senderName: "Yuki", timestamp: "10:45 AM"),
            MockMessage(text: "Send the link!", isOutgoing: true, senderName: nil, timestamp: "10:46 AM"),
            MockMessage(text: "It has an onsen with a view of Mt. Fuji", isOutgoing: false, senderName: "Yuki", timestamp: "10:47 AM"),
            MockMessage(text: "Just booked the ryokan!", isOutgoing: false, senderName: "Maya", timestamp: "11:02 AM"),
            MockMessage(text: "This trip is going to be incredible", isOutgoing: true, senderName: nil, timestamp: "11:03 AM"),
        ]),
        MockChat(name: "Fantasy Football", emoji: "🏈", lastMessage: "Trade deadline tomorrow", timestamp: "15m", unreadCount: 5, memberCount: 12, isGroup: true, messages: [
            MockMessage(text: "Anyone want to trade for Mahomes?", isOutgoing: false, senderName: "Tyler", timestamp: "9:00 AM"),
            MockMessage(text: "What are you looking for?", isOutgoing: true, senderName: nil, timestamp: "9:05 AM"),
            MockMessage(text: "A solid RB1", isOutgoing: false, senderName: "Tyler", timestamp: "9:06 AM"),
            MockMessage(text: "Trade deadline tomorrow", isOutgoing: false, senderName: "Ben", timestamp: "9:30 AM"),
        ]),
        MockChat(name: "Sunday Hoops", emoji: "🏀", lastMessage: "Courts at 10am?", timestamp: "1h", unreadCount: 0, memberCount: 8, isGroup: true, messages: [
            MockMessage(text: "Game this Sunday?", isOutgoing: false, senderName: "James", timestamp: "8:00 AM"),
            MockMessage(text: "I'm in!", isOutgoing: true, senderName: nil, timestamp: "8:15 AM"),
            MockMessage(text: "Same 🏀", isOutgoing: false, senderName: "David", timestamp: "8:20 AM"),
            MockMessage(text: "Courts at 10am?", isOutgoing: false, senderName: "Sam", timestamp: "8:45 AM"),
        ]),
        MockChat(name: "Book Club", emoji: "📚", lastMessage: "Chapter 12 was insane", timestamp: "2h", unreadCount: 1, memberCount: 5, isGroup: true, messages: [
            MockMessage(text: "Did everyone finish chapter 12?", isOutgoing: false, senderName: "Olivia", timestamp: "7:00 PM"),
            MockMessage(text: "Just finished! That plot twist 🤯", isOutgoing: true, senderName: nil, timestamp: "7:15 PM"),
            MockMessage(text: "Chapter 12 was insane", isOutgoing: false, senderName: "Sarah", timestamp: "7:30 PM"),
        ]),
        MockChat(name: "Family Group", emoji: "👨‍👩‍👧‍👦", lastMessage: "Mom's birthday dinner Friday", timestamp: "3h", unreadCount: 3, memberCount: 7, isGroup: true, messages: [
            MockMessage(text: "Don't forget Mom's birthday this Friday!", isOutgoing: false, senderName: "Emma", timestamp: "12:00 PM"),
            MockMessage(text: "Already got her a gift 🎁", isOutgoing: true, senderName: nil, timestamp: "12:10 PM"),
            MockMessage(text: "Reservation at 7pm at her favorite restaurant", isOutgoing: false, senderName: "Emma", timestamp: "12:15 PM"),
            MockMessage(text: "Mom's birthday dinner Friday", isOutgoing: false, senderName: "Dad", timestamp: "12:30 PM"),
        ]),
        MockChat(name: "Startup Ideas", emoji: "💡", lastMessage: "Let's prototype this weekend", timestamp: "5h", unreadCount: 0, memberCount: 3, isGroup: true, messages: [
            MockMessage(text: "I had an idea for a social health app", isOutgoing: false, senderName: "Priya", timestamp: "2:00 PM"),
            MockMessage(text: "Tell me more!", isOutgoing: true, senderName: nil, timestamp: "2:05 PM"),
            MockMessage(text: "Think about tracking relationship health", isOutgoing: false, senderName: "Carlos", timestamp: "2:10 PM"),
            MockMessage(text: "Let's prototype this weekend", isOutgoing: false, senderName: "Priya", timestamp: "2:30 PM"),
        ]),
        MockChat(name: "Maya Chen", emoji: nil, lastMessage: "See you at coffee tomorrow!", timestamp: "6h", unreadCount: 1, memberCount: nil, isGroup: false, messages: [
            MockMessage(text: "Hey! Are you free for coffee tomorrow?", isOutgoing: false, senderName: nil, timestamp: "3:00 PM"),
            MockMessage(text: "Yes! The usual spot?", isOutgoing: true, senderName: nil, timestamp: "3:15 PM"),
            MockMessage(text: "Perfect, 10am?", isOutgoing: false, senderName: nil, timestamp: "3:16 PM"),
            MockMessage(text: "Works for me ☕", isOutgoing: true, senderName: nil, timestamp: "3:17 PM"),
            MockMessage(text: "See you at coffee tomorrow!", isOutgoing: false, senderName: nil, timestamp: "3:18 PM"),
        ]),
        MockChat(name: "James Rodriguez", emoji: nil, lastMessage: "Great workout today 💪", timestamp: "8h", unreadCount: 0, memberCount: nil, isGroup: false, messages: [
            MockMessage(text: "Gym at 6am tomorrow?", isOutgoing: true, senderName: nil, timestamp: "6:00 AM"),
            MockMessage(text: "Let's do it! Leg day?", isOutgoing: false, senderName: nil, timestamp: "6:05 AM"),
            MockMessage(text: "You know it 🦵", isOutgoing: true, senderName: nil, timestamp: "6:06 AM"),
            MockMessage(text: "Great workout today 💪", isOutgoing: false, senderName: nil, timestamp: "9:00 AM"),
        ]),
        MockChat(name: "Coachella 2026", emoji: "🎵", lastMessage: "Who's driving?", timestamp: "1d", unreadCount: 0, memberCount: 4, isGroup: true, messages: [
            MockMessage(text: "Lineup just dropped!", isOutgoing: false, senderName: "Jordan", timestamp: "Yesterday"),
            MockMessage(text: "So hyped for this 🔥", isOutgoing: true, senderName: nil, timestamp: "Yesterday"),
            MockMessage(text: "Should we rent a house or camp?", isOutgoing: false, senderName: "Alex", timestamp: "Yesterday"),
            MockMessage(text: "Who's driving?", isOutgoing: false, senderName: "Jordan", timestamp: "Yesterday"),
        ]),
        MockChat(name: "Amber Team", emoji: "🟠", lastMessage: "Ship it.", timestamp: "1d", unreadCount: 0, memberCount: 5, isGroup: true, messages: [
            MockMessage(text: "PR is ready for review", isOutgoing: false, senderName: "Marcus", timestamp: "Yesterday"),
            MockMessage(text: "Looks good, approved ✅", isOutgoing: true, senderName: nil, timestamp: "Yesterday"),
            MockMessage(text: "CI passed", isOutgoing: false, senderName: "Fatima", timestamp: "Yesterday"),
            MockMessage(text: "Ship it.", isOutgoing: false, senderName: "Priya", timestamp: "Yesterday"),
        ]),
    ]

    // MARK: - Widgets
    static let widgets: [MockWidget] = [
        MockWidget(emoji: "🎂", title: "Maya Chen's birthday is in 3 days", subtitle: "Send her a thoughtful message", actionLabel: "Send wishes", gradientColors: [.pink, .orange], type: .birthday),
        MockWidget(emoji: "🏃", title: "James just completed a half marathon", subtitle: "1:42:30 — a new personal best!", actionLabel: "Congratulate", gradientColors: [.green, .mint], type: .achievement),
        MockWidget(emoji: "📊", title: "Your emotional health improved 12% this week", subtitle: "Strong connections with Sarah and Maya are making a difference", actionLabel: nil, gradientColors: [.healthEmotional, .orange], type: .health),
        MockWidget(emoji: "🤝", title: "You and Priya have 4 mutual connections", subtitle: "Strengthen your network overlap", actionLabel: "View connections", gradientColors: [.amberBlue, .purple], type: .suggestion),
        MockWidget(emoji: "📅", title: "Japan Trip is in 14 days", subtitle: "6 friends going • 3 activities planned", actionLabel: "View trip", gradientColors: [.amberBlue, .cyan], type: .countdown),
        MockWidget(emoji: "🧠", title: "New personality insight available", subtitle: "Based on your recent interactions", actionLabel: "Discover", gradientColors: [.purple, .indigo], type: .insight),
        MockWidget(emoji: "💪", title: "3 of your contacts worked out today", subtitle: "James, David, and Sam hit the gym", actionLabel: nil, gradientColors: [.orange, .red], type: .social),
        MockWidget(emoji: "📖", title: "Book Club meeting tomorrow at 7pm", subtitle: "Chapters 13-15 discussion", actionLabel: "Set reminder", gradientColors: [.amberGold, .brown], type: .reminder),
    ]

    // MARK: - AI Suggestions
    static let aiSuggestions = [
        "Who should I reconnect with?",
        "Summarize my week",
        "Find workout buddies",
        "Birthday reminders",
    ]

    static let aiMockQuery = "Who haven't I talked to in a while?"
    static let aiMockResponse = """
    Here are 3 contacts you haven't interacted with recently:

    1. **Tyler O'Brien** — last interaction 23 days ago
    2. **Nina Volkov** — last interaction 18 days ago
    3. **Ben Cooper** — last interaction 15 days ago

    Would you like me to draft a message to any of them?
    """
}
