//
//  AuthViewModel.swift
//  AmberApp
//

import SwiftUI
import Auth0

@MainActor
class AuthViewModel: ObservableObject {
    @Published var isAuthenticated: Bool = false
    @Published var isLoading: Bool = false
    @Published var error: String?
    @Published var accessToken: String?

    private let auth0ClientId = "ytP3na2gIO9Wpsc4cEt1klmSbPF4ZAIe"
    private let auth0Domain  = "dev-4prs757badfajpi5.us.auth0.com"
    private let audience     = "https://api.amber.app"

    private lazy var credentialsManager = CredentialsManager(
        authentication: Auth0.authentication(clientId: auth0ClientId, domain: auth0Domain)
    )

    private var webAuth: WebAuth {
        Auth0.webAuth(clientId: auth0ClientId, domain: auth0Domain)
    }

    // ── Shared credential handler ────────────────────────────────────────────

    private func handleCredentials(_ credentials: Credentials) {
        _ = credentialsManager.store(credentials: credentials)
        accessToken = credentials.accessToken
        APIClient.shared.accessToken = credentials.accessToken
        isAuthenticated = true
        isLoading = false
    }

    private func handleError(_ err: Error) {
        if case WebAuthError.userCancelled = err {
            isLoading = false
        } else {
            error = err.localizedDescription
            isLoading = false
        }
    }

    private func auth(connection: String? = nil) async throws -> Credentials {
        var builder = webAuth
            .scope("openid profile email offline_access")
            .audience(audience)

        if let connection = connection {
            builder = builder.connection(connection)
        }

        return try await builder.start()
    }

    // ── Public sign-in methods ───────────────────────────────────────────────

    /// Sign in with Google
    func loginWithGoogle() {
        startAuth(connection: "google-oauth2")
    }

    /// Sign in with Apple (via Auth0 Apple social connection)
    func loginWithApple() {
        startAuth(connection: "apple")
    }

    /// Sign in with GitHub
    func loginWithGitHub() {
        startAuth(connection: "github")
    }

    /// Sign in with LinkedIn
    func loginWithLinkedIn() {
        startAuth(connection: "linkedin")
    }

    /// Sign in with Microsoft
    func loginWithMicrosoft() {
        startAuth(connection: "windowslive")
    }

    /// Sign in with email (Auth0 Universal Login)
    func loginWithEmail() {
        startAuth(connection: nil)
    }

    private func startAuth(connection: String?) {
        isLoading = true
        error = nil
        Task {
            do {
                let credentials = try await auth(connection: connection)
                handleCredentials(credentials)
            } catch {
                handleError(error)
            }
        }
    }

    // ── Session management ───────────────────────────────────────────────────

    func logout() {
        isLoading = true
        error = nil
        Task {
            _ = try? await webAuth.clearSession()
            _ = credentialsManager.clear()
            accessToken = nil
            APIClient.shared.accessToken = nil
            isAuthenticated = false
            isLoading = false
        }
    }

    func checkSession() {
        guard credentialsManager.canRenew() else {
            isAuthenticated = false
            return
        }
        isLoading = true
        Task {
            do {
                let credentials = try await credentialsManager.credentials()
                handleCredentials(credentials)
            } catch {
                _ = credentialsManager.clear()
                isAuthenticated = false
                isLoading = false
            }
        }
    }
}
