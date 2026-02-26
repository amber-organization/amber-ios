//
//  DigestChatViewModel.swift
//  AmberApp
//

import SwiftUI
import Combine

@MainActor
class DigestChatViewModel: ObservableObject {
    @Published var messages: [DigestChatMessage] = []
    @Published var isTyping = false

    func loadInitialMessage(for digest: DailyDigest) async {
        messages = [
            DigestChatMessage(
                content: "I've analyzed your \(digest.title.lowercased()) data. \(digest.detailedInsight)\n\nWhat would you like to explore further?",
                isFromUser: false,
                timestamp: Date()
            )
        ]
    }

    func sendMessage(_ text: String, digest: DailyDigest) async {
        let userMessage = DigestChatMessage(
            content: text,
            isFromUser: true,
            timestamp: Date()
        )
        messages.append(userMessage)

        isTyping = true
        try? await Task.sleep(nanoseconds: 1_500_000_000)
        isTyping = false

        let response = generateResponse(for: text, digest: digest)
        let aiMessage = DigestChatMessage(
            content: response,
            isFromUser: false,
            timestamp: Date()
        )
        messages.append(aiMessage)
    }

    private func generateResponse(for query: String, digest: DailyDigest) -> String {
        let lowercaseQuery = query.lowercased()

        // Generate contextual responses based on health dimension
        switch digest.title {
        case "Spiritual Health":
            if lowercaseQuery.contains("improve") || lowercaseQuery.contains("help") {
                return "To improve your spiritual health, I recommend: 1) Morning meditation (start with 5 minutes), 2) Weekly reflection journal, 3) Deep conversations with close friends about values and meaning. Your recent 8% increase shows you're on the right path."
            } else if lowercaseQuery.contains("meditation") {
                return "Your meditation practice has been consistent for 3 weeks. Try expanding to guided visualizations or exploring mindfulness apps like Headspace or Calm. Consider joining a local meditation group for community support."
            }
        case "Emotional Health":
            if lowercaseQuery.contains("improve") || lowercaseQuery.contains("help") {
                return "Your emotional health is strong! To maintain it: 1) Continue regular check-ins with Sarah and Michael, 2) Keep journaling about your feelings, 3) Practice gratitude daily. You're doing great with emotional boundaries."
            } else if lowercaseQuery.contains("sarah") || lowercaseQuery.contains("michael") {
                return "Sarah and Michael are your primary emotional support network. You connect with them 3-4 times per week. These relationships provide strong emotional stability and mutual support. Consider planning a deeper activity together soon."
            }
        case "Physical Health":
            if lowercaseQuery.contains("improve") || lowercaseQuery.contains("workout") {
                return "To boost your physical health: 1) Schedule morning workouts (you're most consistent then), 2) Try a fitness class for variety, 3) Find a workout buddy for accountability. Your move goal is strong, but exercise frequency needs attention."
            }
        case "Social Health":
            if lowercaseQuery.contains("james") {
                return "You haven't connected with James in 3 weeks - your longest gap this year. He's typically responsive to voice calls. Consider reaching out today to maintain that connection. Your friendship history shows strong bonds that benefit from regular check-ins."
            }
        default:
            break
        }

        return "That's a great question about your \(digest.title.lowercased()). Based on your recent patterns, I can provide more specific insights. What aspect would you like to explore - recent trends, specific recommendations, or comparisons with your historical data?"
    }
}
