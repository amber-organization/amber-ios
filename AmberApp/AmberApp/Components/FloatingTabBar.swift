//
//  FloatingTabBar.swift
//  AmberApp
//

import SwiftUI

struct FloatingTabBar: View {
    @Binding var selectedTab: Int
    @Namespace private var animation

    private let tabs: [(icon: String, label: String)] = [
        ("person.2.fill", "Contacts"),
        ("bubble.left.and.bubble.right.fill", "Messages"),
        ("sparkle.magnifyingglass", "Search"),
        ("person.circle", "Profile"),
    ]

    var body: some View {
        HStack(spacing: 0) {
            ForEach(Array(tabs.enumerated()), id: \.offset) { index, tab in
                Button {
                    let impactFeedback = UIImpactFeedbackGenerator(style: .light)
                    impactFeedback.impactOccurred()
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        selectedTab = index
                    }
                } label: {
                    VStack(spacing: 4) {
                        let isProfile = index == 3
                        let isSelected = selectedTab == index
                        Image(systemName: tab.icon)
                            .font(.system(
                                size: isProfile ? 19 : 24,
                                weight: isSelected ? .semibold : .regular
                            ))
                            .foregroundStyle(
                                isSelected
                                    ? Color.amberBlue
                                    : Color.white.opacity(isProfile ? 0.35 : 0.5)
                            )
                            .frame(height: 28)
                            .scaleEffect(isSelected ? 1.1 : 1.0)

                        Text(tab.label)
                            .font(.system(size: 10, weight: isSelected ? .semibold : .regular))
                            .foregroundStyle(
                                isSelected
                                    ? Color.amberBlue
                                    : Color.white.opacity(isProfile ? 0.35 : 0.5)
                            )
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .padding(.horizontal, 8)
                    .background {
                        if selectedTab == index {
                            RoundedRectangle(cornerRadius: 22, style: .continuous)
                                .fill(Color.amberBlue.opacity(0.12))
                                .matchedGeometryEffect(id: "FLOATING_TAB", in: animation)
                        }
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 6)
        .background(
            .ultraThinMaterial,
            in: RoundedRectangle(cornerRadius: 28, style: .continuous)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .strokeBorder(.white.opacity(0.08), lineWidth: 0.5)
        )
        .shadow(color: .black.opacity(0.3), radius: 20, x: 0, y: 10)
        .padding(.horizontal, 24)
        .padding(.bottom, 8)
    }
}
