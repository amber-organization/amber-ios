//
//  ContactsView.swift
//  Amber
//
//  Premium contacts list with group sections, Instagram Stories reconnection strip,
//  connection cadence badges, and 2-tier search (local + Exa.ai discovery).
//

import SwiftUI

// MARK: - Data Models

enum ConnectionCadence: String, CaseIterable {
    case weekly = "Weekly"
    case monthly = "Monthly"
    case quarterly = "Quarterly"
    case none = "No reminder"

    var shortLabel: String {
        switch self {
        case .weekly: return "1w"
        case .monthly: return "1mo"
        case .quarterly: return "3mo"
        case .none: return ""
        }
    }

    var days: Int {
        switch self {
        case .weekly: return 7
        case .monthly: return 30
        case .quarterly: return 90
        case .none: return Int.max
        }
    }
}

struct AmberContact: Identifiable, Hashable {
    let id = UUID()
    let name: String
    let subtitle: String
    let isOnAmber: Bool
    let avatarColor: Color
    let groups: [String]
    let cadence: ConnectionCadence
    let daysSinceContact: Int

    var firstLetter: String {
        String(name.prefix(1)).uppercased()
    }

    var initials: String {
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return String(parts[0].prefix(1) + parts[1].prefix(1)).uppercased()
        }
        return String(name.prefix(1)).uppercased()
    }

    var firstName: String {
        String(name.split(separator: " ").first ?? Substring(name))
    }

    var isOverdue: Bool {
        cadence != .none && daysSinceContact > cadence.days
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }

    static func == (lhs: AmberContact, rhs: AmberContact) -> Bool {
        lhs.id == rhs.id
    }
}

struct ContactGroup: Identifiable {
    let id = UUID()
    let name: String
    let icon: String
    let members: [String] // contact names
}

// MARK: - Social Activity Models

enum SocialPlatform: String {
    case linkedin = "LinkedIn"
    case instagram = "Instagram"
    case twitter = "Twitter"

    var icon: String {
        switch self {
        case .linkedin: return "link.circle.fill"
        case .instagram: return "camera.circle.fill"
        case .twitter: return "at.circle.fill"
        }
    }

    var color: Color {
        switch self {
        case .linkedin: return .healthSocial
        case .instagram: return .healthEmotional
        case .twitter: return .amberText
        }
    }
}

struct SocialActivity: Identifiable {
    let id = UUID()
    let contactName: String
    let platform: SocialPlatform?
    let content: String
    let timeAgo: String
    let lastConnectedDaysAgo: Int
    let isBirthday: Bool
    let isViewed: Bool

    var firstName: String {
        String(contactName.split(separator: " ").first ?? Substring(contactName))
    }

    var initials: String {
        let parts = contactName.split(separator: " ")
        if parts.count >= 2 {
            return String(parts[0].prefix(1) + parts[1].prefix(1)).uppercased()
        }
        return String(contactName.prefix(1)).uppercased()
    }
}

// MARK: - ContactsView

struct ContactsView: View {
    @State private var searchText: String = ""
    @State private var showAddContact: Bool = false
    @State private var expandedGroups: Set<String> = []
    @State private var selectedGroupFilters: Set<String> = ["All"]
    @State private var selectedActivity: SocialActivity?
    @StateObject private var exaSearch = ExaSearchService()

    private let springAnimation: Animation = .spring(response: 0.35, dampingFraction: 0.75)

    // MARK: - Sample Data

