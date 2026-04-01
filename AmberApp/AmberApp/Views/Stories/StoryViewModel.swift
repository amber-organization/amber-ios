//
//  StoryViewModel.swift
//  AmberApp
//
//  Manages stories state — viewing, marking as read.
//

import SwiftUI
import Combine

@MainActor
final class StoryViewModel: ObservableObject {
    @Published var stories: [StoryItem] = StoryItem.samples
    @Published var selectedStoryIndex: Int? = nil
    @Published var isShowingStory = false

    func openStory(at index: Int) {
        // Skip "Your Story" for now (index 0) — just mark it
        selectedStoryIndex = index
        isShowingStory = true
    }

    func markViewed(_ storyId: UUID) {
        if let idx = stories.firstIndex(where: { $0.id == storyId }) {
            let old = stories[idx]
            stories[idx] = StoryItem(
                contactName: old.contactName,
                contactInitials: old.contactInitials,
                avatarColor: old.avatarColor,
                isViewed: true,
                isYourStory: old.isYourStory,
                cards: old.cards
            )
        }
    }

    func closeStory() {
        isShowingStory = false
        selectedStoryIndex = nil
    }
}
