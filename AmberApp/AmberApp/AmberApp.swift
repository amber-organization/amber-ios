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
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var selectedTab = 1 // Start on Network (center)
    @State private var searchText = ""
    @State private var networkInputText = ""
    @FocusState private var isNetworkInputFocused: Bool

    var body: some View {
        ZStack {
            Group {
                if selectedTab == 0 {
                    ConnectionsView(searchText: .constant(""))
                } else if selectedTab == 1 {
                    SuggestionFeedView()
                } else {
                    AmberIDView()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            VStack {
                Spacer()
                CustomTabBar(selectedTab: $selectedTab, searchText: .constant(""))
            }
            .ignoresSafeArea(.keyboard)
        }
    }
}