    private let socialActivities: [SocialActivity] = [
        SocialActivity(
            contactName: "Angela Chen",
            platform: .linkedin,
            content: "Excited about our Amber launch!",
            timeAgo: "2h ago",
            lastConnectedDaysAgo: 3,
            isBirthday: false,
            isViewed: false
        ),
        SocialActivity(
            contactName: "Dev Kapoor",
            platform: .instagram,
            content: "Photo at coffee shop",
            timeAgo: "5h ago",
            lastConnectedDaysAgo: 14,
            isBirthday: false,
            isViewed: false
        ),
        SocialActivity(
            contactName: "Arjun Patel",
            platform: nil,
            content: "Birthday tomorrow!",
            timeAgo: "tomorrow",
            lastConnectedDaysAgo: 8,
            isBirthday: true,
            isViewed: false
        ),
        SocialActivity(
            contactName: "Victor Huang",
            platform: .twitter,
            content: "just shipped v2",
            timeAgo: "1d ago",
            lastConnectedDaysAgo: 21,
            isBirthday: false,
            isViewed: true
        ),
        SocialActivity(
            contactName: "Priya Sharma",
            platform: .linkedin,
            content: "new role at Stripe",
            timeAgo: "3d ago",
            lastConnectedDaysAgo: 25,
            isBirthday: false,
            isViewed: true
        ),
    ]

    private let contactGroups: [ContactGroup] = [
        ContactGroup(name: "USC", icon: "building.columns.fill", members: ["Angela Chen", "Arjun Patel", "Michelle Wong"]),
        ContactGroup(name: "Amber Team", icon: "hexagon.fill", members: ["Angela Chen", "Dev Kapoor", "Kaitlyn Rivera", "Victor Huang"]),
        ContactGroup(name: "BMA", icon: "briefcase.fill", members: ["Rohan Mehta"]),
        ContactGroup(name: "Family", icon: "heart.fill", members: ["Chetna Tiwari", "Sindhu Tiwari", "Umesh Tiwari"]),
        ContactGroup(name: "Other", icon: "person.fill", members: ["Priya Sharma"]),
    ]

    private let sampleContacts: [AmberContact] = [
        AmberContact(name: "Angela Chen", subtitle: "Design Lead, Amber", isOnAmber: true, avatarColor: .healthEmotional, groups: ["USC", "Amber Team"], cadence: .weekly, daysSinceContact: 3),
        AmberContact(name: "Arjun Patel", subtitle: "USC '29", isOnAmber: false, avatarColor: .amberGold, groups: ["USC"], cadence: .monthly, daysSinceContact: 8),
        AmberContact(name: "Chetna Tiwari", subtitle: "Mom", isOnAmber: false, avatarColor: .healthSpiritual, groups: ["Family"], cadence: .weekly, daysSinceContact: 2),
        AmberContact(name: "Dev Kapoor", subtitle: "MAYA Biotech", isOnAmber: true, avatarColor: .healthPhysical, groups: ["Amber Team"], cadence: .monthly, daysSinceContact: 14),
        AmberContact(name: "Kaitlyn Rivera", subtitle: "Product, Amber", isOnAmber: true, avatarColor: .healthSocial, groups: ["Amber Team"], cadence: .weekly, daysSinceContact: 5),
        AmberContact(name: "Michelle Wong", subtitle: "USC Volleyball", isOnAmber: false, avatarColor: .healthEmotional, groups: ["USC"], cadence: .quarterly, daysSinceContact: 10),
        AmberContact(name: "Priya Sharma", subtitle: "Engineer", isOnAmber: true, avatarColor: .healthFinancial, groups: ["Other"], cadence: .monthly, daysSinceContact: 25),
        AmberContact(name: "Rohan Mehta", subtitle: "BMA Team", isOnAmber: false, avatarColor: .amberWarm, groups: ["BMA"], cadence: .monthly, daysSinceContact: 18),
        AmberContact(name: "Sindhu Tiwari", subtitle: "Sister", isOnAmber: false, avatarColor: .healthSpiritual, groups: ["Family"], cadence: .weekly, daysSinceContact: 4),
        AmberContact(name: "Umesh Tiwari", subtitle: "Dad", isOnAmber: false, avatarColor: .amberPrimary, groups: ["Family"], cadence: .weekly, daysSinceContact: 2),
        AmberContact(name: "Victor Huang", subtitle: "Product Strategy", isOnAmber: true, avatarColor: .healthIntellectual, groups: ["Amber Team"], cadence: .quarterly, daysSinceContact: 21),
    ]

