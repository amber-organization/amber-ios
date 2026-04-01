//
//  CustomTabBar.swift
//  AmberApp
//
//  iOS 26 liquid glass tab bar — translucent rounded pill floating
//  above the bottom safe area, with blur, subtle border, and a
//  separated circular search button.
//

import SwiftUI

struct CustomTabBar: View {
    @Binding var selectedTab: Int
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
                // ── Main pill (4 tabs) ──
                mainPill

                // ── Detached search circle ──
                searchButton
            }
            .padding(.horizontal, 12)
            .padding(.top, 8)
            .padding(.bottom, 6)
        }
        // Fill the entire bottom safe area behind the bar so content
        // doesn't peek through on devices with home indicators.
        .background(alignment: .bottom) {
            Color.black.opacity(0.4)
                .ignoresSafeArea(edges: .bottom)
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

    // MARK: - Search Button

    private var searchButton: some View {
        let isActive = selectedTab == 4

        return Button {
            withAnimation(.spring(response: 0.32, dampingFraction: 0.82)) {
                selectedTab = 4
            }
        } label: {
            ZStack {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(isActive ? Color.amberWarm : Color.white.opacity(0.55))
            }
            .frame(width: 56, height: 56)
            .background {
                Circle()
                    .fill(.ultraThinMaterial)
                    .environment(\.colorScheme, .dark)
            }
            .overlay {
                if isActive {
                    Circle()
                        .fill(Color.white.opacity(0.1))
                }
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
