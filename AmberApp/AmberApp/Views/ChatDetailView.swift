//
//  ChatDetailView.swift
//  AmberApp
//
//  iMessage-style chat with Claude-powered Amber agent.
//

import SwiftUI

struct ChatDetailView: View {
    let conversationName: String
    let hasAmberAgent: Bool

    @StateObject private var claudeService = ClaudeService()
    @State private var messages: [ChatMessage] = []
    @State private var inputText = ""
    @FocusState private var isInputFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            // Messages
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 8) {
                        ForEach(messages) { message in
                            messageBubble(message)
                                .id(message.id)
                        }

                        if claudeService.isResponding {
                            HStack {
                                typingIndicator
                                Spacer()
                            }
                            .padding(.horizontal, 16)
                        }
                    }
                    .padding(.vertical, 12)
                }
                .onChange(of: messages.count) {
                    if let last = messages.last {
                        withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                    }
                }
            }

            // Input bar
            inputBar
        }
        .background(Color.black.ignoresSafeArea())
        .navigationTitle(conversationName)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .onAppear { addWelcomeMessage() }
    }

    // MARK: - Message Bubble

    private func messageBubble(_ message: ChatMessage) -> some View {
        let isUser = message.role == .user
        return HStack {
            if isUser { Spacer(minLength: 60) }

            Text(message.content)
                .font(.amberBody)
                .foregroundStyle(isUser ? Color.white : Color.amberText)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(
                    isUser
                        ? AnyShapeStyle(Color.amberWarm)
                        : AnyShapeStyle(.regularMaterial),
                    in: RoundedRectangle(cornerRadius: 18, style: .continuous)
                )
                .overlay(
                    !isUser
                        ? RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .strokeBorder(Color.glassStroke, lineWidth: 0.5)
                        : nil
                )

            if !isUser { Spacer(minLength: 60) }
        }
        .padding(.horizontal, 12)
    }

    // MARK: - Typing Indicator

    private var typingIndicator: some View {
        HStack(spacing: 4) {
            ForEach(0..<3, id: \.self) { i in
                Circle()
                    .fill(Color.amberSecondaryText)
                    .frame(width: 6, height: 6)
                    .opacity(0.6)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }

    // MARK: - Input Bar

    private var inputBar: some View {
        HStack(spacing: 10) {
            TextField("Message", text: $inputText, axis: .vertical)
                .font(.amberBody)
                .foregroundStyle(Color.amberText)
                .focused($isInputFocused)
                .lineLimit(1...5)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .strokeBorder(Color.glassStroke, lineWidth: 0.5)
                )

            Button {
                sendMessage()
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 32))
                    .foregroundStyle(inputText.isEmpty ? Color.amberSecondaryText : Color.amberWarm)
            }
            .disabled(inputText.isEmpty || claudeService.isResponding)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(.ultraThinMaterial)
    }

    // MARK: - Actions

    private func addWelcomeMessage() {
        guard messages.isEmpty, hasAmberAgent else { return }
        messages.append(ChatMessage(
            role: .assistant,
            content: "Hey! I'm Amber, your relationship assistant. How can I help you stay connected today?",
            timestamp: Date()
        ))
    }

    private func sendMessage() {
        let text = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }

        let userMsg = ChatMessage(role: .user, content: text, timestamp: Date())
        messages.append(userMsg)
        inputText = ""

        guard hasAmberAgent else { return }

        Task {
            do {
                let response = try await claudeService.sendMessage(history: messages.dropLast().map { $0 }, userMessage: text)
                messages.append(ChatMessage(role: .assistant, content: response, timestamp: Date()))
            } catch {
                messages.append(ChatMessage(role: .assistant, content: "Sorry, I couldn't respond right now. Please try again.", timestamp: Date()))
            }
        }
    }
}