    private var allGroupNames: [String] {
        contactGroups.map { $0.name }
    }

    private var filteredContacts: [AmberContact] {
        var contacts = sampleContacts

        // Apply search filter
        if !searchText.isEmpty {
            contacts = contacts.filter {
                $0.name.localizedCaseInsensitiveContains(searchText) ||
                $0.subtitle.localizedCaseInsensitiveContains(searchText)
            }
        }

        // Apply group filter
        if !selectedGroupFilters.contains("All") {
            contacts = contacts.filter { contact in
                !Set(contact.groups).isDisjoint(with: selectedGroupFilters)
            }
        }

        return contacts
    }

    private var filteredGroups: [ContactGroup] {
        contactGroups.compactMap { group in
            let members = group.members.filter { memberName in
                filteredContacts.contains { $0.name == memberName }
            }
            guard !members.isEmpty else { return nil }
            return ContactGroup(name: group.name, icon: group.icon, members: members)
        }
    }

    // MARK: - Init

    init() {
        // All sections expanded by default
        _expandedGroups = State(initialValue: Set(["USC", "Amber Team", "BMA", "Family", "Other"]))
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ZStack {
                Color.amberBackground
                    .ignoresSafeArea()

                ScrollView {
                    LazyVStack(spacing: 0) {
                        // Instagram Stories reconnection strip
                        if searchText.isEmpty {
                            reconnectionStrip
                                .padding(.top, 8)
                                .padding(.bottom, 16)
                                .transition(.opacity.combined(with: .move(edge: .top)))
                        }

                        // Search bar
                        searchBar
                            .padding(.horizontal, 16)
                            .padding(.bottom, 10)

                        // Group filter chips
                        chipFilterBar
                            .padding(.bottom, 16)

                        // Tier 1: Local contacts grouped by section
                        if !filteredContacts.isEmpty {
                            if !searchText.isEmpty {
                                HStack(spacing: 6) {
                                    Image(systemName: "person.crop.circle")
                                        .foregroundStyle(Color.amberSecondaryText)
                                    Text("YOUR CONTACTS")
                                }
                                .amberSectionHeader()
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(.horizontal, 20)
                                .padding(.bottom, 8)
                            }

                            groupedContactsList
                        }

                        // Tier 2: Exa people discovery
                        if !searchText.isEmpty {
                            exaResultsSection
                                .padding(.top, 16)
                        }
                    }
                    .padding(.bottom, 120)
                }
            }
            .navigationTitle("People")
            .navigationBarTitleDisplayMode(.large)
            .toolbarBackground(Color.amberBackground, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    HStack(spacing: 16) {
                        Button {
                            showAddContact = true
                        } label: {
                            Image(systemName: "plus")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundStyle(Color.amberWarm)
                        }

                        ProfileAvatarButton()
                    }
                }
            }
            .sheet(isPresented: $showAddContact) {
                AddContactView()
            }
            .sheet(item: $selectedActivity) { activity in
                ActivityDetailSheet(activity: activity)
            }
        }
        .preferredColorScheme(.dark)
        .animation(springAnimation, value: searchText)
        .animation(springAnimation, value: selectedGroupFilters)
        .onChange(of: searchText) { _, newValue in
            exaSearch.search(query: newValue)
        }
    }

    // MARK: - Instagram Stories Reconnection Strip

    private var reconnectionStrip: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 16) {
                ForEach(socialActivities) { activity in
                    Button {
                        selectedActivity = activity
                    } label: {
                        storyBubble(activity: activity)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 20)
        }
    }

    private func storyBubble(activity: SocialActivity) -> some View {
        VStack(spacing: 6) {
            ZStack {
                // Ring
                if activity.isBirthday {
                    // Gold sparkle ring for birthday
                    Circle()
                        .stroke(
                            LinearGradient(
                                colors: [.amberGold, .amberHoney, .amberGold],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 2.5
                        )
                        .frame(width: 60, height: 60)

                    // Sparkle overlay
                    Image(systemName: "sparkle")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(Color.amberGold)
                        .offset(x: 22, y: -22)
                } else if !activity.isViewed {
                    // Gradient ring for unviewed activity
                    Circle()
                        .stroke(
                            LinearGradient(
                                colors: [.amberWarm, .amberGold],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 2.5
                        )
                        .frame(width: 60, height: 60)
                } else {
                    // Gray ring for viewed
                    Circle()
                        .stroke(Color.amberTertiaryText, lineWidth: 2)
                        .frame(width: 60, height: 60)
                }

                // Avatar circle
                Circle()
                    .fill(contactColor(for: activity.contactName).opacity(0.15))
                    .frame(width: 52, height: 52)

                Text(activity.initials)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(contactColor(for: activity.contactName))
            }
            .frame(width: 62, height: 62)

            Text(activity.firstName)
                .font(.amberCaption2)
                .foregroundStyle(Color.amberText)
                .lineLimit(1)
        }
        .frame(width: 68)
    }

    private func contactColor(for name: String) -> Color {
        sampleContacts.first { $0.name == name }?.avatarColor ?? .amberWarm
    }

    // MARK: - Search Bar

    private var searchBar: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(Color.amberSecondaryText)

            TextField("Search people...", text: $searchText)
                .font(.amberCallout)
                .foregroundStyle(Color.amberText)
                .tint(Color.amberWarm)

            if !searchText.isEmpty {
                Button {
                    withAnimation(springAnimation) {
                        searchText = ""
                    }
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 15))
                        .foregroundStyle(Color.amberSecondaryText)
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(Color.amberCard, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .strokeBorder(Color.white.opacity(0.06), lineWidth: 0.5)
        )
    }

    // MARK: - Chip Filter Bar

    private var chipFilterBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                // "All" chip
                chipButton(label: "All", isSelected: selectedGroupFilters.contains("All")) {
                    withAnimation(springAnimation) {
                        selectedGroupFilters = ["All"]
                    }
                }

                // Group chips
                ForEach(contactGroups) { group in
                    chipButton(label: group.name, isSelected: selectedGroupFilters.contains(group.name)) {
                        withAnimation(springAnimation) {
                            if selectedGroupFilters.contains(group.name) {
                                selectedGroupFilters.remove(group.name)
                                if selectedGroupFilters.isEmpty {
                                    selectedGroupFilters = ["All"]
                                }
                            } else {
                                selectedGroupFilters.remove("All")
                                selectedGroupFilters.insert(group.name)
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, 16)
        }
    }

    private func chipButton(label: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(isSelected ? Color.amberWarm : Color.amberSecondaryText)
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background(
                    isSelected ? Color.amberWarm.opacity(0.15) : Color.amberCard,
                    in: Capsule()
                )
                .overlay(
                    Capsule()
                        .strokeBorder(isSelected ? Color.amberWarm.opacity(0.3) : Color.white.opacity(0.06), lineWidth: 0.5)
                )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Grouped Contacts List

    private var groupedContactsList: some View {
        VStack(spacing: 4) {
            ForEach(filteredGroups) { group in
                VStack(spacing: 0) {
                    // Group header
                    groupSectionHeader(group: group)

                    // Members (collapsible)
                    if expandedGroups.contains(group.name) {
                        VStack(spacing: 0) {
                            ForEach(contactsInGroup(group)) { contact in
                                NavigationLink(value: contact) {
                                    ContactRowWithCadence(contact: contact)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .transition(.opacity.combined(with: .move(edge: .top)))
                    }
                }
                .padding(.vertical, 4)
            }
            .navigationDestination(for: AmberContact.self) { contact in
                ContactDetailCard(contact: contact)
            }
        }
    }

    private func groupSectionHeader(group: ContactGroup) -> some View {
        Button {
            withAnimation(springAnimation) {
                if expandedGroups.contains(group.name) {
                    expandedGroups.remove(group.name)
                } else {
                    expandedGroups.insert(group.name)
                }
            }
        } label: {
            HStack(spacing: 10) {
                Image(systemName: group.icon)
                    .font(.system(size: 14))
                    .foregroundStyle(Color.amberWarm)
                    .frame(width: 20)

                Text(group.name)
                    .font(.amberHeadline)
                    .foregroundStyle(Color.amberText)

                // Member count badge
                Text("\(group.members.count)")
                    .font(.system(size: 11, weight: .semibold, design: .rounded))
                    .foregroundStyle(Color.amberSecondaryText)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 2)
                    .background(Color.amberCardElevated, in: Capsule())

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(Color.amberTertiaryText)
                    .rotationEffect(.degrees(expandedGroups.contains(group.name) ? 90 : 0))
                    .animation(springAnimation, value: expandedGroups.contains(group.name))
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    private func contactsInGroup(_ group: ContactGroup) -> [AmberContact] {
        group.members.compactMap { memberName in
            filteredContacts.first { $0.name == memberName }
        }
    }

    // MARK: - Exa Discovery Results

    private var exaResultsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 6) {
                Image(systemName: "globe")
                    .foregroundStyle(Color.amberWarm)
                Text("DISCOVER PEOPLE")
                if exaSearch.isSearching {
                    ProgressView()
                        .scaleEffect(0.6)
                        .tint(.amberWarm)
                }
            }
            .amberSectionHeader()
            .padding(.horizontal, 20)

            if let error = exaSearch.error {
                Text(error)
                    .font(.amberCaption)
                    .foregroundStyle(Color.amberTertiaryText)
                    .padding(.horizontal, 20)
            } else if exaSearch.results.isEmpty && !exaSearch.isSearching {
                Text("Type to discover people beyond your contacts")
                    .font(.amberCaption)
                    .foregroundStyle(Color.amberTertiaryText)
                    .padding(.horizontal, 20)
            } else {
                ForEach(exaSearch.results) { person in
                    ExaPersonRow(person: person)
                }
            }
        }
    }
}

// MARK: - Contact Row with Cadence Badge

private struct ContactRowWithCadence: View {
    let contact: AmberContact

    var body: some View {
        HStack(spacing: 14) {
            // Avatar
            ZStack {
                Circle()
                    .fill(contact.avatarColor.opacity(0.15))
                    .frame(width: 40, height: 40)

                Text(contact.initials)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(contact.avatarColor)
            }

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(contact.name)
                        .font(.amberBody)
                        .foregroundStyle(Color.amberText)

                    if contact.isOnAmber {
                        Circle()
                            .fill(Color.amberWarm)
                            .frame(width: 6, height: 6)
                    }
                }

                Text(contact.subtitle)
                    .font(.amberCaption)
                    .foregroundStyle(Color.amberSecondaryText)
            }

            Spacer()

            // Cadence badge
            if contact.cadence != .none {
                HStack(spacing: 3) {
                    Image(systemName: "clock")
                        .font(.system(size: 10))
                    Text(contact.cadence.shortLabel)
                        .font(.system(size: 11, weight: .medium))
                }
                .foregroundStyle(contact.isOverdue ? Color.amberWarm : Color.amberTertiaryText)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 10)
        .contentShape(Rectangle())
    }
}

// MARK: - Activity Detail Sheet

private struct ActivityDetailSheet: View {
    let activity: SocialActivity
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            Color.amberBackground
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 24) {
                    // Drag indicator
                    Capsule()
                        .fill(Color.amberTertiaryText)
                        .frame(width: 36, height: 5)
                        .padding(.top, 12)

                    // Large avatar
                    ZStack {
                        Circle()
                            .stroke(
                                LinearGradient(
                                    colors: activity.isBirthday
                                        ? [.amberGold, .amberHoney, .amberGold]
                                        : [.amberWarm, .amberGold],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                lineWidth: 3
                            )
                            .frame(width: 86, height: 86)

                        Circle()
                            .fill(avatarColor.opacity(0.15))
                            .frame(width: 80, height: 80)

                        Text(activity.initials)
                            .font(.system(size: 28, weight: .bold))
                            .foregroundStyle(avatarColor)
                    }

                    Text(activity.contactName)
                        .font(.amberTitle2)
                        .foregroundStyle(Color.amberText)

                    // Recent Activity card
                    VStack(alignment: .leading, spacing: 12) {
                        Text("RECENT ACTIVITY")
                            .amberSectionHeader()

                        HStack(spacing: 12) {
                            if activity.isBirthday {
                                Image(systemName: "birthday.cake.fill")
                                    .font(.system(size: 20))
                                    .foregroundStyle(Color.amberGold)
                            } else if let platform = activity.platform {
                                Image(systemName: platform.icon)
                                    .font(.system(size: 20))
                                    .foregroundStyle(platform.color)
                            }

                            VStack(alignment: .leading, spacing: 4) {
                                if activity.isBirthday {
                                    Text("Birthday tomorrow!")
                                        .font(.amberBody)
                                        .foregroundStyle(Color.amberGold)
                                } else {
                                    if let platform = activity.platform {
                                        Text("Posted on \(platform.rawValue)")
                                            .font(.amberCaption)
                                            .foregroundStyle(Color.amberSecondaryText)
                                    }
                                    Text(activity.content)
                                        .font(.amberBody)
                                        .foregroundStyle(Color.amberText)
                                }

                                Text(activity.timeAgo)
                                    .font(.amberCaption2)
                                    .foregroundStyle(Color.amberTertiaryText)
                            }

                            Spacer()
                        }
                        .padding(16)
                        .amberCardStyle()
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 20)

                    // Last connected
                    Text("Last connected: \(activity.lastConnectedDaysAgo) days ago")
                        .font(.amberFootnote)
                        .foregroundStyle(Color.amberSecondaryText)

                    // Quick action buttons
                    HStack(spacing: 16) {
                        actionButton(icon: "message.fill", label: "Message", color: .amberWarm)
                        actionButton(icon: "hand.thumbsup.fill", label: "React", color: .amberGold)
                        actionButton(icon: "cup.and.saucer.fill", label: "Schedule Coffee", color: .healthSocial)
                    }
                    .padding(.horizontal, 20)
                }
                .padding(.bottom, 40)
            }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.hidden)
        .preferredColorScheme(.dark)
    }

    private var avatarColor: Color {
        let contacts: [String: Color] = [
            "Angela Chen": .healthEmotional,
            "Arjun Patel": .amberGold,
            "Dev Kapoor": .healthPhysical,
            "Victor Huang": .healthIntellectual,
            "Priya Sharma": .healthFinancial,
        ]
        return contacts[activity.contactName] ?? .amberWarm
    }

    private func actionButton(icon: String, label: String, color: Color) -> some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.12))
                    .frame(width: 52, height: 52)

                Image(systemName: icon)
                    .font(.system(size: 19))
                    .foregroundStyle(color)
            }

            Text(label)
                .font(.amberCaption2)
                .foregroundStyle(Color.amberSecondaryText)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Contact Detail Card

