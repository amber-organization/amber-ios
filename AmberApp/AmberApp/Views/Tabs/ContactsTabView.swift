//
//  ContactsTabView.swift
//  AmberApp
//

import SwiftUI

struct ContactsTabView: View {
    @State private var searchText = ""
    @State private var selectedContact: MockContact?

    private var filteredContacts: [(String, [MockContact])] {
        if searchText.isEmpty {
            return MockData.groupedContacts
        }
        let filtered = MockData.contacts.filter {
            $0.name.localizedCaseInsensitiveContains(searchText) ||
            $0.relationship.localizedCaseInsensitiveContains(searchText)
        }
        let grouped = Dictionary(grouping: filtered) { $0.firstLetter }
        return grouped.sorted { $0.key < $1.key }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.amberBackground.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        // Search bar
                        HStack(spacing: 10) {
                            Image(systemName: "magnifyingglass")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.white.opacity(0.4))

                            TextField("Search contacts...", text: $searchText)
                                .font(.system(size: 16))
                                .foregroundColor(.white)

                            if !searchText.isEmpty {
                                Button { searchText = "" } label: {
                                    Image(systemName: "xmark.circle.fill")
                                        .font(.system(size: 16))
                                        .foregroundColor(.white.opacity(0.4))
                                }
                            }
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(.ultraThinMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .strokeBorder(.white.opacity(0.08), lineWidth: 0.5)
                        )
                        .padding(.horizontal, 16)

                        // Favorites
                        if searchText.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Favorites")
                                    .font(.system(size: 15, weight: .semibold))
                                    .foregroundColor(.white.opacity(0.5))
                                    .padding(.horizontal, 20)

                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: 16) {
                                        ForEach(MockData.favorites) { contact in
                                            Button {
                                                selectedContact = contact
                                            } label: {
                                                VStack(spacing: 8) {
                                                    ContactAvatar(name: contact.name, imageURL: nil, size: 56)
                                                    Text(contact.name.components(separatedBy: " ").first ?? "")
                                                        .font(.system(size: 12))
                                                        .foregroundColor(.white.opacity(0.7))
                                                        .lineLimit(1)
                                                }
                                                .frame(width: 68)
                                            }
                                            .buttonStyle(.plain)
                                        }
                                    }
                                    .padding(.horizontal, 20)
                                }
                            }
                        }

                        // All Contacts
                        VStack(alignment: .leading, spacing: 0) {
                            Text("All Contacts")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.white.opacity(0.5))
                                .padding(.horizontal, 20)
                                .padding(.bottom, 8)

                            LazyVStack(spacing: 0, pinnedViews: [.sectionHeaders]) {
                                ForEach(filteredContacts, id: \.0) { letter, contacts in
                                    Section {
                                        ForEach(contacts) { contact in
                                            Button {
                                                selectedContact = contact
                                            } label: {
                                                ContactRow(contact: contact)
                                            }
                                            .buttonStyle(.plain)
                                        }
                                    } header: {
                                        Text(letter)
                                            .font(.system(size: 13, weight: .semibold))
                                            .foregroundColor(.amberBlue)
                                            .frame(maxWidth: .infinity, alignment: .leading)
                                            .padding(.horizontal, 20)
                                            .padding(.vertical, 6)
                                            .background(Color.amberBackground)
                                    }
                                }
                            }
                        }
                    }
                    .padding(.top, 8)
                    .padding(.bottom, 120)
                }
            }
            .navigationTitle("Contacts")
            .navigationBarTitleDisplayMode(.large)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .navigationDestination(item: $selectedContact) { contact in
                MockContactDetailView(contact: contact)
            }
        }
    }
}

// MARK: - Contact Row

private struct ContactRow: View {
    let contact: MockContact

    var body: some View {
        HStack(spacing: 12) {
            ContactAvatar(name: contact.name, imageURL: nil, size: 44)

            VStack(alignment: .leading, spacing: 2) {
                Text(contact.name)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white)

                Text(contact.relationship)
                    .font(.system(size: 13))
                    .foregroundColor(.white.opacity(0.5))
            }

            Spacer()

            // Status dot
            Circle()
                .fill(contact.isRecent ? Color.green : Color.white.opacity(0.2))
                .frame(width: 8, height: 8)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 10)
    }
}

