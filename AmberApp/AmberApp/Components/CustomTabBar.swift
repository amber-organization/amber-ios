//
//  CustomTabBar.swift
//  AmberApp
//
//  Apple News+ liquid glass tab bar — rounded pill with 4 main tabs
//  and a separate circular search button on the right.
//

import SwiftUI

struct CustomTabBar: View {
    @Binding var selectedTab: Int
    @Namespace private var highlight

    private let mainTabs: [(icon: String, iconInactive: String, label: String, index: Int)] = [
        ("person.crop.circle.fill", "person.crop.circle", "Contacts", 0),
        ("bubble.left.and.bubble.right.fill", "bubble.left.and.bubble.right", "Messages", 1),
        ("calendar", "calendar", "Today", 2),
        ("person.circle.fill", "person.circle", "Profile", 3),
    ]

    var body: some View {
        HStack(spacing: 10) {
            // Main pill with 4 tabs
            HStack(spacing: 0) {
                ForEach(mainTabs, id: \.index) { tab in
                    Button {
                        withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                            selectedTab = tab.index
                        }
                    } label: {
                        VStack(spacing: 4) {
                            Image(systemName: selectedTab == tab.index ? tab.icon : tab.iconInactive)
                                .font(.system(size: 20, weight: .medium))
                                .foregroundStyle(
                                    selectedTab == tab.index ? Color.amberWarm : Color.amberSecondaryText.opacity(0.7)
                                )
                                .frame(width: 28, height: 28)

                            Text(tab.label)
                                .font(.system(size: 10, weight: selectedTab == tab.index ? .semibold : .regular))
                                .foregroundStyle(
                                    selectedTab == tab.index ? Color.amberWarm : Color.amberSecondaryText.opacity(0.7)
                                )
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background {
                            if selectedTab == tab.index {
                                RoundedRectangle(cornerRadius: 16, style: .continuous)
                                    .fill(Color.white.opacity(0.08))
                                    .matchedGeometryEffect(id: "TAB_HIGHLIGHT", in: highlight)
                            }
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 6)
            .padding(.vertical, 6)
            .background {
                Capsule(style: .continuous)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        Capsule(style: .continuous)
                            .strokeBorder(Color.white.opacity(0.12), lineWidth: 0.5)
                    )
                    .shadow(color: .black.opacity(0.35), radius: 20, y: -4)
            }

            // Separate search circle
            Button {
                withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                    selectedTab = 4
                }
            } label: {
                ZStack {
                    Circle()
                        .fill(.ultraThinMaterial)
                        .frame(width: 56, height: 56)
                        .overlay(
                            selectedTab == 4
                                ? Circle().fill(Color.white.opacity(0.08)).frame(width: 56, height: 56)
                                : nil
                        )
                        .overlay(
                            Circle()
                                .strokeBorder(Color.white.opacity(0.12), lineWidth: 0.5)
                        )
                        .shadow(color: .black.opacity(0.35), radius: 20, y: -4)

                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(selectedTab == 4 ? Color.amberWarm : Color.amberSecondaryText.opacity(0.7))
                }
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 12)
        .padding(.bottom, 2)
    }
}