struct ContactDetailCard: View {
    let contact: AmberContact
    @State private var notes: String = ""
    @Environment(\.dismiss) private var dismiss

    private var howYouMet: String {
        switch contact.name {
        case "Angela Chen": return "Joined Amber as Design Lead in November"
        case "Arjun Patel": return "Met at USC freshman orientation"
        case "Chetna Tiwari": return "Family"
        case "Dev Kapoor": return "Met through MAYA Biotech in January"
        case "Kaitlyn Rivera": return "Amber product team, started in December"
        case "Michelle Wong": return "USC Volleyball, met at a game in September"
        case "Priya Sharma": return "Connected through a hackathon last spring"
        case "Rohan Mehta": return "BMA Team member since launch"
        case "Sindhu Tiwari": return "Family"
        case "Umesh Tiwari": return "Family"
        case "Victor Huang": return "Introduced by a mutual friend at a product meetup"
        default: return "Met recently"
        }
    }

    private var daysKnown: Int {
        switch contact.name {
        case "Angela Chen": return 142
        case "Arjun Patel": return 210
        case "Chetna Tiwari": return 9125
        case "Dev Kapoor": return 87
        case "Kaitlyn Rivera": return 118
        case "Michelle Wong": return 195
        case "Priya Sharma": return 310
        case "Rohan Mehta": return 260
        case "Sindhu Tiwari": return 7300
        case "Umesh Tiwari": return 9125
        case "Victor Huang": return 64
        default: return 30
        }
    }

