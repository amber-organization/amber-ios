//
//  SearchView.swift
//  AmberApp
//
//  People rank search — Togari Amber backend + Exa fallback.
//

import SwiftUI
import Contacts

struct SearchView: View {
    @StateObject private var togariService = TogariService()
    @StateObject private var contactsService = ContactsService()
    @State private var searchText = ""

    private var localMatches: [CNContact] {
        guard !searchText.isEmpty else { return [] }
        return contactsService.contacts.filter {
            $0.fullName.localizedCaseInsensitiveContains(searchText) ||
            $0.organizationName.localizedCaseInsensitiveContains(searchText)
        }.prefix(5).map { $0 }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        LiquidGlassSearchBar(
                            searchText: $searchText,
                            placeholder: "Search people"
                        )
                        .padding(.horizontal, 16)
                        .onChange(of: searchText) {
                            togariService.search(query: searchText)
                        }

                        if searchText.isEmpty {
                            emptyState
                        } else {
                            // Local contacts section
                            if !localMatches.isEmpty {
                                localContactsSection
                            }

                            // Discover section (Togari/Exa)
                            discoverSection
                        }
                    }
                    .padding(.bottom, 120)
                }
            }
            .navigationTitle("Search")
            .navigationBarTitleDisplayMode(.large)
            .toolbarBackground(Color.black, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
        }
        .preferredColorScheme(.dark)
        .task {
            let granted = await contactsService.requestAccess()
            if granted { await contactsService.fetchAllContacts() }
        }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 48, weight: .light))
                .foregroundStyle(Color.amberTertiaryText)
            Text("Search for people")
                .font(.amberHeadline)
                .foregroundStyle(Color.amberSecondaryText)
            Text("Find contacts, colleagues, and discover new connections")
                .font(.amberCaption)
                .foregroundStyle(Color.amberTertiaryText)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 80)
        .padding(.horizontal, 40)
    }

    // MARK: - Local Contacts

    private var localContactsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Contacts")
                .amberSectionHeader()
                .padding(.horizontal, 20)

            VStack(spacing: 0) {
                ForEach(Array(localMatches.enumerated()), id: \.element.identifier) { index, contact in
                    HStack(spacing: 12) {
                        ZStack {
                            Circle().fill(Color.amberSurface).frame(width: 44, height: 44)
                            Text(contact.initials)
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundStyle(Color.amberText)
                        }
                        VStack(alignment: .leading, spacing: 2) {
                            Text(contact.fullName)
                                .font(.amberBody)
                                .foregroundStyle(Color.amberText)
                            if !contact.subtitle.isEmpty {
                                Text(contact.subtitle)
                                    .font(.amberCaption)
                                    .foregroundStyle(Color.amberSecondaryText)
                            }
                        }
                        Spacer()
                        Text("Local")
                            .font(.amberCaption2)
                            .foregroundStyle(Color.amberSuccess)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color.amberSuccess.opacity(0.15), in: Capsule())
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)

                    if index < localMatches.count - 1 {
                        Color.glassStroke.frame(height: 0.5).padding(.leading, 70)
                    }
                }
            }
            .liquidGlassCard()
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Discover

    private var discoverSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Discover")
                    .amberSectionHeader()
                if togariService.isSearching {
                    ProgressView()
                        .scaleEffect(0.7)
                        .tint(.amberWarm)
                }
            }
            .padding(.horizontal, 20)

            if togariService.results.isEmpty && !togariService.isSearching {
                HStack {
                    Text("No results found")
                        .font(.amberCaption)
                        .foregroundStyle(Color.amberSecondaryText)
                }
                .padding(16)
                .frame(maxWidth: .infinity)
                .liquidGlassCard()
                .padding(.horizontal, 16)
            } else {
                VStack(spacing: 0) {
                    ForEach(Array(togariService.results.enumerated()), id: \.element.id) { index, contact in
                        HStack(spacing: 12) {
                            ZStack {
                                Circle()
                                    .fill(contact.source == "togari" ? Color.amberWarm : Color.healthSocial)
                                    .frame(width: 44, height: 44)
                                Text(String(contact.fullName.prefix(2)).uppercased())
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundStyle(.white)
                            }

                            VStack(alignment: .leading, spacing: 2) {
                                Text(contact.fullName)
                                    .font(.amberBody)
                                    .foregroundStyle(Color.amberText)

                                if !contact.title.isEmpty || !contact.company.isEmpty {
                                    Text([contact.title, contact.company].filter { !$0.isEmpty }.joined(separator: " · "))
                                        .font(.amberCaption)
                                        .foregroundStyle(Color.amberSecondaryText)
                                        .lineLimit(1)
                                }
                            }

                            Spacer()

                            // Source badge
                            Text(contact.source.capitalized)
                                .font(.amberCaption2)
                                .foregroundStyle(contact.source == "togari" ? Color.amberWarm : Color.healthSocial)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(
                                    (contact.source == "togari" ? Color.amberWarm : Color.healthSocial).opacity(0.15),
                                    in: Capsule()
                                )
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)

                        if index < togariService.results.count - 1 {
                            Color.glassStroke.frame(height: 0.5).padding(.leading, 70)
                        }
                    }
                }
                .liquidGlassCard()
                .padding(.horizontal, 16)
            }
        }
    }
}
