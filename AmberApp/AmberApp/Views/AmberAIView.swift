//
//  AmberAIView.swift
//  AmberApp
//
//  Center tab — "Perplexity for people". A living network visualization
//  with a clean AI interface. Dark mode only. Production quality.
//

import SwiftUI

// MARK: - Node Model

struct NetworkNode: Identifiable {
    let id = UUID()
    let name: String
    let radius: CGFloat
    let baseAngle: CGFloat
    let distance: CGFloat
    let color: Color
    var connections: [Int] // indices of other satellite nodes this connects to
}

// MARK: - Explore Card Model

private struct ExploreCard: Identifiable {
    let id = UUID()
    let icon: String
    let title: String
    let description: String
    let color: Color
}

// MARK: - AmberAIView

struct AmberAIView: View {
    // Query state (stubbed for future use)
    @State var queryText = ""
    @State var isQuerying = false

    // Animation state
    @State private var breathePhase: CGFloat = 0
    @State private var glowPulse: Bool = false
    @State private var appeared: Bool = false

    // Timer
    @State private var breatheTimer: Timer?

    // Sample network nodes
    private let nodes: [NetworkNode] = [
        NetworkNode(name: "Angela",   radius: 10, baseAngle: 0.4,          distance: 90,  color: .healthSocial,       connections: [1]),
        NetworkNode(name: "Kaitlyn",  radius: 9,  baseAngle: 0.85,         distance: 95,  color: .healthIntellectual, connections: [0]),
        NetworkNode(name: "Victor",   radius: 8,  baseAngle: 1.35,         distance: 115, color: .amberGold,          connections: [3]),
        NetworkNode(name: "Michelle", radius: 7,  baseAngle: 1.85,         distance: 110, color: .healthEmotional,    connections: [2]),
        NetworkNode(name: "Mom",      radius: 11, baseAngle: 2.5,          distance: 85,  color: .healthSpiritual,    connections: []),
        NetworkNode(name: "Dev",      radius: 7,  baseAngle: 3.3,          distance: 135, color: .healthPhysical,     connections: []),
        NetworkNode(name: "Rohan",    radius: 8,  baseAngle: 4.2,          distance: 110, color: .amberWarm,          connections: [7]),
        NetworkNode(name: "Priya",    radius: 6,  baseAngle: 5.2,          distance: 130, color: .healthFinancial,    connections: [6]),
    ]

    // Suggestion chips
    private let suggestions = [
        "Who should I reconnect with?",
        "Show me my USC network",
        "Family tree",
        "Find friends nearby",
        "What should I remember about Angela?",
    ]