    private var sharedCircles: [String] {
        switch contact.name {
        case "Angela Chen": return ["Amber Team"]
        case "Arjun Patel": return ["USC '29", "TIZZY GHINDIS"]
        case "Chetna Tiwari": return ["Tiwari Family", "bonnie fan club"]
        case "Dev Kapoor": return ["MAYA Biotech", "Ambitious bros"]
        case "Kaitlyn Rivera": return ["Amber Team"]
        case "Michelle Wong": return ["USC Volleyball", "SSBD -> LIB and beyond"]
        case "Priya Sharma": return ["Ambitious bros"]
        case "Rohan Mehta": return ["BMA Team"]
        case "Sindhu Tiwari": return ["Tiwari Family", "bonnie fan club"]
        case "Umesh Tiwari": return ["Tiwari Family", "bonnie fan club"]
        case "Victor Huang": return ["Product Leaders"]
        default: return []
        }
    }

    var body: some View {
        ZStack {
            Color.amberBackground
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 28) {
                    headerSection
                    infoCard(title: "HOW YOU MET", content: howYouMet)
                    daysKnownBadge
                    quickActionsRow

                    if !sharedCircles.isEmpty {
                        sharedCirclesSection
                    }

                    notesSection
                }
                .padding(.horizontal, 20)
                .padding(.top, 24)
                .padding(.bottom, 120)
            }
        }
        .navigationTitle("Contact")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Color.amberBackground, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .preferredColorScheme(.dark)
    }

    private var headerSection: some View {
        VStack(spacing: 14) {
            ZStack {
                Circle()
                    .stroke(
                        LinearGradient(
                            colors: [contact.avatarColor, contact.avatarColor.opacity(0.4)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 3
                    )
                    .frame(width: 86, height: 86)

                Circle()
                    .fill(contact.avatarColor.opacity(0.15))
                    .frame(width: 80, height: 80)

                Text(contact.initials)
                    .font(.system(size: 28, weight: .bold))
                    .foregroundStyle(contact.avatarColor)
            }

            VStack(spacing: 4) {
                Text(contact.name)
                    .font(.amberTitle2)
                    .foregroundStyle(Color.amberText)

                Text(contact.subtitle)
                    .font(.amberSubheadline)
                    .foregroundStyle(Color.amberSecondaryText)
            }

            if contact.isOnAmber {
                HStack(spacing: 4) {
                    Circle()
                        .fill(Color.amberWarm)
                        .frame(width: 6, height: 6)
                    Text("on Amber")
                        .font(.amberCaption2)
                        .foregroundStyle(Color.amberWarm)
                }
            }
        }
        .frame(maxWidth: .infinity)
    }

    private func infoCard(title: String, content: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .amberSectionHeader()

            Text(content)
                .font(.amberBody)
                .foregroundStyle(Color.amberText)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .amberCardStyle()
    }

    private var daysKnownBadge: some View {
        HStack(spacing: 8) {
            Image(systemName: "clock.fill")
                .font(.system(size: 13))
                .foregroundStyle(Color.amberGold)

            Text("Known for \(daysKnown) days")
                .font(.amberFootnote)
                .foregroundStyle(Color.amberSecondaryText)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color.amberGold.opacity(0.08), in: Capsule())
        .overlay(
            Capsule()
                .strokeBorder(Color.amberGold.opacity(0.15), lineWidth: 0.5)
        )
    }

    private var quickActionsRow: some View {
        HStack(spacing: 24) {
            quickActionButton(icon: "message.fill", label: "Message", color: .amberWarm)
            quickActionButton(icon: "phone.fill", label: "Call", color: .healthPhysical)
            quickActionButton(icon: "envelope.fill", label: "Email", color: .healthSocial)
        }
        .frame(maxWidth: .infinity)
    }

    private func quickActionButton(icon: String, label: String, color: Color) -> some View {
        VStack(spacing: 6) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.12))
                    .frame(width: 48, height: 48)

                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundStyle(color)
            }

            Text(label)
                .font(.amberCaption2)
                .foregroundStyle(Color.amberSecondaryText)
        }
    }

    private var sharedCirclesSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("SHARED CIRCLES")
                .amberSectionHeader()

            VStack(spacing: 0) {
                ForEach(sharedCircles, id: \.self) { circle in
                    HStack(spacing: 12) {
                        Image(systemName: "person.2.fill")
                            .font(.system(size: 13))
                            .foregroundStyle(Color.amberWarm)
                            .frame(width: 20)

                        Text(circle)
                            .font(.amberCallout)
                            .foregroundStyle(Color.amberText)

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundStyle(Color.amberTertiaryText)
                    }
                    .padding(.vertical, 12)
                    .padding(.horizontal, 16)

                    if circle != sharedCircles.last {
                        Divider()
                            .background(Color.white.opacity(0.04))
                            .padding(.leading, 48)
                    }
                }
            }
            .amberCardStyle()
        }
    }

    private var notesSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("NOTES")
                .amberSectionHeader()

            ZStack(alignment: .topLeading) {
                if notes.isEmpty {
                    Text("Add a personal note...")
                        .font(.amberCallout)
                        .foregroundStyle(Color.amberTertiaryText)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)
                }

                TextEditor(text: $notes)
                    .font(.amberCallout)
                    .foregroundStyle(Color.amberText)
                    .scrollContentBackground(.hidden)
                    .frame(minHeight: 80)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
            }
            .amberCardStyle()
        }
    }
}

