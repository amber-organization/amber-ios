//
//  AmberAIView.swift
//  AmberApp
//
//  The hero view — a living constellation of your relationships.
//  Network graph IS the response. Visualization-first AI interface.
//

import SwiftUI

// MARK: - Node Model

struct NetworkNode: Identifiable {
    let id = UUID()
    let name: String
    let radius: CGFloat
    let baseAngle: CGFloat          // radians from center
    let distance: CGFloat           // distance from center
    let color: Color
    var connections: [Int]           // indices of other nodes this connects to
}

// MARK: - AmberAIView

struct AmberAIView: View {
    @Environment(\.showProfile) var showProfile

    // Animation state
    @State private var breathePhase: CGFloat = 0
    @State private var nodeOffsets: [CGSize] = Array(repeating: .zero, count: 8)
    @State private var glowPulse: Bool = false
    @State private var appeared: Bool = false

    // Response state
    @State private var hasResponse: Bool = false

    // Sample network nodes
    private let nodes: [NetworkNode] = [
        NetworkNode(name: "Angela",  radius: 18, baseAngle: 0.0,            distance: 110, color: Color.healthEmotional, connections: [1]),
        NetworkNode(name: "Kaitlyn", radius: 17, baseAngle: .pi * 0.28,     distance: 120, color: Color.healthSocial,     connections: [0]),
        NetworkNode(name: "Victor",  radius: 14, baseAngle: .pi * 0.52,     distance: 135, color: Color.amberGold,         connections: []),
        NetworkNode(name: "Michelle",radius: 14, baseAngle: .pi * 0.78,     distance: 125, color: Color.healthPhysical,    connections: []),
        NetworkNode(name: "Rohan",   radius: 11, baseAngle: .pi * 1.05,     distance: 145, color: Color.healthIntellectual,connections: [5]),
        NetworkNode(name: "Priya",   radius: 11, baseAngle: .pi * 1.35,     distance: 140, color: Color.healthSpiritual,   connections: [4]),
        NetworkNode(name: "Dev",     radius: 9,  baseAngle: .pi * 1.62,     distance: 150, color: Color.amberWarm,         connections: []),
        NetworkNode(name: "Mom",     radius: 14, baseAngle: .pi * 1.88,     distance: 115, color: Color.amberHoney,        connections: []),
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                Color.amberBackground.ignoresSafeArea()

                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: 0) {
                        // MARK: - Network Visualization
                        networkVisualization
                            .frame(height: UIScreen.main.bounds.height * 0.55)

                        // MARK: - Context Cards
                        contextCardsSection
                            .padding(.top, 20)

                        // MARK: - AI Response Area
                        if hasResponse {
                            responseSection
                                .padding(.top, 24)
                                .transition(.opacity.combined(with: .move(edge: .bottom)))
                        }

                        Spacer(minLength: 140)
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    HStack(spacing: 8) {
                        Image("AmberLogo")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 28, height: 28)

                        Text("Amber")
                            .font(.amberTitle2)
                            .foregroundColor(.amberText)
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    ProfileAvatarButton()
                }
            }
            .onAppear {
                startAnimations()
                // Show sample response after brief delay
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                    withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
                        hasResponse = true
                    }
                }
            }
        }
    }

    // MARK: - Network Visualization Canvas

    private var networkVisualization: some View {
        GeometryReader { geo in
            let center = CGPoint(x: geo.size.width / 2, y: geo.size.height / 2)

            ZStack {
                // Ambient glow behind center node
                Circle()
                    .fill(Color.amberGlowGradient)
                    .frame(width: 240, height: 240)
                    .scaleEffect(glowPulse ? 1.15 : 0.85)
                    .opacity(appeared ? 0.6 : 0)
                    .position(center)

                // Canvas: connection lines
                Canvas { context, size in
                    let cx = size.width / 2
                    let cy = size.height / 2
                    let centerPt = CGPoint(x: cx, y: cy)

                    // Calculate node positions
                    let positions = nodePositions(center: centerPt)

                    // Draw center-to-node connections
                    for (i, pos) in positions.enumerated() {
                        var path = Path()
                        path.move(to: centerPt)
                        path.addLine(to: pos)
                        context.stroke(
                            path,
                            with: .color(Color.amberSecondaryText.opacity(0.1)),
                            lineWidth: 1
                        )

                        // Draw cross-connections
                        for targetIdx in nodes[i].connections {
                            guard targetIdx < positions.count else { continue }
                            var crossPath = Path()
                            crossPath.move(to: pos)
                            crossPath.addLine(to: positions[targetIdx])
                            context.stroke(
                                crossPath,
                                with: .color(Color.amberSecondaryText.opacity(0.06)),
                                lineWidth: 0.8
                            )
                        }
                    }
                }
                .allowsHitTesting(false)

                // Surrounding person nodes
                ForEach(Array(nodes.enumerated()), id: \.element.id) { index, node in
                    let pos = nodePosition(for: index, center: center)

                    Circle()
                        .fill(node.color.opacity(0.8))
                        .frame(width: node.radius * 2, height: node.radius * 2)
                        .overlay(
                            Circle()
                                .strokeBorder(Color.white.opacity(0.2), lineWidth: 1)
                        )
                        .shadow(color: node.color.opacity(0.3), radius: 8, x: 0, y: 0)
                        .offset(nodeOffsets[index])
                        .position(pos)
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.3)
                        .animation(
                            .spring(response: 0.8, dampingFraction: 0.6)
                                .delay(Double(index) * 0.07),
                            value: appeared
                        )
                }

                // Central "You" node
                ZStack {
                    // Outer glow ring
                    Circle()
                        .fill(Color.amberWarm.opacity(0.08))
                        .frame(width: 80, height: 80)
                        .scaleEffect(glowPulse ? 1.2 : 1.0)

                    // Main node
                    Circle()
                        .fill(Color.amberBrandGradient)
                        .frame(width: 60, height: 60)
                        .overlay(
                            Circle()
                                .strokeBorder(Color.white.opacity(0.6), lineWidth: 2)
                        )
                        .shadow(color: Color.amberWarm.opacity(0.4), radius: 16, x: 0, y: 0)
                }
                .position(center)
                .scaleEffect(appeared ? 1 : 0.1)
                .opacity(appeared ? 1 : 0)
                .animation(.spring(response: 0.7, dampingFraction: 0.65), value: appeared)
            }
        }
    }

    // MARK: - Context Cards Section

    private var contextCardsSection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 14) {
                // Reconnect card
                ContextCard(
                    icon: "arrow.triangle.2.circlepath",
                    iconColor: .amberWarm,
                    headline: "Reconnect",
                    detail: "Angela & Dev — haven't talked in 2+ weeks"
                )

                // Weekly pattern card
                ContextCard(
                    icon: "chart.line.uptrend.xyaxis",
                    iconColor: .amberGold,
                    headline: "This Week",
                    detail: "Most social with MAYA Biotech circle"
                )

                // Upcoming card
                ContextCard(
                    icon: "calendar.badge.clock",
                    iconColor: .healthSpiritual,
                    headline: "Upcoming",
                    detail: "Angela's birthday in 3 days"
                )
            }
            .padding(.horizontal, 20)
        }
    }

    // MARK: - Response Section

    private var responseSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Who should I reconnect with?")
                .font(.amberFootnote)
                .foregroundColor(.amberSecondaryText)
                .padding(.horizontal, 20)

            // People cards
            VStack(spacing: 12) {
                ReconnectPersonCard(
                    initials: "AK",
                    name: "Angela Kim",
                    detail: "Last talked 14 days ago",
                    reason: "You mentioned wanting to catch up after the MAYA meeting",
                    color: .healthEmotional
                )

                ReconnectPersonCard(
                    initials: "DV",
                    name: "Dev Varma",
                    detail: "Last talked 21 days ago",
                    reason: "Shared interest in healthcare AI — thread from 2 weeks ago",
                    color: .amberWarm
                )
            }
            .padding(.horizontal, 20)

            // Rabbit hole card
            RabbitHoleCard(
                headline: "Your healthcare AI thread",
                detail: "You and Dev discussed FDA regulation gaps 2 weeks ago. There's been a new ruling since.",
                icon: "arrow.turn.down.right"
            )
            .padding(.horizontal, 20)
        }
    }

    // MARK: - Helpers

    private func nodePosition(for index: Int, center: CGPoint) -> CGPoint {
        let node = nodes[index]
        let breatheOffset = sin(breathePhase + node.baseAngle * 2) * 4
        let dist = node.distance + breatheOffset
        let angleWobble = sin(breathePhase * 0.7 + CGFloat(index)) * 0.03
        let angle = node.baseAngle + angleWobble
        return CGPoint(
            x: center.x + cos(angle) * dist,
            y: center.y + sin(angle) * dist
        )
    }

    private func nodePositions(center: CGPoint) -> [CGPoint] {
        (0..<nodes.count).map { nodePosition(for: $0, center: center) }
    }

    private func startAnimations() {
        // Entrance
        withAnimation(.easeOut(duration: 0.6)) {
            appeared = true
        }

        // Breathing glow
        withAnimation(.easeInOut(duration: 3).repeatForever(autoreverses: true)) {
            glowPulse = true
        }

        // Continuous breathe phase for node drift
        Timer.scheduledTimer(withTimeInterval: 1.0 / 30.0, repeats: true) { _ in
            withAnimation(.linear(duration: 1.0 / 30.0)) {
                breathePhase += 0.03
            }
        }
    }
}

