//
//  ClaudeService.swift
//  AmberApp
//
//  Anthropic Claude API client for the Amber iMessage agent.
//

import Foundation
import Combine

struct ChatMessage: Identifiable, Equatable {
    let id = UUID()
    let role: ChatRole
    let content: String
    let timestamp: Date

    enum ChatRole: String {
        case user, assistant
    }
}

@MainActor
final class ClaudeService: ObservableObject {
    @Published var isResponding = false

    // TODO: Replace with secure key storage
    private let apiKey = "YOUR_ANTHROPIC_API_KEY"
    private let baseURL = "https://api.anthropic.com/v1/messages"
    private let model = "claude-sonnet-4-20250514"

    private let systemPrompt = """
    You are Amber, a warm and thoughtful personal relationship assistant. \
    You help users maintain and deepen their connections with friends, family, \
    and colleagues. You remember context about their relationships and offer \
    kind, practical suggestions for staying in touch. Keep responses concise \
    and conversational.
    """

    func sendMessage(history: [ChatMessage], userMessage: String) async throws -> String {
        isResponding = true
        defer { isResponding = false }

        guard let url = URL(string: baseURL) else {
            throw ClaudeError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")
        request.timeoutInterval = 30

        let messages = history.map { msg in
            ["role": msg.role.rawValue, "content": msg.content]
        } + [["role": "user", "content": userMessage]]

        let body: [String: Any] = [
            "model": model,
            "max_tokens": 1024,
            "system": systemPrompt,
            "messages": messages,
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            throw ClaudeError.apiError(String(data: data, encoding: .utf8) ?? "Unknown error")
        }

        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
              let content = json["content"] as? [[String: Any]],
              let text = content.first?["text"] as? String else {
            throw ClaudeError.decodingError
        }

        return text
    }
}

enum ClaudeError: LocalizedError {
    case invalidURL
    case apiError(String)
    case decodingError

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid API URL"
        case .apiError(let msg): return "Claude API error: \(msg)"
        case .decodingError: return "Failed to parse Claude response"
        }
    }
}
