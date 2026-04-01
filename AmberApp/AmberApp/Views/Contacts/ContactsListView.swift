//
//  ContactsListView.swift
//  AmberApp
//
//  Apple Contacts-style alphabetical list with stories carousel,
//  section index, search bar, contact count footer, and pull-to-refresh.
//

import SwiftUI
import Contacts

struct ContactsListView: View {
    @ObservedObject var viewModel: ContactsViewModel
    @ObservedObject var storyViewModel: StoryViewModel
    var onAddContact: () -> Void = {}

    var body: some View {
        ScrollViewReader { proxy in
            ZStack(alignment: .trailing) {
                mainList(proxy: proxy)
                sectionIndex(proxy: proxy)
            }
        }
    }

    // MARK: - Main List

    private func mainList(proxy: ScrollViewProxy) -> some View {
        ScrollView {
            VStack(spacing: 0) {
                // Header: title + add button
                HStack(alignment: .center) {
                    Text("Contacts")
                        .font(.system(size: 34, weight: .bold))
                        .foregroundStyle(Color.amberText)

                    Spacer()

                    Button(action: onAddContact) {
                        Image(systemName: "plus")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(Color.amberText)
                            .frame(width: 32, height: 32)
                            .background(.regularMaterial, in: Circle())
                            .overlay(Circle().strokeBorder(Color.glassStroke, lineWidth: 0.5))
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)
                .padding(.bottom, 16)

                // Stories carousel
                StoriesCarouselView(viewModel: storyViewModel)

                // Divider
                Color.glassStroke
                    .frame(height: 0.5)
                    .padding(.horizontal, 16)
                    .padding(.bottom, 8)

                // Sections
                LazyVStack(spacing: 0, pinnedViews: [.sectionHeaders]) {
                    ForEach(viewModel.sections, id: \.letter) { section in
                        Section {
                            VStack(spacing: 0) {
                                ForEach(Array(section.contacts.enumerated()), id: \.element.identifier) { index, contact in
                                    NavigationLink {
                                        DeviceContactDetailView(contact: contact)
                                    } label: {
                                        ContactRow(contact: contact)
                                    }
                                    .buttonStyle(.plain)

                                    if index < section.contacts.count - 1 {
                                        Color.glassStroke
                                            .frame(height: 0.5)
                                            .padding(.leading, 68)
                                    }
                                }
                            }
                            .liquidGlassCard()
                            .padding(.horizontal, 16)
                        } header: {
                            sectionHeader(section.letter)
                                .id(section.letter)
                        }
                    }
                }

                // Footer
                Text("\(viewModel.totalCount) Contacts")
                    .font(.amberCaption)
                    .foregroundStyle(Color.amberTertiaryText)
                    .padding(.top, 24)
                    .padding(.bottom, 120)
            }
        }
        .refreshable {
            await viewModel.refresh()
        }
    }

    // MARK: - Section Header

    private func sectionHeader(_ letter: String) -> some View {
        HStack {
            Text(letter)
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(Color.amberSecondaryText)
            Spacer()
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 6)
        .background(Color.black)
    }

    // MARK: - Section Index (right edge)

    private func sectionIndex(proxy: ScrollViewProxy) -> some View {
        VStack(spacing: 1) {
            ForEach(viewModel.sectionLetters, id: \.self) { letter in
                Text(letter)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(Color.amberWarm)
                    .frame(width: 16, height: 14)
                    .onTapGesture {
                        withAnimation(.easeOut(duration: 0.2)) {
                            proxy.scrollTo(letter, anchor: .top)
                        }
                    }
            }
        }
        .padding(.trailing, 2)
        .padding(.vertical, 8)
    }
}

// MARK: - Contact Row

struct ContactRow: View {
    let contact: CNContact

    var body: some View {
        HStack(spacing: 12) {
            contactAvatar

            VStack(alignment: .leading, spacing: 2) {
                Text(contact.fullName)
                    .font(.amberBody)
                    .foregroundStyle(Color.amberText)
                    .lineLimit(1)

                if !contact.organizationName.isEmpty {
                    Text(contact.organizationName)
                        .font(.amberCaption)
                        .foregroundStyle(Color.amberSecondaryText)
                        .lineLimit(1)
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(Color.amberTertiaryText)
        }
        .padding(.horizontal, 14)
        .frame(minHeight: 56)
        .contentShape(Rectangle())
    }

    @ViewBuilder
    private var contactAvatar: some View {
        if contact.imageDataAvailable,
           let data = contact.thumbnailImageData,
           let img = UIImage(data: data) {
            Image(uiImage: img)
                .resizable()
                .scaledToFill()
                .frame(width: 40, height: 40)
                .clipShape(Circle())
        } else {
            ZStack {
                Circle()
                    .fill(contact.avatarColor)
                    .frame(width: 40, height: 40)
                Text(contact.initials)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(.white)
            }
        }
    }
}
