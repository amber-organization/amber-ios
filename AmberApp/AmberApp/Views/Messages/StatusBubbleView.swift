//
//  StatusBubbleView.swift
//  AmberApp
//
//  Single status note — speech bubble + avatar + name.
//

import SwiftUI

struct StatusBubbleView: View {
    let status: StatusNote
    var onTap: () -> Void = {}

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 0) {
                // Speech bubble
                speechBubble
                    .padding(.bottom, 4)

                // Avatar
                ZStack {
                    Circle()
                        .fill(status.avatarColor)
                        .frame(width: 72, height: 72)

                    Text(status.initials)
                        .font(.system(size: 24, weight: .semibold))
                        .foregroundStyle(.white)

                    // "+" overlay for your own status
                    if status.isYours {
                        Circle()
                            .fill(Color.amberWarm)
                            .frame(width: 22, height: 22)
                            .overlay(
                                Image(systemName: "plus")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundStyle(.white)
                            )
                            .overlay(
                                Circle()
                                    .strokeBorder(Color.black, lineWidth: 2)
                            )
                            .offset(x: 24, y: 24)
                    }
                }

                // Name
                Text(status.name)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(Color.amberText)
                    .lineLimit(1)
                    .padding(.top, 6)
            }
            .frame(width: 88)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Speech Bubble

    private var speechBubble: some View {
        VStack(spacing: 0) {
            Text(status.note)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(Color.amberText)
                .multilineTextAlignment(.center)
                .lineLimit(2)
                .padding(.horizontal, 10)
                .padding(.vertical, 8)
                .background(Color(hex: "1F2C34"), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                .fixedSize(horizontal: false, vertical: true)

            // Tail pointing down
            Triangle()
                .fill(Color(hex: "1F2C34"))
                .frame(width: 14, height: 7)
        }
    }
}

// MARK: - Triangle Shape

private struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        Path { path in
            path.move(to: CGPoint(x: rect.midX - rect.width / 2, y: 0))
            path.addLine(to: CGPoint(x: rect.midX + rect.width / 2, y: 0))
            path.addLine(to: CGPoint(x: rect.midX, y: rect.height))
            path.closeSubpath()
        }
    }
}
