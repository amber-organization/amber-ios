//
//  AmberApp.swift
//  AmberApp
//
//  Created on 2026-01-17.
//

import SwiftUI
import SwiftData

@main
struct AmberApp: App {
    @StateObject var authViewModel = AuthViewModel()
    @AppStorage("hasCompletedOnboarding") var hasCompletedOnboarding = false

    var body: some Scene {
        WindowGroup {
            Group {
                if authViewModel.isLoading {
                    // Splash / session check
                    ZStack {
                        Color.amberBackground.ignoresSafeArea()
                        ProgressView()
                            .tint(.amberBlue)
                    }
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
                authViewModel.checkSession()
            }
            .modelContainer(for: [AmberCircle.self, Contact.self, Signal.self, UserProfile.self])
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var selectedTab = 0

    var body: some View {
        ZStack {
            Color.amberBackground.ignoresSafeArea()

            // Content views
            Group {
                switch selectedTab {
                case 0:
                    ContactsTabView()
                case 1:
                    MessagesTabView()
                case 2:
                    SearchAITabView()
                case 3:
                    AmberIDView()
                default:
                    ContactsTabView()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            // Floating tab bar
            VStack {
                Spacer()
                FloatingTabBar(selectedTab: $selectedTab)
            }
            .ignoresSafeArea(.keyboard)
        }
        .preferredColorScheme(.dark)
    }
}
