//
//  ChatDetailView.swift
//  AmberApp
//
//  Amber-style chat — warm sent bubbles, dark glass received bubbles,
//  Claude-powered AI agent for Amber conversations.
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
                    LazyVStack(spacing: 6) {
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
                        withAnimation(.easeOut(duration: 0.2)) {
                            proxy.scrollTo(last.id, anchor: .bottom)
                        }
                    }
                }
            }

            // Input bar
            inputBar
        }
        .background(Color.black.ignoresSafeArea())
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Color.black, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .principal) {
                HStack(spacing: 6) {
                    Text(conversationName)
                        .font(.amberHeadline)
                        .foregroundStyle(Color.amberText)

                    if hasAmberAgent {
                        Image(systemName: "sparkles")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundStyle(Color.amberWarm)
                    }
                }
            }
        }
        .onAppear { addWelcomeMessage() }
    }

    // MARK: - Message Bubble

    private func messageBubble(_ message: ChatMessage) -> some View {
        let isUser = message.role == .user

        return HStack(alignment: .bottom) {
            if isUser { Spacer(minLength: 60) }

            VStack(alignment: isUser ? .trailing : .leading, spacing: 2) {
                Text(message.content)
                    .font(.system(size: 16))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(
                        isUser ? Color.amberWarm : Color.amberSurface,
                        in: BubbleShape(isUser: isUser)
                    )

                Text(timeString(message.timestamp))
                    .font(.system(size: 11))
                    .foregroundStyle(Color.amberSecondaryText.opacity(0.6))
                    .padding(.horizontal, 6)
            }

            if !isUser { Spacer(minLength: 60) }
        }
        .padding(.horizontal, 10)
    }

    private func timeString(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "h:mm a"
        return f.string(from: date)
    }

    // MARK: - Bubble Shape

    struct BubbleShape: Shape {
        let isUser: Bool

        func path(in rect: CGRect) -> Path {
            let r: CGFloat = 18
            let tail: CGFloat = 6

            var path = Path()

            if isUser {
                // Rounded rect with tail on bottom-right
                path.addRoundedRect(in: CGRect(x: 0, y: 0, width: rect.width - tail, height: rect.height), cornerSize: CGSize(width: r, height: r))
                // Small tail
                path.move(to: CGPoint(x: rect.width - tail, y: rect.height - 8))
                path.addQuadCurve(to: CGPoint(x: rect.width, y: rect.height), control: CGPoint(x: rect.width - 2, y: rect.height))
                path.addQuadCurve(to: CGPoint(x: rect.width - tail - 4, y: rect.height), control: CGPoint(x: rect.width - tail, y: rect.height))
            } else {
                // Rounded rect with tail on bottom-left
                path.addRoundedRect(in: CGRect(x: tail, y: 0, width: rect.width - tail, height: rect.height), cornerSize: CGSize(width: r, height: r))
                // Small tail
                path.move(to: CGPoint(x: tail, y: rect.height - 8))
                path.addQuadCurve(to: CGPoint(x: 0, y: rect.height), control: CGPoint(x: 2, y: rect.height))
                path.addQuadCurve(to: CGPoint(x: tail + 4, y: rect.height), control: CGPoint(x: tail, y: rect.height))
            }

            return path
        }
    }

    // MARK: - Typing Indicator

    private var typingIndicator: some View {
        HStack(spacing: 5) {
            ForEach(0..<3, id: \.self) { _ in
                Circle()
                    .fill(Color.amberSecondaryText)
                    .frame(width: 7, height: 7)
                    .opacity(0.5)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color.amberSurface, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }

    // MARK: - Input Bar

    private var inputBar: some View {
        HStack(spacing: 10) {
            // Emoji button
            Button {} label: {
                Image(systemName: "face.smiling")
                    .font(.system(size: 22))
                    .foregroundStyle(Color.amberSecondaryText)
            }

            // Text field
            TextField("Message", text: $inputText, axis: .vertical)
                .font(.system(size: 16))
                .foregroundStyle(Color.amberText)
                .focused($isInputFocused)
                .lineLimit(1...5)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(Color.amberSurface, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .strokeBorder(Color.glassStroke, lineWidth: 0.5)
                )

            // Send button
            Button { sendMessage() } label: {
                Image(systemName: inputText.isEmpty ? "mic.fill" : "arrow.up.circle.fill")
                    .font(.system(size: 26))
                    .foregroundStyle(inputText.isEmpty ? Color.amberSecondaryText : Color.amberWarm)
            }
            .disabled(inputText.isEmpty || claudeService.isResponding)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color.black)
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
                let response = try await claudeService.sendMessage(
                    history: Array(messages.dropLast()),
                    userMessage: text
                )
                messages.append(ChatMessage(role: .assistant, content: response, timestamp: Date()))
            } catch {
                messages.append(ChatMessage(
                    role: .assistant,
                    content: "Sorry, I couldn't respond right now. Please try again.",
                    timestamp: Date()
                ))
            }
        }
    }
}
