//
//  ProfileView.swift
//  AmberApp
//
//  Instagram-style profile: photos grid | tasks | health & personality.
//

import SwiftUI
import Photos

// MARK: - Profile Tab

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var viewModel = AmberIDViewModel()
    @StateObject private var photosService = PhotosService()
    @State private var selectedTab: ProfileContentTab = .photos
    @State private var showSettings = false
    @State private var todos: [TodoItem] = TodoItem.samples
    @Namespace private var tabNamespace

    var body: some View {
        NavigationStack {
            ScrollView(.vertical, showsIndicators: false) {
                VStack(spacing: 0) {
                    headerSection
                    contentTabSelector
                    contentBody
                }
                .padding(.bottom, 120)
            }
            .background(Color.black.ignoresSafeArea())
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text(viewModel.username.isEmpty ? viewModel.user.name.lowercased().replacingOccurrences(of: " ", with: "") : viewModel.username)
                        .font(.amberHeadline)
                        .foregroundStyle(Color.amberText)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showSettings = true }) {
                        Image(systemName: "gearshape")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundStyle(Color.amberText)
                    }
                }
            }
        }
        .preferredColorScheme(.dark)
        .sheet(isPresented: $showSettings) {
            SettingsView()
                .environmentObject(authViewModel)
        }
        .task {
            let granted = await photosService.requestAccess()
            if granted { await photosService.fetchRecentPhotos() }
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(.regularMaterial)
                    .frame(width: 80, height: 80)
                    .overlay(Circle().strokeBorder(Color.glassStroke, lineWidth: 1))
                Text(viewModel.user.name.split(separator: " ").map { String($0.prefix(1)) }.joined())
                    .font(.amberTitle2)
                    .foregroundStyle(Color.amberText)
            }

            VStack(spacing: 4) {
                Text(viewModel.user.name)
                    .font(.amberHeadline)
                    .foregroundStyle(Color.amberText)
                Text("Building the future of relationships!")
                    .font(.amberCaption)
                    .foregroundStyle(Color.amberSecondaryText)
            }

            HStack(spacing: 0) {
                profileStat(value: "\(photosService.recentImages.count)", label: "Photos")
                profileStat(value: "12", label: "Circles")
                profileStat(value: "4", label: "Groups")
            }
            .padding(.top, 4)

            Button(action: {}) {
                Text("Edit Profile")
                    .font(.amberBody)
                    .foregroundStyle(Color.amberText)
                    .frame(maxWidth: .infinity)
                    .frame(height: 36)
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
            .padding(.horizontal, 16)
            .padding(.top, 4)
        }
        .padding(.top, 16)
    }

    private func profileStat(value: String, label: String) -> some View {
        VStack(spacing: 2) {
            Text(value).font(.amberTitle3).foregroundStyle(Color.amberText)
            Text(label).font(.amberCaption).foregroundStyle(Color.amberSecondaryText)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Tab Selector

    private var contentTabSelector: some View {
        HStack(spacing: 0) {
            ForEach(ProfileContentTab.allCases) { tab in
                Button {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) { selectedTab = tab }
                } label: {
                    VStack(spacing: 10) {
                        Image(systemName: tab.icon)
                            .font(.system(size: 20, weight: .medium))
                            .foregroundStyle(selectedTab == tab ? Color.amberText : Color.amberSecondaryText)
                            .frame(maxWidth: .infinity)
                            .frame(height: 32)

                        ZStack(alignment: .bottom) {
                            Rectangle().fill(Color.clear).frame(height: 2)
                            if selectedTab == tab {
                                Rectangle().fill(Color.amberText).frame(height: 2)
                                    .matchedGeometryEffect(id: "tab_indicator", in: tabNamespace)
                            }
                        }
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.top, 20)
    }

    // MARK: - Content Body

    @ViewBuilder
    private var contentBody: some View {
        switch selectedTab {
        case .photos: photosGrid
        case .todos: todosView
        case .about: aboutView
        }
    }

    // MARK: - Photos Grid

    private var photosGrid: some View {
        let columns = Array(repeating: GridItem(.flexible(), spacing: 2), count: 3)

        return Group {
            if photosService.isLoading {
                ProgressView("Loading photos...")
                    .tint(.amberWarm)
                    .foregroundStyle(Color.amberSecondaryText)
                    .padding(.top, 40)
            } else if photosService.recentImages.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "photo.on.rectangle.angled")
                        .font(.system(size: 40, weight: .light))
                        .foregroundStyle(Color.amberTertiaryText)
                    Text("No photos yet")
                        .font(.amberCaption)
                        .foregroundStyle(Color.amberSecondaryText)
                }
                .padding(.top, 40)
            } else {
                LazyVGrid(columns: columns, spacing: 2) {
                    ForEach(Array(photosService.recentImages.enumerated()), id: \.offset) { _, image in
                        Image(uiImage: image)
                            .resizable()
                            .scaledToFill()
                            .frame(minHeight: 120)
                            .clipped()
                    }
                }
                .padding(.top, 2)
            }
        }
    }

    // MARK: - Todos

    private var todosView: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Today's Actions")
                .font(.amberHeadline)
                .foregroundStyle(Color.amberText)
                .padding(.horizontal, 16)

            ForEach(Array(todos.enumerated()), id: \.element.id) { index, item in
                HStack(alignment: .top, spacing: 12) {
                    Button {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                            todos[index].isCompleted.toggle()
                        }
                    } label: {
                        ZStack {
                            Circle().strokeBorder(item.isCompleted ? Color.amberWarm : Color.amberSecondaryText, lineWidth: 1.5).frame(width: 22, height: 22)
                            if item.isCompleted { Circle().fill(Color.amberWarm).frame(width: 14, height: 14) }
                        }
                    }
                    .buttonStyle(.plain)
                    .padding(.top, 2)

                    VStack(alignment: .leading, spacing: 3) {
                        Text(item.title)
                            .font(.amberBody)
                            .foregroundStyle(item.isCompleted ? Color.amberSecondaryText : Color.amberText)
                            .strikethrough(item.isCompleted, color: Color.amberSecondaryText)
                        Text(item.context)
                            .font(.amberCaption)
                            .foregroundStyle(Color.amberSecondaryText)
                    }
                    Spacer()
                    if let initials = item.linkedInitials {
                        ZStack {
                            Circle().fill(Color.amberSurface).frame(width: 28, height: 28)
                            Text(initials).font(.system(size: 10, weight: .bold)).foregroundStyle(Color.amberSecondaryText)
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .amberCardStyle()
                .padding(.horizontal, 16)
            }
        }
        .padding(.top, 16)
    }

    // MARK: - About (Health, Personality, Integrations)

    private var aboutView: some View {
        VStack(spacing: 24) {
            // Health Data
            VStack(alignment: .leading, spacing: 0) {
                Text("Health")
                    .amberSectionHeader()
                    .padding(.horizontal, 16)
                    .padding(.bottom, 12)

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                    healthStat(icon: "flame.fill", value: String(format: "%.0f%%", viewModel.moveProgress * 100), label: "Move", color: .healthPhysical)
                    healthStat(icon: "figure.run", value: String(format: "%.0f%%", viewModel.exerciseProgress * 100), label: "Exercise", color: .healthEmotional)
                    healthStat(icon: "figure.stand", value: String(format: "%.0f%%", viewModel.standProgress * 100), label: "Stand", color: .healthSocial)
                    healthStat(icon: "moon.fill", value: String(format: "%.1fh", viewModel.sleepHours), label: "Sleep", color: .healthSpiritual)
                    healthStat(icon: "iphone", value: String(format: "%.1fh", viewModel.screenTimeHours), label: "Screen", color: .amberWarm)
                    healthStat(icon: "heart.fill", value: "62", label: "Heart", color: .healthEmotional)
                }
                .padding(12)
                .liquidGlassCard()
                .padding(.horizontal, 16)
            }

            // Personality
            VStack(alignment: .leading, spacing: 0) {
                Text("Personality")
                    .amberSectionHeader()
                    .padding(.horizontal, 16)
                    .padding(.bottom, 12)

                VStack(spacing: 0) {
                    aboutRow(label: "Zodiac", value: viewModel.user.zodiacSun?.rawValue ?? "—")
                    aboutDivider()
                    aboutRow(label: "MBTI", value: viewModel.user.myersBriggs?.rawValue ?? "—")
                    aboutDivider()
                    aboutRow(label: "Enneagram", value: viewModel.user.enneagram?.rawValue ?? "—")
                }
                .liquidGlassCard()
                .padding(.horizontal, 16)
            }

            // Connected Apps
            VStack(alignment: .leading, spacing: 0) {
                Text("Connected Apps")
                    .amberSectionHeader()
                    .padding(.horizontal, 16)
                    .padding(.bottom, 12)

                VStack(spacing: 0) {
                    connectedAppRow(name: "Apple Health", icon: "heart.fill", color: .healthPhysical, isConnected: true)
                    aboutDivider()
                    connectedAppRow(name: "Google Calendar", icon: "calendar", color: .amberBlue, isConnected: true)
                    aboutDivider()
                    connectedAppRow(name: "Instagram", icon: "camera.fill", color: .healthEmotional, isConnected: false)
                    aboutDivider()
                    connectedAppRow(name: "Spotify", icon: "music.note", color: .healthSpiritual, isConnected: false)
                }
                .liquidGlassCard()
                .padding(.horizontal, 16)
            }

            // Sign Out
            Button {
                authViewModel.logout()
            } label: {
                Text("Sign Out")
                    .font(.amberHeadline)
                    .foregroundStyle(Color.amberError)
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .background(Color.amberCard, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).strokeBorder(Color.amberError.opacity(0.2), lineWidth: 0.5))
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
        }
        .padding(.top, 20)
    }

    private func healthStat(icon: String, value: String, label: String, color: Color) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 16, weight: .medium))
                .foregroundStyle(color)
            Text(value)
                .font(.amberTitle3)
                .bold()
                .foregroundStyle(Color.amberText)
                .minimumScaleFactor(0.7)
                .lineLimit(1)
            Text(label)
                .font(.amberCaption)
                .foregroundStyle(Color.amberSecondaryText)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
    }

    private func aboutRow(label: String, value: String) -> some View {
        HStack {
            Text(label).font(.amberSubheadline).foregroundStyle(Color.amberSecondaryText)
            Spacer()
            Text(value).font(.amberSubheadline).foregroundStyle(Color.amberText)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 13)
    }

    private func connectedAppRow(name: String, icon: String, color: Color, isConnected: Bool) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon).font(.system(size: 16, weight: .medium)).foregroundStyle(color).frame(width: 28, height: 28)
            Text(name).font(.amberSubheadline).foregroundStyle(Color.amberText)
            Spacer()
            Toggle("", isOn: .constant(isConnected)).labelsHidden().tint(.amberWarm)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
    }

    private func aboutDivider() -> some View {
        Rectangle().fill(Color.white.opacity(0.04)).frame(height: 0.5).padding(.leading, 16)
    }
}

// MARK: - Supporting Types

private enum ProfileContentTab: String, CaseIterable, Identifiable {
    case photos, todos, about

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .photos: return "square.grid.2x2.fill"
        case .todos:  return "checklist"
        case .about:  return "info.circle.fill"
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthViewModel())
}
