//
//  SearchView.swift
//  AmberApp
//
//  Search hub — 4 category cards (2×2 grid) with liquid glass bottom sheet.
//  Categories: Apple Contacts, Exa Discovery, Family Tree, Find My Friends.
//

import SwiftUI
import Contacts

// MARK: - Search Category

enum SearchCategory: String, CaseIterable, Identifiable {
    case contacts = "Contacts"
    case exa = "Discover"
    case familyTree = "Family Tree"
    case findMy = "Find My"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .contacts:   return "person.crop.circle.fill"
        case .exa:        return "globe.americas.fill"
        case .familyTree: return "figure.2.and.child.holdinghands"
        case .findMy:     return "location.circle.fill"
        }
    }

    var subtitle: String {
        switch self {
        case .contacts:   return "Search your Apple contacts"
        case .exa:        return "Find people & companies via Exa"
        case .familyTree: return "Explore your family connections"
        case .findMy:     return "See where your friends are"
        }
    }

    var gradient: [Color] {
        switch self {
        case .contacts:   return [.healthSocial, .healthSocial.opacity(0.6)]
        case .exa:        return [.amberWarm, .amberGold]
        case .familyTree: return [.healthEmotional, .healthEmotional.opacity(0.6)]
        case .findMy:     return [.amberPrimary, .amberPrimary.opacity(0.6)]
        }
    }
}

// MARK: - Search View

struct SearchView: View {
    @StateObject private var togariService = TogariService()
    @StateObject private var contactsService = ContactsService()
    @State private var searchText = ""
    @State private var activeCategory: SearchCategory? = nil
    @State private var showSearchSheet = false