// MARK: - Exa Person Row

private struct ExaPersonRow: View {
    let person: ExaPerson

    private var sourceIcon: String {
        switch person.source {
        case "linkedin": return "link.circle.fill"
        case "twitter": return "at.circle.fill"
        default: return "globe"
        }
    }

    private var sourceColor: Color {
        switch person.source {
        case "linkedin": return .healthSocial
        case "twitter": return .amberText
        default: return .amberSecondaryText
        }
    }

    var body: some View {
        HStack(spacing: 14) {
            ZStack(alignment: .bottomTrailing) {
                Circle()
                    .fill(Color.amberWarm.opacity(0.1))
                    .frame(width: 40, height: 40)

                Text(String(person.name.prefix(1)).uppercased())
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Color.amberWarm)
                    .frame(width: 40, height: 40)

                Image(systemName: sourceIcon)
                    .font(.system(size: 12))
                    .foregroundStyle(sourceColor)
                    .background(Color.amberBackground, in: Circle())
                    .offset(x: 3, y: 3)
            }

            VStack(alignment: .leading, spacing: 3) {
                Text(person.name)
                    .font(.amberBody)
                    .foregroundStyle(Color.amberText)
                    .lineLimit(1)

                if !person.title.isEmpty {
                    Text(person.title)
                        .font(.amberCaption)
                        .foregroundStyle(Color.amberSecondaryText)
                        .lineLimit(1)
                } else if !person.snippet.isEmpty {
                    Text(person.snippet)
                        .font(.amberCaption)
                        .foregroundStyle(Color.amberTertiaryText)
                        .lineLimit(1)
                }
            }

            Spacer()

            Button {
                // Add to Amber contacts
            } label: {
                Image(systemName: "person.badge.plus")
                    .font(.system(size: 15))
                    .foregroundStyle(Color.amberWarm)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 10)
        .contentShape(Rectangle())
    }
}

// MARK: - Preview

#Preview {
    ContactsView()
        .preferredColorScheme(.dark)
}