    // Explore cards
    private let exploreCards: [ExploreCard] = [
        ExploreCard(icon: "tree",              title: "Family Tree",          description: "Map your family connections",    color: .healthSpiritual),
        ExploreCard(icon: "location",          title: "Find Friends",         description: "See who's nearby",               color: .healthSocial),
        ExploreCard(icon: "chart.bar.fill",    title: "Network Strength",     description: "Your relationship health",       color: .amberGold),
        ExploreCard(icon: "person.2",          title: "Mutual Connections",   description: "People you both know",           color: .amberWarm),
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                Color.amberBackground.ignoresSafeArea()

                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: 0) {

                        // MARK: - Network Visualization (hero)
                        networkVisualization
                            .frame(height: UIScreen.main.bounds.height * 0.55)

                        // MARK: - Suggestion Chips
                        suggestionChips
                            .padding(.top, 12)

                        // MARK: - Explore Section
                        exploreSection
                            .padding(.top, 28)

                        // Bottom padding for NetworkInputBar + tab bar
                        Spacer(minLength: 180)
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
                            .frame(width: 24, height: 24)

                        Text("amber")
                            .font(.amberTitle3)
                            .foregroundColor(.amberText)
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    ProfileAvatarButton()
                }
            }
            .onAppear { startAnimations() }
            .onDisappear { breatheTimer?.invalidate() }
        }
        .preferredColorScheme(.dark)
    }

    // MARK: - Network Visualization

    private var networkVisualization: some View {
        GeometryReader { geo in
            let center = CGPoint(x: geo.size.width / 2, y: geo.size.height / 2)

            ZStack {
                // Ambient glow behind center node
                Circle()
                    .fill(Color.amberGlowGradient)
                    .frame(width: 200, height: 200)
                    .scaleEffect(glowPulse ? 1.15 : 0.85)
                    .opacity(appeared ? 0.6 : 0)
                    .position(center)
                    .animation(.easeInOut(duration: 3).repeatForever(autoreverses: true), value: glowPulse)

                // Canvas: connection lines (performant)
                Canvas { context, size in
                    let cx = size.width / 2
                    let cy = size.height / 2
                    let centerPt = CGPoint(x: cx, y: cy)
                    let positions = computePositions(center: centerPt)

                    // Center-to-node connections
                    for pos in positions {
                        var path = Path()
                        path.move(to: centerPt)
                        path.addLine(to: pos)
                        context.stroke(
                            path,
                            with: .color(Color.amberTertiaryText.opacity(0.15)),
                            lineWidth: 1
                        )
                    }

                    // Cross-connections
                    for (i, node) in nodes.enumerated() {
                        for targetIdx in node.connections {
                            guard targetIdx < positions.count else { continue }
                            var crossPath = Path()
                            crossPath.move(to: positions[i])
                            crossPath.addLine(to: positions[targetIdx])
                            context.stroke(
                                crossPath,
                                with: .color(Color.amberTertiaryText.opacity(0.08)),
                                lineWidth: 0.6
                            )
                        }
                    }
                }
                .allowsHitTesting(false)

                // Satellite nodes
                ForEach(Array(nodes.enumerated()), id: \.element.id) { index, node in
                    let pos = positionFor(index: index, center: center)

                    VStack(spacing: 4) {
                        Circle()
                            .fill(node.color.opacity(0.85))
                            .frame(width: node.radius * 2, height: node.radius * 2)
                            .overlay(
                                Circle()
                                    .strokeBorder(Color.white.opacity(0.2), lineWidth: 1)
                            )
                            .shadow(color: node.color.opacity(0.35), radius: 8)

                        Text(node.name)
                            .font(.amberCaption2)
                            .foregroundColor(.amberSecondaryText)
                    }
                    .position(pos)
                    .opacity(appeared ? 1 : 0)
                    .scaleEffect(appeared ? 1 : 0)
                    .animation(
                        .spring(response: 0.35, dampingFraction: 0.75)
                            .delay(0.15 + Double(index) * 0.06),
                        value: appeared
                    )
                }

                // Central "You" node
                ZStack {
                    // Outer glow ring
                    Circle()
                        .fill(Color.amberWarm.opacity(0.06))
                        .frame(width: 80, height: 80)
                        .scaleEffect(glowPulse ? 1.2 : 1.0)

                    // Main circle
                    Circle()
                        .fill(Color.amberBrandGradient)
                        .frame(width: 50, height: 50)
                        .overlay(
                            Circle()
                                .strokeBorder(Color.white.opacity(0.6), lineWidth: 2)
                        )
                        .shadow(color: Color.amberWarm.opacity(0.4), radius: 16)

                    Text("You")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.white)
                }
                .position(center)
                .scaleEffect(appeared ? 1 : 0.1)
                .opacity(appeared ? 1 : 0)
                .animation(
                    .spring(response: 0.35, dampingFraction: 0.75),
                    value: appeared
                )
            }
        }
    }

    // MARK: - Suggestion Chips

    private var suggestionChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(suggestions, id: \.self) { suggestion in
                    Button {
                        queryText = suggestion
                        // Future: trigger query
                    } label: {
                        Text(suggestion)
                            .font(.amberCallout)
                            .foregroundColor(.amberSecondaryText)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .background(
                                Color.amberCardElevated,
                                in: RoundedRectangle(cornerRadius: 12, style: .continuous)
                            )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 20)
        }
    }

    // MARK: - Explore Section

    private var exploreSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("EXPLORE")
                .amberSectionHeader()
                .padding(.horizontal, 20)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(exploreCards) { card in
                        VStack(alignment: .leading, spacing: 10) {
                            Image(systemName: card.icon)
                                .font(.system(size: 28, weight: .medium))
                                .foregroundStyle(card.color)

                            Spacer(minLength: 0)

                            Text(card.title)
                                .font(.amberHeadline)
                                .foregroundColor(.amberText)

                            Text(card.description)
                                .font(.amberCaption)
                                .foregroundColor(.amberSecondaryText)
                                .lineLimit(2)
                        }
                        .frame(width: 130, height: 160, alignment: .leading)
                        .padding(14)
                        .background(
                            Color.amberCardElevated,
                            in: RoundedRectangle(cornerRadius: 16, style: .continuous)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .strokeBorder(Color.white.opacity(0.06), lineWidth: 0.5)
                        )
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }

    // MARK: - Position Helpers

    private func positionFor(index: Int, center: CGPoint) -> CGPoint {
        let node = nodes[index]
        let drift = sin(breathePhase + node.baseAngle * 2) * 4
        let dist = node.distance + drift
        let wobble = sin(breathePhase * 0.7 + CGFloat(index)) * 0.03
        let angle = node.baseAngle + wobble
        return CGPoint(
            x: center.x + cos(angle) * dist,
            y: center.y + sin(angle) * dist
        )
    }

    private func computePositions(center: CGPoint) -> [CGPoint] {
        (0..<nodes.count).map { positionFor(index: $0, center: center) }
    }

    // MARK: - Animation

    private func startAnimations() {
        // Entrance
        withAnimation(.easeOut(duration: 0.5)) {
            appeared = true
        }

        // Glow pulse
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            glowPulse = true
        }

        // Breathing timer for node drift
        breatheTimer = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { _ in
            withAnimation(.linear(duration: 0.05)) {
                breathePhase += 0.025
            }
        }
    }
}

// MARK: - Preview

#Preview {
    AmberAIView()
        .preferredColorScheme(.dark)
}