// MARK: - Context Card

private struct ContextCard: View {
    let icon: String
    let iconColor: Color
    let headline: String
    let detail: String

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 20, weight: .medium))
                .foregroundStyle(iconColor)

            Text(headline)
                .font(.amberHeadline)
                .foregroundColor(.amberText)

            Text(detail)
                .font(.amberCaption)
                .foregroundColor(.amberSecondaryText)
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(width: 160, alignment: .leading)
        .padding(16)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .strokeBorder(Color.amberWarm.opacity(0.1), lineWidth: 0.5)
        )
    }
}

// MARK: - Reconnect Person Card

private struct ReconnectPersonCard: View {
    let initials: String
    let name: String
    let detail: String
    let reason: String
    let color: Color

    var body: some View {
        HStack(spacing: 14) {
            // Avatar
            ZStack {
                Circle()
                    .fill(color.opacity(0.2))
                    .frame(width: 46, height: 46)

                Text(initials)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(color)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(name)
                    .font(.amberHeadline)
                    .foregroundColor(.amberText)

                Text(detail)
                    .font(.amberCaption)
                    .foregroundColor(.amberSecondaryText)

                Text(reason)
                    .font(.amberCaption)
                    .foregroundColor(.amberGold)
                    .lineLimit(2)
            }

            Spacer(minLength: 0)
        }
        .padding(16)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .strokeBorder(Color.amberWarm.opacity(0.08), lineWidth: 0.5)
        )
    }
}

// MARK: - Rabbit Hole Card

private struct RabbitHoleCard: View {
    let headline: String
    let detail: String
    let icon: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 18, weight: .medium))
                .foregroundStyle(Color.amberEmber)
                .frame(width: 36, height: 36)
                .background(Color.amberEmber.opacity(0.12), in: RoundedRectangle(cornerRadius: 10, style: .continuous))

            VStack(alignment: .leading, spacing: 4) {
                Text(headline)
                    .font(.amberHeadline)
                    .foregroundColor(.amberText)

                Text(detail)
                    .font(.amberCaption)
                    .foregroundColor(.amberSecondaryText)
                    .lineLimit(3)
            }

            Spacer(minLength: 0)

            Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.amberSecondaryText.opacity(0.5))
        }
        .padding(16)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .strokeBorder(Color.amberEmber.opacity(0.1), lineWidth: 0.5)
        )
    }
}

// MARK: - Preview

#Preview {
    AmberAIView()
        .preferredColorScheme(.dark)
}
