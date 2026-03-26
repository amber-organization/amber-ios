//
//  AmberApp.swift
//  AmberApp
//
//  Created on 2026-01-17.
//

import SwiftUI

@main
struct AmberApp: App {
    @StateObject var authViewModel = AuthViewModel()
    @AppStorage("hasCompletedOnboarding") var hasCompletedOnboarding = false

    var body: some Scene {
        WindowGroup {
            Group {
                if authViewModel.isLoading {
                    SplashView()
                } else if !authViewModel.isAuthenticated {
                    LoginView()
                        .environmentObject(authViewModel)
                } else if !hasCompletedOnboarding {
                    OnboardingContainerView {
                        withAnimation(.spring(response: 0.5, dampingFraction: 0.85)) {
                            hasCompletedOnboarding = true
                        }
                    }
                    .environmentObject(authViewModel)
                } else {
                    ContentView()
                        .environmentObject(authViewModel)
                }
            }
            .onAppear {
                #if DEBUG && targetEnvironment(simulator)
                authViewModel.devBypassLogin()
                #else
                authViewModel.checkSession()
                #endif
            }
        }
    }
}

// MARK: - Splash

struct SplashView: View {
    @State private var glowPulse = false

    var body: some View {
        ZStack {
            Color.amberBackground.ignoresSafeArea()

            VStack(spacing: 20) {
                ZStack {
                    // Glow
                    Circle()
                        .fill(Color.amberWarm.opacity(0.2))
                        .frame(width: 100, height: 100)
                        .blur(radius: 30)
                        .scaleEffect(glowPulse ? 1.3 : 0.8)

                    Image("AmberLogo")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 72, height: 72)
                }

                ProgressView()
                    .tint(.amberWarm)
            }
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
                glowPulse = true
            }
        }
    }
}

// MARK: - Content View (3-tab layout)

struct ContentView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var selectedTab = 1 // Start on Amber AI (center)
    @State private var showProfile = false
    @State private var networkInputText = ""
    @FocusState private var isNetworkInputFocused: Bool

    var body: some View {
        ZStack {
            Color.amberBackground.ignoresSafeArea()

            // Content
            Group {
                switch selectedTab {
                case 0:
                    MessagingView()
                case 1:
                    AmberAIView()
                case 2:
                    WrapFeedView()
                default:
                    AmberAIView()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            // Bottom bar stack
            VStack {
                Spacer()

                // Network input bar — only on Amber AI tab
                if selectedTab == 1 {
                    NetworkInputBar(inputText: $networkInputText, isInputFocused: $isNetworkInputFocused)
                        .padding(.bottom, 8)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }

                CustomTabBar(selectedTab: $selectedTab)
            }
            .ignoresSafeArea(.keyboard)
        }
        .preferredColorScheme(.dark)
        .sheet(isPresented: $showProfile) {
            NavigationStack {
                AmberIDView()
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            Button("Done") { showProfile = false }
                                .foregroundColor(.amberWarm)
                                .fontWeight(.semibold)
                        }
                    }
            }
            .presentationDragIndicator(.visible)
        }
        .environment(\.showProfile, $showProfile)
    }
}

// MARK: - Profile Environment Key

private struct ShowProfileKey: EnvironmentKey {
    static let defaultValue: Binding<Bool> = .constant(false)
}

extension EnvironmentValues {
    var showProfile: Binding<Bool> {
        get { self[ShowProfileKey.self] }
        set { self[ShowProfileKey.self] = newValue }
    }
}

// MARK: - Profile Avatar Button (reusable toolbar component)

struct ProfileAvatarButton: View {
    @Environment(\.showProfile) var showProfile

    var body: some View {
        Button {
            showProfile.wrappedValue = true
        } label: {
            ZStack {
                Circle()
                    .fill(Color.amberCard)
                    .frame(width: 34, height: 34)
                    .overlay(
                        Circle()
                            .strokeBorder(
                                LinearGradient(
                                    colors: [.amberWarm, .amberGold],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                lineWidth: 1.5
                            )
                    )

                Text("ST")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.amberText)
            }
        }
    }
}
