//
//  CustomTabBar.swift
//  AmberApp
//
//  iOS 26 liquid glass tab bar with expandable search.
//  Search button smoothly expands to take over the entire bar
//  with a text field, Apple News style. Tapping cancel contracts
//  it back to the circle.
//

import SwiftUI

struct CustomTabBar: View {
    @Binding var selectedTab: Int
    @Binding var isSearchExpanded: Bool
    @Binding var searchText: String
    var onSearchExpand: () -> Void = {}
    @FocusState private var searchFocused: Bool
    @Namespace private var highlight

    private let tabs: [(icon: String, iconActive: String, label: String)] = [
        ("person.crop.circle",              "person.crop.circle.fill",              "Contacts"),
        ("bubble.left.and.bubble.right",    "bubble.left.and.bubble.right.fill",    "Messages"),
        ("calendar",                        "calendar",                             "Today"),
        ("person.circle",                   "person.circle.fill",                   "Profile"),
    ]

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 10) {
                if isSearchExpanded {
                    expandedSearchBar
                        .transition(.asymmetric(
                            insertion: .scale(scale: 0.8, anchor: .trailing).combined(with: .opacity),
                            removal: .scale(scale: 0.8, anchor: .trailing).combined(with: .opacity)
                        ))
                } else {
                    mainPill
                        .transition(.asymmetric(
                            insertion: .scale(scale: 0.9, anchor: .leading).combined(with: .opacity),
                            removal: .scale(scale: 0.9, anchor: .leading).combined(with: .opacity)
                        ))

                    searchButton
                        .transition(.scale(scale: 0.5, anchor: .center).combined(with: .opacity))
                }
            }
            .padding(.horizontal, 12)
            .padding(.top, 8)
            .padding(.bottom, 6)
            .animation(.spring(response: 0.4, dampingFraction: 0.82), value: isSearchExpanded)
        }
        .background(alignment: .bottom) {
            Color.black.opacity(0.4)
                .ignoresSafeArea(edges: .bottom)
        }
    }

    // MARK: - Expanded Search Bar (replaces entire tab bar)

    private var expandedSearchBar: some View {
        HStack(spacing: 10) {
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundStyle(Color.white.opacity(0.5))

                TextField("Search people, places, connections...", text: $searchText)
                    .font(.system(size: 16))
                    .foregroundStyle(.white)
                    .tint(Color.amberWarm)
                    .focused($searchFocused)
                    .submitLabel(.search)

                if !searchText.isEmpty {
                    Button {
                        searchText = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 16))
                            .foregroundStyle(Color.white.opacity(0.4))
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background {
                Capsule(style: .continuous)
                    .fill(.ultraThinMaterial)
                    .environment(\.colorScheme, .dark)
            }
            .overlay {
                Capsule(style: .continuous)
                    .strokeBorder(
                        LinearGradient(
                            colors: [Color.amberWarm.opacity(0.4), Color.white.opacity(0.1)],
                            startPoint: .leading,
                            endPoint: .trailing
                        ),
                        lineWidth: 0.5
                    )
            }
            .shadow(color: .black.opacity(0.45), radius: 24, y: 8)

            Button {
                searchFocused = false
                withAnimation(.spring(response: 0.4, dampingFraction: 0.82)) {
                    searchText = ""
                    isSearchExpanded = false
                }
            } label: {
                Text("Cancel")
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(Color.amberWarm)
            }
            .buttonStyle(.plain)
        }
    }

    // MARK: - Main Pill

    private var mainPill: some View {
        HStack(spacing: 0) {
            ForEach(Array(tabs.enumerated()), id: \.offset) { index, tab in
                let isActive = selectedTab == index

                Button {
                    withAnimation(.spring(response: 0.32, dampingFraction: 0.82)) {
                        selectedTab = index
                    }
                } label: {
                    VStack(spacing: 3) {
                        Image(systemName: isActive ? tab.iconActive : tab.icon)
                            .font(.system(size: 21, weight: .medium))
                            .foregroundStyle(isActive ? Color.amberWarm : Color.white.opacity(0.55))
                            .frame(width: 30, height: 26)

                        Text(tab.label)
                            .font(.system(size: 10, weight: isActive ? .bold : .medium))
                            .foregroundStyle(isActive ? Color.amberWarm : Color.white.opacity(0.55))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .background {
                        if isActive {
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .fill(Color.white.opacity(0.1))
                                .matchedGeometryEffect(id: "PILL_HIGHLIGHT", in: highlight)
                        }
                    }
                }
                .buttonStyle(.plain)
                .accessibilityLabel(tab.label)
            }
        }
        .padding(.horizontal, 6)
        .padding(.vertical, 5)
        .background {
            Capsule(style: .continuous)
                .fill(.ultraThinMaterial)
                .environment(\.colorScheme, .dark)
        }
        .overlay {
            Capsule(style: .continuous)
                .strokeBorder(
                    LinearGradient(
                        colors: [Color.white.opacity(0.18), Color.white.opacity(0.06)],
                        startPoint: .top,
                        endPoint: .bottom
                    ),
                    lineWidth: 0.5
                )
        }
        .shadow(color: .black.opacity(0.45), radius: 24, y: 8)
    }

    // MARK: - Search Button (circle that expands)

    private var searchButton: some View {
        Button {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.82)) {
                isSearchExpanded = true
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                searchFocused = true
            }
            onSearchExpand()
        } label: {
            ZStack {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(Color.white.opacity(0.55))
            }
            .frame(width: 56, height: 56)
            .background {
                Circle()
                    .fill(.ultraThinMaterial)
                    .environment(\.colorScheme, .dark)
            }
            .overlay {
                Circle()
                    .strokeBorder(
                        LinearGradient(
                            colors: [Color.white.opacity(0.18), Color.white.opacity(0.06)],
                            startPoint: .top,
                            endPoint: .bottom
                        ),
                        lineWidth: 0.5
                    )
            }
            .shadow(color: .black.opacity(0.45), radius: 24, y: 8)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Search")
    }
}
