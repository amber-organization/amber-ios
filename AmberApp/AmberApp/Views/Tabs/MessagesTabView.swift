//
//  MessagesTabView.swift
//  AmberApp
//

import SwiftUI

struct MessagesTabView: View {
    @State private var selectedChat: MockChat?

    var body: some View {
        NavigationStack {
            ZStack {
                Color.amberBackground.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        // Active Events horizontal scroll
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Active Events")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.white.opacity(0.5))
                                .padding(.horizontal, 20)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 14) {
                                    ForEach(MockData.chats.filter { $0.isGroup }) { chat in
                                        Button {
                                            selectedChat = chat
                                        } label: {
                                            VStack(spacing: 6) {
                                                ZStack {
                                                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                                                        .fill(.ultraThinMaterial)
                                                        .frame(width: 56, height: 56)
                                                        .overlay(
                                                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                                                .strokeBorder(.white.opacity(0.08), lineWidth: 0.5)
                                                        )

                                                    Text(chat.emoji ?? "")
                                                        .font(.system(size: 24))
                                                }

                                                if chat.unreadCount > 0 {
                                                    Circle()
                                                        .fill(Color.amberBlue)
                                                        .frame(width: 6, height: 6)
                                                } else {
                                                    Circle()
                                                        .fill(Color.clear)
                                                        .frame(width: 6, height: 6)
                                                }
                                            }
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                                .padding(.horizontal, 20)
                            }
                        }

                        // Messages list
                        VStack(spacing: 0) {
                            ForEach(MockData.chats) { chat in
                                Button {
                                    selectedChat = chat
                                } label: {
                                    ChatRow(chat: chat)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                    .padding(.top, 8)
                    .padding(.bottom, 120)
                }
            }
            .navigationTitle("Messages")
            .navigationBarTitleDisplayMode(.large)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {} label: {
                        Image(systemName: "square.and.pencil")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundColor(.amberBlue)
                    }
                }
            }
            .navigationDestination(item: $selectedChat) { chat in
                ChatDetailView(chat: chat)
            }
        }
    }
}

// MARK: - Chat Row

private struct ChatRow: View {
    let chat: MockChat

    var body: some View {
        HStack(spacing: 12) {
            // Avatar
            if chat.isGroup {
                ZStack {
                    Circle()
                        .fill(Color.amberBlue.opacity(0.15))
                        .frame(width: 50, height: 50)
                    Text(chat.emoji ?? "")
                        .font(.system(size: 22))
                }
            } else {
                ContactAvatar(name: chat.name, imageURL: nil, size: 50)
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(chat.name)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                        .lineLimit(1)

                    Spacer()

                    Text(chat.timestamp)
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.4))
                }

                HStack {
                    Text(chat.lastMessage)
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.5))
                        .lineLimit(1)

                    Spacer()

                    if chat.unreadCount > 0 {
                        Text("\(chat.unreadCount)")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white)
                            .frame(width: 22, height: 22)
                            .background(Color.amberBlue)
                            .clipShape(Circle())
                    }
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 10)
    }
}

// MARK: - Chat Detail View

struct ChatDetailView: View {
    let chat: MockChat
    @State private var messageText = ""
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            Color.amberBackground.ignoresSafeArea()

            VStack(spacing: 0) {
                // Messages
                ScrollView {
                    VStack(spacing: 4) {
                        if let memberCount = chat.memberCount {
                            Text("\(memberCount) members")
                                .font(.system(size: 12))
                                .foregroundColor(.white.opacity(0.4))
                                .padding(.top, 8)
                                .padding(.bottom, 4)
                        }

                        ForEach(chat.messages) { message in
                            MessageBubble(message: message, isGroup: chat.isGroup)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 12)
                }

                // Input bar
                HStack(spacing: 10) {
                    Button {} label: {
                        Image(systemName: "plus.circle")
                            .font(.system(size: 24))
                            .foregroundColor(.white.opacity(0.5))
                    }

                    HStack {
                        TextField("Message", text: $messageText)
                            .font(.system(size: 16))
                            .foregroundColor(.white)
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(.ultraThinMaterial)
                    .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 20, style: .continuous)
                            .strokeBorder(.white.opacity(0.08), lineWidth: 0.5)
                    )

                    Button {} label: {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.system(size: 30))
                            .foregroundColor(messageText.isEmpty ? .white.opacity(0.2) : .amberBlue)
                    }
                    .disabled(messageText.isEmpty)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(.ultraThinMaterial)
            }
        }
        .navigationTitle(chat.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }
}

// MARK: - Message Bubble

private struct MessageBubble: View {
    let message: MockMessage
    let isGroup: Bool

    var body: some View {
        VStack(alignment: message.isOutgoing ? .trailing : .leading, spacing: 2) {
            if !message.isOutgoing, isGroup, let sender = message.senderName {
                Text(sender)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.amberBlue)
                    .padding(.leading, 4)
            }

            HStack {
                if message.isOutgoing { Spacer(minLength: 60) }

                Text(message.text)
                    .font(.system(size: 15))
                    .foregroundColor(.white)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 9)
                    .background(
                        message.isOutgoing
                            ? AnyShapeStyle(Color.amberBlue)
                            : AnyShapeStyle(.ultraThinMaterial)
                    )
                    .clipShape(
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                    )

                if !message.isOutgoing { Spacer(minLength: 60) }
            }

            Text(message.timestamp)
                .font(.system(size: 10))
                .foregroundColor(.white.opacity(0.3))
                .padding(.horizontal, 4)
        }
        .frame(maxWidth: .infinity, alignment: message.isOutgoing ? .trailing : .leading)
        .padding(.vertical, 2)
    }
}

extension MockChat: Hashable {
    static func == (lhs: MockChat, rhs: MockChat) -> Bool {
        lhs.id == rhs.id
    }
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}
