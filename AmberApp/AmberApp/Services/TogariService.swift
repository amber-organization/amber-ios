//
//  TogariService.swift
//  AmberApp
//
//  Togari Amber backend client — people search with Exa fallback.
//

import Foundation
import Combine

struct TogariContact: Identifiable {
    let id = UUID()
    let fullName: String
    let title: String
    let company: String
    let email: String?
    let phone: String?
    let linkedinUrl: String?
    let source: String // "togari" or "exa"
    let relevanceScore: Double
}

@MainActor
final class TogariService: ObservableObject {
    @Published var results: [TogariContact] = []
    @Published var isSearching = false
    @Published var error: String?

    private let togariBaseURL: String
    private let exaService = ExaSearchService()
    private var currentTask: Task<Void, Never>?

    init() {
        #if DEBUG
        togariBaseURL = "http://localhost:3001"
        #else
        togariBaseURL = "https://togari-amber-production.up.railway.app"
        #endif
    }

    func search(query: String) {
        currentTask?.cancel()

        guard !query.trimmingCharacters(in: .whitespaces).isEmpty else {
            results = []
            isSearching = false
            return
        }

        currentTask = Task {
            try? await Task.sleep(for: .milliseconds(500))
            guard !Task.isCancelled else { return }

            isSearching = true
            error = nil

            // Try Togari first, fallback to Exa
            do {
                let togariResults = try await queryTogari(query: query)
                guard !Task.isCancelled else { return }
                if !togariResults.isEmpty {
                    results = togariResults
                    isSearching = false
                    return
                }
            } catch {
                // Togari unavailable — fall through to Exa
            }

            // Exa fallback
            guard !Task.isCancelled else { return }
            exaService.search(query: query)

            // Wait for Exa results
            try? await Task.sleep(for: .seconds(2))
            guard !Task.isCancelled else { return }

            results = exaService.results.map { person in
                TogariContact(
                    fullName: person.name,
                    title: person.title,
                    company: "",
                    email: nil,
                    phone: nil,
                    linkedinUrl: person.profileURL,
                    source: "exa",
                    relevanceScore: 0.7
                )
            }
            isSearching = false
        }
    }

    private func queryTogari(query: String) async throws -> [TogariContact] {
        guard let url = URL(string: "\(togariBaseURL)/api/dnc/status/\(query.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? query)") else {
            return []
        }

        var request = URLRequest(url: url)
        request.timeoutInterval = 5

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }

        // Parse Togari response
        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
              let contacts = json["contacts"] as? [[String: Any]] else {
            return []
        }

        return contacts.compactMap { dict in
            guard let name = dict["fullName"] as? String ?? dict["name"] as? String else { return nil }
            return TogariContact(
                fullName: name,
                title: dict["currentTitle"] as? String ?? "",
                company: dict["currentCompany"] as? String ?? "",
                email: dict["workEmail"] as? String,
                phone: dict["phone"] as? String,
                linkedinUrl: dict["linkedinUrl"] as? String,
                source: "togari",
                relevanceScore: 0.9
            )
        }
    }

    func cancelSearch() {
        currentTask?.cancel()
        exaService.cancelSearch()
        results = []
        isSearching = false
    }
}
