//
//  AuthViewModel.swift
//  AmberApp
//
//  Phone number (SMS) + OAuth login via Privy.
//  Every login creates an Amber ID (Solana wallet via Privy).
//

import SwiftUI
import Combine
import PrivySDK

@MainActor
class AuthViewModel: ObservableObject {
    @Published var isAuthenticated: Bool = false
    @Published var isLoading: Bool = false
    @Published var error: String?
    @Published var accessToken: String?

    // SMS OTP flow state
    @Published var isAwaitingOTP: Bool = false
    @Published var pendingPhone: String?

    private var privy: Privy?
    private var authStateTask: Task<Void, Never>?

    init() {
        #if DEBUG && targetEnvironment(simulator)
        // Skip Privy SDK entirely in simulator — devBypassLogin() handles auth
        privy = nil
        #else
        let config = PrivyConfig(
            appId: AppConfig.privyAppId,
            appClientId: AppConfig.privyAppClientId
        )
        privy = PrivySdk.initialize(config: config)
        observeAuthState()
        #endif
    }

    deinit {
        authStateTask?.cancel()
    }

    // MARK: - Dev Bypass (DEBUG only)

    private var isDevBypassed = false

    #if DEBUG
    func devBypassLogin() {
        authStateTask?.cancel()
        authStateTask = nil
        isDevBypassed = true
        accessToken = "dev-bypass-token"
        APIClient.shared.accessToken = "dev-bypass-token"
        isAuthenticated = true
        isLoading = false
        error = nil
    }
    #endif

    // MARK: - Auth State Observation

    private func observeAuthState() {
        guard let privy else { return }
        authStateTask = Task {
            for await authState in privy.authStateStream {
                guard !isDevBypassed else { return }
                switch authState {
                case .authenticated(let user):
                    do {
                        let token = try await user.getAccessToken()
                        self.accessToken = token
                        APIClient.shared.accessToken = token
                        self.isAuthenticated = true
                    } catch {
                        self.isAuthenticated = true
                    }
                    self.isLoading = false
                case .unauthenticated:
                    self.accessToken = nil
                    APIClient.shared.accessToken = nil
                    self.isAuthenticated = false
                    self.isLoading = false
                case .notReady:
                    break
                case .authenticatedUnverified:
                    self.isAuthenticated = true
                    self.isLoading = false
                @unknown default:
                    self.isLoading = false
                }
            }
        }
    }

    // MARK: - SMS OTP Login

    /// Step 1: Send OTP code via SMS to phone number
    func sendSMSCode(to phone: String) {
        guard let privy else {
            self.error = "Authentication service unavailable. Please restart the app."
            return
        }
        isLoading = true
        error = nil
        Task {
            do {
                try await privy.sms.sendCode(to: phone)
                pendingPhone = phone
                isAwaitingOTP = true
                isLoading = false
            } catch {
                self.error = friendlyError(error)
                isLoading = false
            }
        }
    }

    /// Step 2: Verify SMS OTP and complete login → creates Amber ID (Solana wallet)
    func verifySMSCode(_ code: String) {
        guard let privy, let phone = pendingPhone else { return }
        isLoading = true
        error = nil
        Task {
            do {
                let user = try await privy.sms.loginWithCode(code, sentTo: phone)
                let token = try await user.getAccessToken()
                accessToken = token
                APIClient.shared.accessToken = token
                isAuthenticated = true
                isAwaitingOTP = false
                pendingPhone = nil
                isLoading = false
            } catch {
                self.error = friendlyError(error)
                isLoading = false
            }
        }
    }

    // MARK: - OAuth Login (Google, Apple)

    func loginWithGoogle() {
        guard let privy else {
            self.error = "Authentication service unavailable. Please restart the app."
            return
        }
        isLoading = true
        error = nil
        Task {
            do {
                let user = try await privy.oAuth.login(with: .google)
                let token = try await user.getAccessToken()
                accessToken = token
                APIClient.shared.accessToken = token
                isAuthenticated = true
                isLoading = false
            } catch {
                self.error = friendlyError(error)
                isLoading = false
            }
        }
    }

    func loginWithApple() {
        guard let privy else {
            self.error = "Authentication service unavailable. Please restart the app."
            return
        }
        isLoading = true
        error = nil
        Task {
            do {
                let user = try await privy.oAuth.login(with: .apple)
                let token = try await user.getAccessToken()
                accessToken = token
                APIClient.shared.accessToken = token
                isAuthenticated = true
                isLoading = false
            } catch {
                self.error = friendlyError(error)
                isLoading = false
            }
        }
    }

    // MARK: - Logout

    func logout() {
        Task {
            let state = await privy?.getAuthState()
            if case .authenticated(let user) = state {
                try? await user.logout()
            }
            accessToken = nil
            APIClient.shared.accessToken = nil
            isAuthenticated = false
        }
    }

    // MARK: - Session Check

    func checkSession() {
        guard let privy else {
            isAuthenticated = false
            isLoading = false
            return
        }
        Task {
            let state = await privy.getAuthState()
            switch state {
            case .authenticated(let user):
                do {
                    let token = try await user.getAccessToken()
                    accessToken = token
                    APIClient.shared.accessToken = token
                    isAuthenticated = true
                } catch {
                    isAuthenticated = false
                }
                isLoading = false
            case .unauthenticated:
                isAuthenticated = false
                isLoading = false
            case .notReady:
                try? await Task.sleep(for: .seconds(2))
                if isLoading {
                    isAuthenticated = false
                    isLoading = false
                }
            case .authenticatedUnverified:
                isAuthenticated = true
                isLoading = false
            @unknown default:
                isAuthenticated = false
                isLoading = false
            }
        }
    }

    // MARK: - Helpers

    private func friendlyError(_ error: Error) -> String {
        let msg = error.localizedDescription
        if msg.contains("invalid_native_app_id") {
            return "App not registered with auth provider. Use \"Skip Login\" below to continue in dev mode."
        }
        if msg.lowercased().contains("cancel") {
            return ""
        }
        return msg
    }
}

// MARK: - App Configuration

enum AppConfig {
    static let privyAppId = "cmisgt8wr00enjj0dkasj2xsz"
    static let privyAppClientId = "client-WY6TPkpcdSAbJ5eBEM3jw6rkpaR2KycrefbJehufX6yXX"
    static let urlScheme = "amberapp"

    // Backend — no localhost calls in simulator; only real device hits the API
    #if DEBUG && targetEnvironment(simulator)
    static let apiBaseURL: String? = nil  // No backend calls in simulator
    #elseif DEBUG
    static let apiBaseURL: String? = "http://localhost:8080"
    #else
    static let apiBaseURL: String? = "https://amber-app-service-HASH.a.run.app" // TODO: Replace with Cloud Run URL
    #endif
}