    private var localMatches: [CNContact] {
        guard !searchText.isEmpty else { return [] }
        return contactsService.contacts.filter {
            $0.fullName.localizedCaseInsensitiveContains(searchText) ||
            $0.organizationName.localizedCaseInsensitiveContains(searchText)
        }.prefix(8).map { $0 }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 24) {
                        // Category Grid (2×2)
                        categoryGrid
                            .padding(.horizontal, 16)
                            .padding(.top, 8)

                        // Active category results
                        if let category = activeCategory {
                            activeCategoryContent(category)
                        }
                    }
                    .padding(.bottom, 120)
                }
            }
            .navigationTitle("Search")
            .navigationBarTitleDisplayMode(.large)
            .toolbarBackground(Color.black, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .sheet(isPresented: $showSearchSheet) {
                searchSheet
            }
        }
        .preferredColorScheme(.dark)
        .task {
            let granted = await contactsService.requestAccess()
            if granted { await contactsService.fetchAllContacts() }
        }
    }

    // MARK: - Category Grid (2×2 Apple Music/News style)

    private var categoryGrid: some View {
        LazyVGrid(columns: [
            GridItem(.flexible(), spacing: 12),
            GridItem(.flexible(), spacing: 12)
        ], spacing: 12) {
            ForEach(SearchCategory.allCases) { category in
                categoryCard(category)
            }
        }
    }

    private func categoryCard(_ category: SearchCategory) -> some View {
        let isActive = activeCategory == category

        return Button {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                if activeCategory == category {
                    activeCategory = nil
                } else {
                    activeCategory = category
                    if category == .contacts || category == .exa {
                        showSearchSheet = true
                    }
                }
            }
        } label: {
            VStack(alignment: .leading, spacing: 10) {
                Image(systemName: category.icon)
                    .font(.system(size: 28, weight: .medium))
                    .foregroundStyle(.white)

                Spacer()

                VStack(alignment: .leading, spacing: 3) {
                    Text(category.rawValue)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundStyle(.white)
                    Text(category.subtitle)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(.white.opacity(0.7))
                        .lineLimit(2)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(14)
            .frame(height: 130)
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: category.gradient,
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .strokeBorder(
                        isActive ? Color.white.opacity(0.4) : Color.white.opacity(0.1),
                        lineWidth: isActive ? 1.5 : 0.5
                    )
            )
            .shadow(color: category.gradient.first?.opacity(0.3) ?? .clear, radius: isActive ? 12 : 6, y: 4)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Active Category Content

    @ViewBuilder
    private func activeCategoryContent(_ category: SearchCategory) -> some View {
        switch category {
        case .contacts:
            if !searchText.isEmpty && !localMatches.isEmpty {
                localContactsResults
            }
        case .exa:
            exaResults
        case .familyTree:
            familyTreePlaceholder
        case .findMy:
            findMyPlaceholder
        }
    }

    // MARK: - Local Contacts Results

    private var localContactsResults: some View {
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

    // MARK: - Exa Results

    private var exaResults: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Discover")
                    .amberSectionHeader()
                if togariService.isSearching {
                    ProgressView().scaleEffect(0.7).tint(.amberWarm)
                }
            }
            .padding(.horizontal, 20)

            if togariService.results.isEmpty && !togariService.isSearching {
                HStack {
                    Image(systemName: "globe.americas")
                        .foregroundStyle(Color.amberSecondaryText)
                    Text("Search to discover people and companies")
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
                                Text(contact.fullName).font(.amberBody).foregroundStyle(Color.amberText)
                                if !contact.title.isEmpty || !contact.company.isEmpty {
                                    Text([contact.title, contact.company].filter { !$0.isEmpty }.joined(separator: " · "))
                                        .font(.amberCaption).foregroundStyle(Color.amberSecondaryText).lineLimit(1)
                                }
                            }
                            Spacer()
                            Text(contact.source.capitalized)
                                .font(.amberCaption2)
                                .foregroundStyle(contact.source == "togari" ? Color.amberWarm : Color.healthSocial)
                                .padding(.horizontal, 8).padding(.vertical, 3)
                                .background((contact.source == "togari" ? Color.amberWarm : Color.healthSocial).opacity(0.15), in: Capsule())
                        }
                        .padding(.horizontal, 14).padding(.vertical, 10)
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

    // MARK: - Family Tree Placeholder

    private var familyTreePlaceholder: some View {
        VStack(spacing: 16) {
            Image(systemName: "figure.2.and.child.holdinghands")
                .font(.system(size: 44, weight: .light))
                .foregroundStyle(Color.healthEmotional)
            Text("Family Tree")
                .font(.amberHeadline)
                .foregroundStyle(Color.amberText)
            Text("Chat with Claude to build and explore your family connections")
                .font(.amberCaption)
                .foregroundStyle(Color.amberSecondaryText)
                .multilineTextAlignment(.center)
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .liquidGlassCard()
        .padding(.horizontal, 16)
    }

    // MARK: - Find My Placeholder

    private var findMyPlaceholder: some View {
        VStack(spacing: 16) {
            Image(systemName: "location.circle.fill")
                .font(.system(size: 44, weight: .light))
                .foregroundStyle(Color.amberPrimary)
            Text("Find My Friends")
                .font(.amberHeadline)
                .foregroundStyle(Color.amberText)
            Text("See where your Amber connections are and chat about plans")
                .font(.amberCaption)
                .foregroundStyle(Color.amberSecondaryText)
                .multilineTextAlignment(.center)
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .liquidGlassCard()
        .padding(.horizontal, 16)
    }

    // MARK: - Search Sheet (Bottom)

    private var searchSheet: some View {
        NavigationStack {
            VStack(spacing: 0) {
                LiquidGlassSearchBar(
                    searchText: $searchText,
                    placeholder: activeCategory == .contacts ? "Search contacts..." : "Search people & companies..."
                )
                .padding(.horizontal, 16)
                .padding(.top, 16)
                .onChange(of: searchText) {
                    if activeCategory == .exa {
                        togariService.search(query: searchText)
                    }
                }

                ScrollView {
                    VStack(spacing: 16) {
                        if activeCategory == .contacts && !localMatches.isEmpty {
                            localContactsResults
                        } else if activeCategory == .exa {
                            exaResults
                        }
                    }
                    .padding(.top, 16)
                    .padding(.bottom, 40)
                }
            }
            .background(Color.black)
            .navigationTitle(activeCategory?.rawValue ?? "Search")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Color.black, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        showSearchSheet = false
                    }
                    .foregroundStyle(Color.amberWarm)
                }
            }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
        .presentationBackground(.black)
    }
}
