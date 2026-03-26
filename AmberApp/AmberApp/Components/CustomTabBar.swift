//
//  CustomTabBar.swift
//  Amber
//
//  3-tab premium navigation: Messaging / Amber AI / Feed
//

import SwiftUI

struct CustomTabBar: View {
    @Binding var selectedTab: Int
    @Namespace private var animation

    var body: some View {
        HStack(spacing: 0) {
            TabBarItem(
                icon: "bubble.left.and.text.bubble.right.fill",
                label: "Messages",
                isSelected: selectedTab == 0,
                namespace: animation
            ) {
                withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                    selectedTab = 0
                }
            }

            TabBarItem(
                icon: "hexagon.fill",
                label: "Amber",
                isSelected: selectedTab == 1,
                isCenter: true,
                namespace: animation
            ) {
                withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                    selectedTab = 1
                }
            }

            TabBarItem(
                icon: "square.stack.fill",
                label: "Feed",
                isSelected: selectedTab == 2,
                namespace: animation
            ) {
                withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                    selectedTab = 2
                }
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background {
            RoundedRectangle(cornerRadius: 32, style: .continuous)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: 32, style: .continuous)
                        .strokeBorder(
                            LinearGradient(
                                colors: [.white.opacity(0.12), .white.opacity(0.04)],
                                startPoint: .top,
                                endPoint: .bottom
                            ),
                            lineWidth: 0.5
                        )
                )
                .shadow(color: .black.opacity(0.2), radius: 24, x: 0, y: 8)
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 8)
        .animation(.spring(response: 0.35, dampingFraction: 0.75), value: selectedTab)
    }
}

struct TabBarItem: View {
    let icon: String
    let label: String
    let isSelected: Bool
    var isCenter: Bool = false
    let namespace: Namespace.ID
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 5) {
                ZStack {
                    if isCenter && isSelected {
                        // Amber logo glow for center tab
                        Circle()
                            .fill(Color.amberWarm.opacity(0.15))
                            .frame(width: 40, height: 40)
                            .blur(radius: 8)
                    }

                    Image(systemName: icon)
                        .font(.system(size: isCenter ? 26 : 22, weight: isSelected ? .semibold : .regular))
                        .foregroundStyle(
                            isSelected
                                ? (isCenter ? AnyShapeStyle(Color.amberBrandGradient) : AnyShapeStyle(Color.amberWarm))
                                : AnyShapeStyle(Color.amberSecondaryText.opacity(0.6))
                        )
                        .frame(height: 28)
                }

                Text(label)
                    .font(.system(size: 10, weight: isSelected ? .semibold : .regular))
                    .foregroundStyle(isSelected ? Color.amberText : Color.amberSecondaryText.opacity(0.6))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 4)
            .background {
                if isSelected {
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .fill(Color.amberWarm.opacity(0.08))
                        .matchedGeometryEffect(id: "TAB_BG", in: namespace)
                }
            }
        }
        .buttonStyle(.plain)
    }
}
