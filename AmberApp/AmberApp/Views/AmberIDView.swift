//
//  AmberIDView.swift
//  Amber
//
//  Created on 2026-01-17.
//

import SwiftUI

struct AmberIDView: View {
    @StateObject private var viewModel = AmberIDViewModel()
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var journalText = ""
    @State private var showShareSheet = false

    var body: some View {
        NavigationStack {
            ZStack {
                Color.amberBackground.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 24) {
                        headerSection
                        healthTrackingSection
                        personalDetailsSection
                        dailyDigestSection
                        personalityTestsSection
                        connectedAppsSection
                        signOutSection
                    }
                    .padding(.vertical)
                    .padding(.bottom, 120)
                }
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.large)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showShareSheet = true
                    } label: {
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundColor(.amberBlue)
                    }
                }
            }
            .sheet(isPresented: $showShareSheet) {
                ShareSheet(userName: viewModel.user.name)
                    .presentationDetents([.medium])
                    .presentationDragIndicator(.hidden)
            }
            .overlay {
                if viewModel.isProfileLoading {
                    ZStack {
                        Color.black.opacity(0.3)
                            .ignoresSafeArea()
                        ProgressView()
                            .tint(.amberBlue)
                            .scaleEffect(1.2)
                    }
                }
            }
        }
    }

    // MARK: - Header Section

    private var headerSection: some View {
        VStack(spacing: 14) {
            // Avatar with gradient ring
            ZStack {
                Circle()
                    .stroke(
                        LinearGradient(
                            colors: [.amberBlue, .amberGold],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 3
                    )
                    .frame(width: 106, height: 106)

                ContactAvatar(
                    name: viewModel.user.name,
                    imageURL: viewModel.user.avatarURL,
                    size: 100
                )
            }

            Text(viewModel.user.name)
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.white)

            Text("@\(viewModel.username)")
                .font(.system(size: 15))
                .foregroundColor(.white.opacity(0.5))

            if !viewModel.currentCity.isEmpty {
                HStack(spacing: 4) {
                    Image(systemName: "location.fill")
                        .font(.system(size: 11))
                    Text(viewModel.currentCity)
                        .font(.system(size: 13))
                }
                .foregroundColor(.white.opacity(0.4))
            }
        }
        .padding(.top, 8)
    }

    // MARK: - Health Tracking Section

    private var healthTrackingSection: some View {
        VStack(spacing: 0) {
            // Quick Stats
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    QuickStatPill(icon: "person.2.fill", text: "42 Contacts")
                    QuickStatPill(icon: "calendar", text: "6 Events")
                    if let sun = viewModel.user.zodiacSun {
                        QuickStatPill(icon: nil, text: "\(sun.symbol) \(sun.rawValue)")
                    }
                    if !viewModel.privacyTier.isEmpty {
                        QuickStatPill(icon: "shield.fill", text: viewModel.privacyTier.replacingOccurrences(of: "_", with: " ").capitalized)
                    }
                }
                .padding(.horizontal, 16)
            }
            .padding(.bottom, 24)

            // Health bars
            GlassCard(cornerRadius: 16, borderOpacity: 0.06) {
                VStack(spacing: 14) {
                    Text("Today's Activity")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.white.opacity(0.4))
                        .frame(maxWidth: .infinity, alignment: .leading)

                    PremiumHealthBar(icon: "flame.fill", label: "Move", progress: viewModel.moveProgress, color: .red, valueText: "\(Int(viewModel.moveProgress * 100))%")
                    PremiumHealthBar(icon: "figure.run", label: "Exercise", progress: viewModel.exerciseProgress, color: .green, valueText: "\(Int(viewModel.exerciseProgress * 100))%")
                    PremiumHealthBar(icon: "figure.stand", label: "Stand", progress: viewModel.standProgress, color: .blue, valueText: "\(Int(viewModel.standProgress * 100))%")
                    PremiumHealthBar(icon: "moon.fill", label: "Sleep", progress: min(viewModel.sleepHours / 8.0, 1.0), color: .indigo, valueText: "\(viewModel.sleepHours, specifier: "%.1f")h")
                    PremiumHealthBar(icon: "iphone", label: "Screen Time", progress: min(viewModel.screenTimeHours / 8.0, 1.0), color: viewModel.screenTimeHours > 4 ? .orange : .green, valueText: "\(viewModel.screenTimeHours, specifier: "%.1f")h")
                }
                .padding(16)
            }
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Personal Details Section

    private var personalDetailsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Personal Details")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.white.opacity(0.5))
                .padding(.horizontal, 20)

            GlassCard(cornerRadius: 16, borderOpacity: 0.06) {
                VStack(spacing: 0) {
                    if let birthday = viewModel.user.birthday {
                        GlassDetailRow(
                            label: "Birthday",
                            value: birthday.formatted(date: .abbreviated, time: .omitted)
                        )
                        Divider().overlay(Color.white.opacity(0.06)).padding(.leading, 16)
                    }

                    if let sun = viewModel.user.zodiacSun {
                        GlassDetailRow(label: "Sun Sign", value: "\(sun.symbol) \(sun.rawValue)")
                        Divider().overlay(Color.white.opacity(0.06)).padding(.leading, 16)
                    }

                    if let moon = viewModel.user.zodiacMoon {
                        GlassDetailRow(label: "Moon Sign", value: "\(moon.symbol) \(moon.rawValue)")
                        Divider().overlay(Color.white.opacity(0.06)).padding(.leading, 16)
                    }

                    if let rising = viewModel.user.zodiacRising {
                        GlassDetailRow(label: "Rising Sign", value: "\(rising.symbol) \(rising.rawValue)")
                        Divider().overlay(Color.white.opacity(0.06)).padding(.leading, 16)
                    }

                    if let mbti = viewModel.user.myersBriggs {
                        GlassDetailRow(label: "Myers-Briggs", value: mbti.rawValue)
                        Divider().overlay(Color.white.opacity(0.06)).padding(.leading, 16)
                    }

                    if let enneagram = viewModel.user.enneagram {
                        GlassDetailRow(label: "Enneagram", value: enneagram.rawValue)
                        Divider().overlay(Color.white.opacity(0.06)).padding(.leading, 16)
                    }

                    if let phase = viewModel.user.currentCyclePhase {
                        GlassDetailRow(label: "Cycle Phase", value: "\(phase.emoji) \(phase.rawValue)")
                        Divider().overlay(Color.white.opacity(0.06)).padding(.leading, 16)
                    }

                    if let startDate = viewModel.user.cycleStartDate {
                        GlassDetailRow(
                            label: "Cycle Day",
                            value: "Day \(Calendar.current.dateComponents([.day], from: startDate, to: Date()).day ?? 0 + 1)"
                        )
                    }
                }
            }
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Daily Digest Section

    private var dailyDigestSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Daily Digest")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.white.opacity(0.5))
                Spacer()
                Button {} label: {
                    HStack(spacing: 4) {
                        Text("More")
                            .font(.system(size: 14))
                        Image(systemName: "arrow.right")
                            .font(.system(size: 12))
                    }
                    .foregroundColor(.amberBlue)
                }
            }
            .padding(.horizontal, 20)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(viewModel.dailyDigests) { digest in
                        StoryCard(digest: digest)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }

    // MARK: - Personality Tests Section

    private var personalityTestsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Enhance Your Profile")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.white.opacity(0.5))
                .padding(.horizontal, 20)

            VStack(spacing: 12) {
                DailyTestCard()
                    .padding(.horizontal, 16)

                LazyVGrid(columns: [
                    GridItem(.flexible(), spacing: 12),
                    GridItem(.flexible(), spacing: 12)
                ], spacing: 12) {
                    PersonalityTestCard(title: "Big Five", icon: "chart.bar.fill", color: .blue, isCompleted: false)
                    PersonalityTestCard(title: "Myers-Briggs", icon: "person.fill", color: .purple, isCompleted: viewModel.user.myersBriggs != nil)
                    PersonalityTestCard(title: "Enneagram", icon: "circle.grid.3x3.fill", color: .green, isCompleted: viewModel.user.enneagram != nil)
                    PersonalityTestCard(title: "Love Language", icon: "heart.fill", color: .pink, isCompleted: false)
                    PersonalityTestCard(title: "Attachment Style", icon: "link.circle.fill", color: .orange, isCompleted: false)
                    PersonalityTestCard(title: "Zodiac Signs", icon: "sparkles", color: .indigo, isCompleted: viewModel.user.zodiacSun != nil && viewModel.user.zodiacMoon != nil && viewModel.user.zodiacRising != nil)
                }
                .padding(.horizontal, 16)
            }
        }
    }

    // MARK: - Connected Apps Section

    private var connectedAppsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Connected Apps & Permissions")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.white.opacity(0.5))
                .padding(.horizontal, 20)

            VStack(spacing: 10) {
                DataSourceRow(icon: "apple.logo", title: "Apple Contacts", subtitle: "Access to your contacts", isConnected: $viewModel.appleContactsConnected, color: .gray)
                DataSourceRow(icon: "heart.fill", title: "Apple Health", subtitle: "Activity, sleep, and health data", isConnected: $viewModel.appleHealthConnected, color: .pink)
                DataSourceRow(icon: "location.fill", title: "Location Services", subtitle: "Background location tracking", isConnected: $viewModel.locationServicesConnected, color: .blue)
                DataSourceRow(icon: "app.connected.to.app.below.fill", title: "Activity from Other Apps", subtitle: "Cross-app activity tracking", isConnected: $viewModel.activityTrackingConnected, color: .purple)
                DataSourceRow(icon: "calendar", title: "Google Calendar", subtitle: "Events and scheduling", isConnected: $viewModel.googleCalendarConnected, color: .red)
                DataSourceRow(icon: "envelope.fill", title: "Gmail", subtitle: "Email communications", isConnected: $viewModel.gmailConnected, color: .red)
                DataSourceRow(icon: "camera.fill", title: "Instagram", subtitle: "Posts, stories, and messages", isConnected: $viewModel.instagramConnected, color: .pink)
                DataSourceRow(icon: "person.3.fill", title: "Facebook", subtitle: "Social graph and activity", isConnected: $viewModel.facebookConnected, color: .blue)
                DataSourceRow(icon: "music.note", title: "TikTok", subtitle: "Videos and interactions", isConnected: $viewModel.tiktokConnected, color: .black)
                DataSourceRow(icon: "briefcase.fill", title: "LinkedIn", subtitle: "Professional network", isConnected: $viewModel.linkedInConnected, color: .blue)
                DataSourceRow(icon: "bird.fill", title: "X (Twitter)", subtitle: "Tweets and social activity", isConnected: $viewModel.xConnected, color: .black)
                DataSourceRow(icon: "newspaper.fill", title: "Substack", subtitle: "Reading and subscriptions", isConnected: $viewModel.substackConnected, color: .orange)
                DataSourceRow(icon: "sparkles", title: "Claude", subtitle: "AI conversations", isConnected: $viewModel.claudeConnected, color: .orange)
                DataSourceRow(icon: "bubble.left.and.bubble.right.fill", title: "ChatGPT", subtitle: "AI interactions", isConnected: $viewModel.chatGPTConnected, color: .green)
            }
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Sign Out Section

    private var signOutSection: some View {
        Button(action: {
            UserDefaults.standard.set(false, forKey: "hasCompletedOnboarding")
            authViewModel.logout()
        }) {
            Text("Sign Out")
                .font(.system(size: 16))
                .foregroundColor(.red.opacity(0.8))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
        }
        .padding(.horizontal, 16)
    }
}

