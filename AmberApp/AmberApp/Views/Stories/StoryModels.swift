//
//  StoryModels.swift
//  AmberApp
//
//  Data models for Instagram-style stories carousel.
//

import SwiftUI

// MARK: - Models

struct StorySlide: Identifiable {
    let id = UUID()
    let title: String
    let items: [String]
    let gradientColors: [Color]
}

struct StoryItem: Identifiable {
    let id = UUID()
    let contactName: String
    let contactInitials: String
    let avatarColor: Color
    let isViewed: Bool
    let isYourStory: Bool
    let cards: [StorySlide]
}

// MARK: - Fallbacks

extension StorySlide {
    static let fallback = StorySlide(title: "", items: [], gradientColors: [.amberSurface, .amberCard])
}

extension StoryItem {
    static let fallback = StoryItem(
        contactName: "", contactInitials: "?", avatarColor: .amberSurface,
        isViewed: true, isYourStory: false, cards: [.fallback]
    )
}

// MARK: - Sample Data

extension StoryItem {
    static let samples: [StoryItem] = [
        // "Your Story" is always first
        StoryItem(
            contactName: "Your Story",
            contactInitials: "You",
            avatarColor: .amberWarm,
            isViewed: false,
            isYourStory: true,
            cards: [
                StorySlide(
                    title: "Your day at a glance",
                    items: ["3 meetings scheduled", "Angela's birthday tomorrow", "7-day streak with Mom", "New connection: Victor"],
                    gradientColors: [Color(hex: "1C1C1E"), Color(hex: "2C2C2E"), Color(hex: "1C1C1E")]
                ),
            ]
        ),
        StoryItem(
            contactName: "Angela",
            contactInitials: "AC",
            avatarColor: .healthEmotional,
            isViewed: false,
            isYourStory: false,
            cards: [
                StorySlide(
                    title: "Secretly wishing for",
                    items: ["Your hot friend wanting to be more than friends", "The person of your dreams falling into your lap", "A baby", "Being stopped on the street by a street style blogger"],
                    gradientColors: [Color(hex: "FF6B35"), Color(hex: "FF8C61"), Color(hex: "FFB347")]
                ),
                StorySlide(
                    title: "You hate talking about",
                    items: ["Other people boasting about their achievements", "Your wins", "\"Chick-lit\""],
                    gradientColors: [Color(hex: "F5DEB3"), Color(hex: "FF8C61"), Color(hex: "FFB6C1")]
                ),
            ]
        ),
        StoryItem(
            contactName: "Kaitlyn",
            contactInitials: "KR",
            avatarColor: .healthSocial,
            isViewed: false,
            isYourStory: false,
            cards: [
                StorySlide(
                    title: "Things you'd never admit",
                    items: ["You google yourself sometimes", "You rehearse arguments in the shower", "You've pretended to be on a call to avoid someone"],
                    gradientColors: [Color(hex: "A668C4"), Color(hex: "C490D1"), Color(hex: "E8B4F0")]
                ),
                StorySlide(
                    title: "Your toxic trait is",
                    items: ["Starting 5 books and finishing none", "Saying \"I'm fine\" when you're absolutely not", "Double-texting after 30 seconds"],
                    gradientColors: [Color(hex: "FF6B6B"), Color(hex: "FF8E8E"), Color(hex: "FFA8A8")]
                ),
            ]
        ),
        StoryItem(
            contactName: "Victor",
            contactInitials: "VH",
            avatarColor: .healthIntellectual,
            isViewed: true,
            isYourStory: false,
            cards: [
                StorySlide(
                    title: "Your hidden talents",
                    items: ["Parallel parking in one try", "Reading a room instantly", "Making anyone laugh in under 60 seconds", "Remembering everyone's coffee order"],
                    gradientColors: [Color(hex: "4ECDC4"), Color(hex: "44B09E"), Color(hex: "2C8C7C")]
                ),
            ]
        ),
        StoryItem(
            contactName: "Rohan",
            contactInitials: "RM",
            avatarColor: .amberGold,
            isViewed: true,
            isYourStory: false,
            cards: [
                StorySlide(
                    title: "In another life you'd be",
                    items: ["A Formula 1 driver", "A jazz pianist in a smoky bar", "A National Geographic photographer"],
                    gradientColors: [Color(hex: "F4D03F"), Color(hex: "F0A500"), Color(hex: "D4A542")]
                ),
                StorySlide(
                    title: "Your love language is",
                    items: ["Acts of service disguised as jokes", "Sending memes at 2am", "Remembering the small things", "Planning surprise adventures"],
                    gradientColors: [Color(hex: "FF9A9E"), Color(hex: "FAD0C4"), Color(hex: "FFD1DC")]
                ),
            ]
        ),
        StoryItem(
            contactName: "Dev",
            contactInitials: "DK",
            avatarColor: .healthPhysical,
            isViewed: false,
            isYourStory: false,
            cards: [
                StorySlide(
                    title: "Things that live rent-free in your head",
                    items: ["That one compliment from 2019", "The comeback you thought of 3 hours too late", "A song lyric you misheard for years", "That awkward wave at someone who wasn't waving at you"],
                    gradientColors: [Color(hex: "667eea"), Color(hex: "764ba2"), Color(hex: "6B73FF")]
                ),
            ]
        ),
        StoryItem(
            contactName: "Priya",
            contactInitials: "PS",
            avatarColor: .healthFinancial,
            isViewed: false,
            isYourStory: false,
            cards: [
                StorySlide(
                    title: "You pretend not to care about",
                    items: ["How many likes your post got", "Whether they texted back yet", "What people think of your music taste"],
                    gradientColors: [Color(hex: "3DB8A0"), Color(hex: "56C5B0"), Color(hex: "7EDBC4")]
                ),
            ]
        ),
        StoryItem(
            contactName: "Mom",
            contactInitials: "CT",
            avatarColor: .healthSpiritual,
            isViewed: true,
            isYourStory: false,
            cards: [
                StorySlide(
                    title: "What makes you feel loved",
                    items: ["A home-cooked meal waiting for you", "Someone remembering your story from weeks ago", "A tight hug without saying anything", "Being included without having to ask"],
                    gradientColors: [Color(hex: "E8832A"), Color(hex: "FFB347"), Color(hex: "FFF1DB")]
                ),
            ]
        ),
    ]
}