// MARK: - Contact Detail View

struct MockContactDetailView: View {
    let contact: MockContact

    var body: some View {
        ZStack {
            Color.amberBackground.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 24) {
                    // Large avatar
                    VStack(spacing: 12) {
                        ContactAvatar(name: contact.name, imageURL: nil, size: 100)

                        Text(contact.name)
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(.white)

                        Text("@\(contact.name.lowercased().replacingOccurrences(of: " ", with: ""))")
                            .font(.system(size: 15))
                            .foregroundColor(.white.opacity(0.5))
                    }
                    .padding(.top, 16)

                    // Tags
                    HStack(spacing: 8) {
                        ForEach(contact.tags, id: \.self) { tag in
                            Text(tag)
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(.amberBlue)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.amberBlue.opacity(0.15))
                                .clipShape(Capsule())
                        }
                    }

                    // Connection Strength
                    GlassCard(cornerRadius: 16) {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Connection Strength")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.white.opacity(0.5))

                            GeometryReader { geo in
                                ZStack(alignment: .leading) {
                                    RoundedRectangle(cornerRadius: 4)
                                        .fill(Color.white.opacity(0.1))
                                        .frame(height: 6)

                                    RoundedRectangle(cornerRadius: 4)
                                        .fill(
                                            LinearGradient(
                                                colors: [.amberBlue, .amberGold],
                                                startPoint: .leading,
                                                endPoint: .trailing
                                            )
                                        )
                                        .frame(width: geo.size.width * contact.connectionStrength, height: 6)
                                        .shadow(color: .amberBlue.opacity(0.5), radius: 4, y: 0)
                                }
                            }
                            .frame(height: 6)

                            Text("\(Int(contact.connectionStrength * 100))%")
                                .font(.system(size: 22, weight: .bold))
                                .foregroundColor(.white)
                        }
                        .padding(16)
                    }
                    .padding(.horizontal, 16)

                    // Shared Events
                    if !contact.sharedEvents.isEmpty {
                        GlassCard(cornerRadius: 16) {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Shared Events")
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(.white.opacity(0.5))

                                ForEach(contact.sharedEvents, id: \.self) { event in
                                    HStack(spacing: 10) {
                                        Image(systemName: "calendar")
                                            .font(.system(size: 14))
                                            .foregroundColor(.amberBlue)
                                        Text(event)
                                            .font(.system(size: 15))
                                            .foregroundColor(.white)
                                        Spacer()
                                    }
                                }
                            }
                            .padding(16)
                        }
                        .padding(.horizontal, 16)
                    }

                    // Quick Actions
                    HStack(spacing: 12) {
                        ActionButton(icon: "message.fill", label: "Message", color: .amberBlue)
                        ActionButton(icon: "phone.fill", label: "Call", color: .green)
                        ActionButton(icon: "person.fill", label: "Profile", color: .purple)
                    }
                    .padding(.horizontal, 16)

                    // Recent Interactions
                    GlassCard(cornerRadius: 16) {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Recent Interactions")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.white.opacity(0.5))

                            ForEach(contact.recentInteractions) { interaction in
                                HStack(spacing: 12) {
                                    Image(systemName: interaction.icon)
                                        .font(.system(size: 14))
                                        .foregroundColor(.amberBlue)
                                        .frame(width: 28, height: 28)
                                        .background(Color.amberBlue.opacity(0.12))
                                        .clipShape(Circle())

                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(interaction.description)
                                            .font(.system(size: 14))
                                            .foregroundColor(.white)
                                        Text(interaction.timeAgo)
                                            .font(.system(size: 12))
                                            .foregroundColor(.white.opacity(0.4))
                                    }

                                    Spacer()
                                }
                            }
                        }
                        .padding(16)
                    }
                    .padding(.horizontal, 16)
                }
                .padding(.bottom, 40)
            }
        }
        .navigationTitle("Contact")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }
}

private struct ActionButton: View {
    let icon: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(color)
                .frame(width: 48, height: 48)
                .background(color.opacity(0.12))
                .clipShape(Circle())

            Text(label)
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.6))
        }
        .frame(maxWidth: .infinity)
    }
}

extension MockContact: Hashable {
    static func == (lhs: MockContact, rhs: MockContact) -> Bool {
        lhs.id == rhs.id
    }
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}