// MARK: - Quick Stat Pill

private struct QuickStatPill: View {
    let icon: String?
    let text: String

    var body: some View {
        HStack(spacing: 5) {
            if let icon {
                Image(systemName: icon)
                    .font(.system(size: 11))
            }
            Text(text)
                .font(.system(size: 12, weight: .medium))
        }
        .foregroundColor(.white.opacity(0.7))
        .padding(.horizontal, 12)
        .padding(.vertical, 7)
        .background(.ultraThinMaterial)
        .clipShape(Capsule())
        .overlay(
            Capsule()
                .strokeBorder(.white.opacity(0.08), lineWidth: 0.5)
        )
    }
}

// MARK: - Premium Health Bar

private struct PremiumHealthBar: View {
    let icon: String
    let label: String
    let progress: Double
    let color: Color
    let valueText: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundColor(color)
                .frame(width: 22)

            VStack(alignment: .leading, spacing: 5) {
                HStack {
                    Text(label)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white)
                    Spacer()
                    Text(valueText)
                        .font(.system(size: 13))
                        .foregroundColor(.white.opacity(0.5))
                }

                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Color.white.opacity(0.08))
                            .frame(height: 3)

                        RoundedRectangle(cornerRadius: 2)
                            .fill(color.gradient)
                            .frame(width: geometry.size.width * CGFloat(progress), height: 3)
                            .shadow(color: color.opacity(0.6), radius: 4, x: 0, y: 0)
                    }
                }
                .frame(height: 3)
            }
        }
    }
}

// MARK: - Glass Detail Row

private struct GlassDetailRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: 15))
                .foregroundColor(.white.opacity(0.6))
            Spacer()
            Text(value)
                .font(.system(size: 15))
                .foregroundColor(.white)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}
