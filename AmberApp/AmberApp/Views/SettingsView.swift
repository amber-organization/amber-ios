//
//  SettingsView.swift
//  AmberApp
//
//  Created on 2026-04-01.
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss
    @AppStorage("hasCompletedOnboarding") var hasCompletedOnboarding = false

    var body: some View {
        NavigationStack {
            List {
                Section("Account") {
                    HStack {
                        Label("Privacy Tier", systemImage: "lock.shield")
                        Spacer()
                        Text("Selective Cloud")
                            .foregroundStyle(.secondary)
                    }

                    Label("Notifications", systemImage: "bell.badge")

                    Label("Data & Storage", systemImage: "internaldrive")
                }

                Section("Support") {
                    Label("Help Center", systemImage: "questionmark.circle")
                    Label("Send Feedback", systemImage: "envelope")
                    Label("About Amber", systemImage: "info.circle")
                }

                Section {
                    Button {
                        hasCompletedOnboarding = false
                        authViewModel.logout()
                        dismiss()
                    } label: {
                        Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                            .foregroundStyle(.red)
                    }
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(Color.amberWarm)
                }
            }
        }
        .preferredColorScheme(.dark)
    }
}

#Preview {
    SettingsView()
        .environmentObject(AuthViewModel())
}
