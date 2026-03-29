//
//  CustomTabBar.swift
//  Amber
//
//  Liquid glass 5-tab navigation.
//

import SwiftUI

struct CustomTabBar: View {
    @Binding var selectedTab: Int
    @Namespace private var animation

    var body: some View {
        HStack(spacing: 0) {
            TabBarItem(
                icon: "person.2.fill",
                iconInactive: "person.2",
                label: "People",
                isSelected: selectedTab == 0,
                namespace: animation
            ) {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.85)) {
                    selectedTab = 0
                }
            }

            TabBarItem(
                icon: "bubble.left.and.bubble.right.fill",
                iconInactive: "bubble.left.and.bubble.right",
                label: "Messages",
                isSelected: selectedTab == 1,
                badgeCount: 7,
                namespace: animation
            ) {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.85)) {
                    selectedTab = 1
                }
            }

            TabBarItem(
                icon: "hexagon.fill",
                iconInactive: "hexagon",
                label: "Amber",
                isSelected: selectedTab == 2,
                namespace: animation
            ) {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.85)) {
                    selectedTab = 2
                }
            }

            TabBarItem(
                icon: "square.stack.3d.up.fill",
                iconInactive: "square.stack.3d.up",
                label: "Today",
                isSelected: selectedTab == 3,
                namespace: animation
            ) {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.85)) {
                    selectedTab = 3
                }
            }

            TabBarItem(
                icon: "person.circle.fill",
                iconInactive: "person.circle",
                label: "Profile",
                isSelected: selectedTab == 4,
                namespace: animation
            ) {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.85)) {
                    selectedTab = 4
                }
            }
        }
        .padding(.horizontal, 4)
        .padding(.top, 8)
        .padding(.bottom, 2)
        .background {
            Rectangle()
                .fill(.regularMaterial)
                .overlay(alignment: .top) {
                    Rectangle()
                        .fill(Color.glassStroke)
                        .frame(height: 0.33)
                }
                .ignoresSafeArea(.all, edges: .bottom)
        }
    }
}

struct TabBarItem: View {
    let icon: String
    let iconInactive: String
    let label: String
    let isSelected: Bool
    var badgeCount: Int = 0
    let namespace: Namespace.ID
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 2) {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: isSelected ? icon : iconInactive)
                        .font(.system(size: 22))
                        .foregroundStyle(
                            isSelected ? Color.amberText : Color.amberSecondaryText
                        )
                        .frame(width: 28, height: 28)

                    if badgeCount > 0 && !isSelected {
                        Text("\(badgeCount)")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.white)
                            .frame(minWidth: 16, minHeight: 16)
                            .background(Color.amberError, in: Circle())
                            .offset(x: 8, y: -4)
                    }
                }

                Text(label)
                    .font(.system(size: 10, weight: isSelected ? .medium : .regular))
                    .foregroundStyle(
                        isSelected ? Color.amberText : Color.amberSecondaryText
                    )
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 2)
        }
        .buttonStyle(.plain)
    }
}
