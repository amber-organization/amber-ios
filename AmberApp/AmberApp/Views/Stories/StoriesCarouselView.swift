//
//  StoriesCarouselView.swift
//  AmberApp
//
//  Horizontal scrollable row of story circles with gradient rings.
//

import SwiftUI

struct StoriesCarouselView: View {
    @ObservedObject var viewModel: StoryViewModel

    private let ringGradient = AngularGradient(
        colors: [
            Color(hex: "FF6B35"), Color(hex: "FF3CAC"),
            Color(hex: "E8832A"), Color(hex: "FFB347"),
            Color(hex: "FF6B35"),
        ],
        center: .center
    )

    private let viewedRing = AngularGradient(
        colors: [Color.amberTertiaryText, Color.amberTertiaryText],
        center: .center
    )

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 14) {
                ForEach(Array(viewModel.stories.enumerated()), id: \.element.id) { index, story in
                    storyCircle(story: story, index: index)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
        }
    }

    // MARK: - Single Circle

    private func storyCircle(story: StoryItem, index: Int) -> some View {
        Button {
            viewModel.openStory(at: index)
        } label: {
            VStack(spacing: 6) {
                ZStack {
                    // Gradient ring
                    Circle()
                        .stroke(
                            story.isViewed ? viewedRing : ringGradient,
                            lineWidth: 2.5
                        )
                        .frame(width: 68, height: 68)

                    // Avatar circle
                    ZStack {
                        Circle()
                            .fill(story.avatarColor)
                            .frame(width: 58, height: 58)

                        Text(story.contactInitials)
                            .font(.system(size: 20, weight: .semibold))
                            .foregroundStyle(.white)
                    }

                    // "+" badge for Your Story
                    if story.isYourStory {
                        ZStack {
                            Circle()
                                .fill(Color.amberWarm)
                                .frame(width: 22, height: 22)
                            Circle()
                                .strokeBorder(Color.black, lineWidth: 2)
                                .frame(width: 22, height: 22)
                            Image(systemName: "plus")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundStyle(.white)
                        }
                        .offset(x: 22, y: 22)
                    }
                }

                // Name
                Text(story.isYourStory ? "You" : story.contactName)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(Color.amberText)
                    .lineLimit(1)
                    .frame(width: 68)
            }
        }
        .buttonStyle(.plain)
    }
}
