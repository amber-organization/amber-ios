//
//  ContactsView.swift
//  AmberApp
//
//  Root Contacts tab — handles permission states and delegates
//  to ContactsListView for the actual list. Includes stories carousel.
//

import SwiftUI

struct ContactsView: View {
    @StateObject private var viewModel = ContactsViewModel()
    @StateObject private var storyViewModel = StoryViewModel()
    @State private var showAddContact = false

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                switch viewModel.permission {
                case .notDetermined:
                    notDeterminedView
                case .denied:
                    deniedView
                case .authorized:
                    if viewModel.isLoading && viewModel.totalCount == 0 {
                        loadingView
                    } else {
                        ContactsListView(
                            viewModel: viewModel,
                            storyViewModel: storyViewModel
                        )
                    }
                }
            }
            .navigationTitle("Contacts")
            .navigationBarTitleDisplayMode(.large)
            .toolbarBackground(Color.black, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                if viewModel.permission == .authorized {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button { showAddContact = true } label: {
                            Image(systemName: "plus")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundStyle(Color.amberText)
                                .frame(width: 32, height: 32)
                                .background(.regularMaterial, in: Circle())
                                .overlay(Circle().strokeBorder(Color.glassStroke, lineWidth: 0.5))
                        }
                    }
                }
            }
            .sheet(isPresented: $showAddContact) {
                AddContactView {
                    Task { await viewModel.refresh() }
                }
            }
        }
        .preferredColorScheme(.dark)
        .task {
            await viewModel.loadContacts()
        }
        .fullScreenCover(isPresented: $storyViewModel.isShowingStory) {
            if let idx = storyViewModel.selectedStoryIndex {
                StoryCardView(viewModel: storyViewModel, startIndex: idx)
            }
        }
    }

    // MARK: - Not Determined (first launch)

    private var notDeterminedView: some View {
        VStack(spacing: 20) {
            Image(systemName: "person.crop.circle.badge.plus")
                .font(.system(size: 64, weight: .light))
                .foregroundStyle(Color.amberWarm)

            Text("Connect Your Contacts")
                .font(.amberTitle2)
                .foregroundStyle(Color.amberText)

            Text("Amber uses your contacts to help you stay\nconnected with the people who matter most.")
                .font(.amberSubheadline)
                .foregroundStyle(Color.amberSecondaryText)
                .multilineTextAlignment(.center)
                .lineSpacing(4)

            Button {
                Task { await viewModel.loadContacts() }
            } label: {
                Text("Allow Access")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color.amberWarm, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            }
            .padding(.horizontal, 40)
            .padding(.top, 8)
        }
        .padding(32)
    }

    // MARK: - Denied

    private var deniedView: some View {
        VStack(spacing: 20) {
            Image(systemName: "person.crop.circle.badge.xmark")
                .font(.system(size: 64, weight: .light))
                .foregroundStyle(Color.amberSecondaryText)

            Text("Contacts Access Denied")
                .font(.amberTitle2)
                .foregroundStyle(Color.amberText)

            Text("Amber needs access to your contacts to show them here. You can enable access in Settings.")
                .font(.amberSubheadline)
                .foregroundStyle(Color.amberSecondaryText)
                .multilineTextAlignment(.center)
                .lineSpacing(4)

            Button {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            } label: {
                Text("Open Settings")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(Color.amberWarm)
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .strokeBorder(Color.amberWarm, lineWidth: 1)
                    )
            }
            .padding(.horizontal, 40)
            .padding(.top, 8)
        }
        .padding(32)
    }

    // MARK: - Loading

    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.2)
                .tint(.amberWarm)
            Text("Loading contacts...")
                .font(.amberCaption)
                .foregroundStyle(Color.amberSecondaryText)
        }
    }
}

#Preview {
    ContactsView()
}
