//
//  SearchAITabView.swift
//  AmberApp
//

import SwiftUI

struct SearchAITabView: View {
    @State private var isSearchMode = false
    @State private var searchText = ""
    @State private var showAIResponse = false
    @FocusState private var isSearchFocused: Bool

    var body: some View {
        NavigationStack {
            ZStack {
                Color.amberBackground.ignoresSafeArea()

                if isSearchMode {
                    searchModeView
                        .transition(.opacity.combined(with: .scale(scale: 0.98)))
                } else {
                    feedModeView
                        .transition(.opacity.combined(with: .scale(scale: 0.98)))
                }
            }
            .navigationTitle(isSearchMode ? "" : "Discover")
            .navigationBarTitleDisplayMode(.large)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                if isSearchMode {
                    ToolbarItem(placement: .topBarLeading) {
                        Button {
                            withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) {
                                isSearchMode = false
                                searchText = ""
                                showAIResponse = false
                                isSearchFocused = false
                            }
                        } label: {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 17, weight: .semibold))
                                .foregroundColor(.amberBlue)
                        }
                    }
                }
            }
        }
    }

    // MARK: - Feed Mode

    private var feedModeView: some View {
        ScrollView {
            VStack(spacing: 14) {
                ForEach(MockData.widgets) { widget in
                    WidgetCard(widget: widget)
                }

                // Bottom search bar
                Button {
                    withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) {
                        isSearchMode = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                            isSearchFocused = true
                        }
                    }
                } label: {
                    HStack(spacing: 10) {
                        Image(systemName: "sparkle.magnifyingglass")
                            .font(.system(size: 16))
                            .foregroundColor(.amberBlue)

                        Text("Ask Amber anything...")
                            .font(.system(size: 16))
                            .foregroundColor(.white.opacity(0.4))

                        Spacer()
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                    .background(.ultraThinMaterial)
                    .clipShape(Capsule())
                    .overlay(
                        Capsule()
                            .strokeBorder(
                                LinearGradient(
                                    colors: [.amberBlue.opacity(0.3), .amberGold.opacity(0.2)],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                ),
                                lineWidth: 1
                            )
                    )
                }
                .buttonStyle(.plain)
                .padding(.horizontal, 16)
                .padding(.top, 8)
            }
            .padding(.top, 8)
            .padding(.bottom, 120)
        }
    }

    // MARK: - Search/AI Mode

    private var searchModeView: some View {
        VStack(spacing: 16) {
            // Search bar at top
            HStack(spacing: 10) {
                Image(systemName: "sparkle.magnifyingglass")
                    .font(.system(size: 16))
                    .foregroundColor(.amberBlue)

                TextField("Ask Amber anything...", text: $searchText)
                    .font(.system(size: 16))
                    .foregroundColor(.white)
                    .focused($isSearchFocused)
                    .onSubmit {
                        if !searchText.isEmpty {
                            withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) {
                                showAIResponse = true
                                isSearchFocused = false
                            }
                        }
                    }

                if !searchText.isEmpty {
                    Button {
                        searchText = ""
                        showAIResponse = false
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 16))
                            .foregroundColor(.white.opacity(0.4))
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(.ultraThinMaterial)
            .clipShape(Capsule())
            .overlay(
                Capsule()
                    .strokeBorder(Color.amberBlue.opacity(0.3), lineWidth: 1)
            )
            .padding(.horizontal, 16)
            .padding(.top, 8)

            if showAIResponse {
                // AI conversation
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        // User query
                        HStack {
                            Spacer()
                            Text(searchText)
                                .font(.system(size: 15))
                                .foregroundColor(.white)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 10)
                                .background(Color.amberBlue)
                                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                        }

                        // AI response
                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: "sparkles")
                                .font(.system(size: 14))
                                .foregroundColor(.amberGold)
                                .frame(width: 28, height: 28)
                                .background(Color.amberGold.opacity(0.15))
                                .clipShape(Circle())

                            VStack(alignment: .leading, spacing: 8) {
                                Text(MockData.aiMockResponse)
                                    .font(.system(size: 15))
                                    .foregroundColor(.white.opacity(0.9))
                                    .lineSpacing(4)
                            }
                            .padding(14)
                            .background(.ultraThinMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 16, style: .continuous)
                                    .strokeBorder(.white.opacity(0.06), lineWidth: 0.5)
                            )
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 120)
                }
            } else {
                // Suggestions
                ScrollView {
                    VStack(spacing: 20) {
                        // Suggestion pills
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Try asking")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.white.opacity(0.4))
                                .padding(.horizontal, 4)

                            FlowLayout(spacing: 8) {
                                ForEach(MockData.aiSuggestions, id: \.self) { suggestion in
                                    Button {
                                        searchText = suggestion
                                        withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) {
                                            showAIResponse = true
                                            isSearchFocused = false
                                        }
                                    } label: {
                                        Text(suggestion)
                                            .font(.system(size: 13, weight: .medium))
                                            .foregroundColor(.amberBlue)
                                            .padding(.horizontal, 14)
                                            .padding(.vertical, 8)
                                            .background(Color.amberBlue.opacity(0.12))
                                            .clipShape(Capsule())
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                        .padding(.horizontal, 16)

                        Spacer(minLength: 80)

                        // Empty state
                        VStack(spacing: 16) {
                            Image(systemName: "hexagon.fill")
                                .font(.system(size: 48))
                                .foregroundStyle(
                                    LinearGradient(
                                        colors: [.amberBlue.opacity(0.3), .amberGold.opacity(0.2)],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )

                            Text("I can help with your contacts, events,\nhealth insights, and more")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.3))
                                .multilineTextAlignment(.center)
                        }

                        Spacer()
                    }
                    .padding(.top, 8)
                    .padding(.bottom, 120)
                }
            }
        }
    }
}

// MARK: - Widget Card

private struct WidgetCard: View {
    let widget: MockWidget

    var body: some View {
        GlassCard(cornerRadius: 16, borderOpacity: 0.06) {
            HStack(spacing: 14) {
                Text(widget.emoji)
                    .font(.system(size: 28))
                    .frame(width: 44, height: 44)

                VStack(alignment: .leading, spacing: 4) {
                    Text(widget.title)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.white)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)

                    if let subtitle = widget.subtitle {
                        Text(subtitle)
                            .font(.system(size: 13))
                            .foregroundColor(.white.opacity(0.5))
                            .lineLimit(2)
                    }
                }

                Spacer()

                if let action = widget.actionLabel {
                    Text(action)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.amberBlue)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.amberBlue.opacity(0.12))
                        .clipShape(Capsule())
                }
            }
            .padding(16)
        }
        .padding(.horizontal, 16)
    }
}

// MARK: - Flow Layout

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = layout(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = layout(proposal: proposal, subviews: subviews)
        for (index, placement) in result.placements.enumerated() {
            subviews[index].place(
                at: CGPoint(x: bounds.minX + placement.x, y: bounds.minY + placement.y),
                proposal: .unspecified
            )
        }
    }

    private func layout(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, placements: [CGPoint]) {
        let maxWidth = proposal.width ?? .infinity
        var placements: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0
        var maxX: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth, x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            placements.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
            maxX = max(maxX, x)
        }

        return (CGSize(width: maxX, height: y + rowHeight), placements)
    }
}
