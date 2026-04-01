//
//  StoryCardView.swift
//  AmberApp
//
//  Full-screen story experience — gradient cards with numbered items,
//  progress bar, swipe between contacts, tap to advance cards.
//

import SwiftUI

struct StoryCardView: View {
    @ObservedObject var viewModel: StoryViewModel
    let startIndex: Int

    @State private var currentStoryIdx: Int
    @State private var currentCardIdx: Int = 0
    @State private var dragOffset: CGFloat = 0
    @Environment(\.dismiss) private var dismiss

    init(viewModel: StoryViewModel, startIndex: Int) {
        self.viewModel = viewModel
        self.startIndex = startIndex
        self._currentStoryIdx = State(initialValue: startIndex)
    }

    // MARK: - Safe Accessors

    private var currentStory: StoryItem {
        let idx = min(currentStoryIdx, viewModel.stories.count - 1)
        guard idx >= 0 else { return StoryItem.fallback }
        return viewModel.stories[idx]
    }

    private var safeCardIdx: Int {
        let cards = currentStory.cards
        guard !cards.isEmpty else { return 0 }
        return min(max(currentCardIdx, 0), cards.count - 1)
    }

    private var currentCard: StorySlide {
        let cards = currentStory.cards
        guard !cards.isEmpty else { return StorySlide.fallback }
        return cards[safeCardIdx]
    }

    // MARK: - Body

    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                colors: currentCard.gradientColors,
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            // Radial glow overlay for depth
            RadialGradient(
                colors: [
                    currentCard.gradientColors.first?.opacity(0.6) ?? .clear,
                    .clear,
                ],
                center: .center,
                startRadius: 20,
                endRadius: 400
            )
            .ignoresSafeArea()

            // Content
            VStack(spacing: 0) {
                topBar
                Spacer()
                cardContent
                Spacer()
                bottomBar
            }

            // Tap zones (left = prev card, right = next card)
            HStack(spacing: 0) {
                Color.clear
                    .contentShape(Rectangle())
                    .onTapGesture { prevCard() }

                Color.clear
                    .contentShape(Rectangle())
                    .onTapGesture { nextCard() }
            }
        }
        .gesture(swipeGesture)
        .offset(x: dragOffset)
        .onChange(of: currentStoryIdx) {
            clampIndices()
            viewModel.markViewed(currentStory.id)
        }
        .onAppear {
            clampIndices()
            viewModel.markViewed(currentStory.id)
        }
        .statusBarHidden()
    }

    // MARK: - Clamp

    private func clampIndices() {
        let storyCount = viewModel.stories.count
        if currentStoryIdx >= storyCount {
            currentStoryIdx = max(storyCount - 1, 0)
        }
        currentCardIdx = 0
    }

    // MARK: - Top Bar (progress + close)

    private var topBar: some View {
        VStack(spacing: 12) {
            // Progress segments
            HStack(spacing: 3) {
                let cardCount = currentStory.cards.count
                if cardCount > 0 {
                    ForEach(0..<cardCount, id: \.self) { idx in
                        Capsule()
                            .fill(idx <= safeCardIdx ? Color.white : Color.white.opacity(0.3))
                            .frame(height: 3)
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)

            // Contact info + close
            HStack(spacing: 10) {
                ZStack {
                    Circle()
                        .fill(currentStory.avatarColor)
                        .frame(width: 32, height: 32)
                    Text(currentStory.contactInitials)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundStyle(.white)
                }

                Text(currentStory.contactName)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.black.opacity(0.8))

                Spacer()

                Button { dismiss() } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundStyle(.black.opacity(0.6))
                        .frame(width: 32, height: 32)
                        .background(.ultraThinMaterial, in: Circle())
                }
            }
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Card Content

    private var cardContent: some View {
        VStack(alignment: .leading, spacing: 32) {
            Text(currentCard.title)
                .font(.system(size: 28, weight: .bold, design: .default))
                .foregroundStyle(.black.opacity(0.85))
                .multilineTextAlignment(.leading)

            VStack(alignment: .leading, spacing: 20) {
                ForEach(Array(currentCard.items.enumerated()), id: \.offset) { idx, item in
                    HStack(alignment: .top, spacing: 14) {
                        ZStack {
                            Circle()
                                .fill(.black.opacity(0.7))
                                .frame(width: 32, height: 32)
                            Text("\(idx + 1)")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundStyle(.white)
                        }

                        Text(item)
                            .font(.system(size: 20, weight: .semibold))
                            .foregroundStyle(.black.opacity(0.85))
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
        }
        .padding(.horizontal, 24)
    }

    // MARK: - Bottom Bar (actions)

    private var bottomBar: some View {
        HStack {
            Button {} label: {
                VStack(spacing: 4) {
                    Image(systemName: "face.smiling")
                        .font(.system(size: 24))
                    Text("Rate")
                        .font(.system(size: 11, weight: .medium))
                }
                .foregroundStyle(.black.opacity(0.5))
            }

            Spacer()

            HStack(spacing: 12) {
                shareButton(icon: "camera.fill", label: "IG")
                shareButton(icon: "person.crop.circle", label: "Share to")
            }
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 40)
    }

    private func shareButton(icon: String, label: String) -> some View {
        Button {} label: {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 20, weight: .medium))
                    .frame(width: 44, height: 44)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                Text(label)
                    .font(.system(size: 10, weight: .medium))
            }
            .foregroundStyle(.black.opacity(0.6))
        }
    }

    // MARK: - Navigation

    private func nextCard() {
        let maxIdx = currentStory.cards.count - 1
        guard maxIdx >= 0 else { nextStory(); return }

        if currentCardIdx < maxIdx {
            withAnimation(.easeInOut(duration: 0.2)) {
                currentCardIdx += 1
            }
        } else {
            nextStory()
        }
    }

    private func prevCard() {
        if currentCardIdx > 0 {
            withAnimation(.easeInOut(duration: 0.2)) {
                currentCardIdx -= 1
            }
        } else {
            prevStory()
        }
    }

    private func nextStory() {
        if currentStoryIdx < viewModel.stories.count - 1 {
            withAnimation(.easeInOut(duration: 0.25)) {
                currentStoryIdx += 1
                currentCardIdx = 0
            }
        } else {
            dismiss()
        }
    }

    private func prevStory() {
        if currentStoryIdx > 0 {
            withAnimation(.easeInOut(duration: 0.25)) {
                currentStoryIdx -= 1
                currentCardIdx = 0
            }
        }
    }

    // MARK: - Swipe Gesture (between stories)

    private var swipeGesture: some Gesture {
        DragGesture(minimumDistance: 40)
            .onChanged { value in
                dragOffset = value.translation.width * 0.4
            }
            .onEnded { value in
                let threshold: CGFloat = 80
                if value.translation.width < -threshold {
                    nextStory()
                } else if value.translation.width > threshold {
                    prevStory()
                }
                withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                    dragOffset = 0
                }
            }
    }
}
