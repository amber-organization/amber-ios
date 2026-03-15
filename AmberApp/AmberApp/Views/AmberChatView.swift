//
//  AmberChatView.swift
//  AmberApp
//
//  Same Amber conversation accessible in the app, via iMessage, and on the web.
//  All messages go through POST /chat — one shared history per user.
//

import SwiftUI

struct ChatMessage: Identifiable {
    let id = UUID()
    let role: Role
    let content: String
    let timestamp: Date

    enum Role { case user, amber }
}

@MainActor
class AmberChatViewModel: ObservableObject {
    @Published var messages: [ChatMessage] = []
    @Published var input: String = ""
    @Published var isLoading: Bool = false
    @Published var isSending: Bool = false

    private let apiBase = APIClient.shared.baseURL + "/chat"

    func loadHistory() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let data = try await APIClient.shared.get("/chat/history") as [[String: Any]]
            messages = data.compactMap { row in
                guard let roleStr = row["role"] as? String,
                      let content = row["content"] as? String else { return nil }
                let role: ChatMessage.Role = roleStr == "amber" ? .amber : .user
                return ChatMessage(role: role, content: content, timestamp: Date())
            }
        } catch {
            // Start with empty history — no error shown
        }
    }

    func sendMessage() async {
        let text = input.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty, !isSending else { return }

        input = ""
        isSending = true
        messages.append(ChatMessage(role: .user, content: text, timestamp: Date()))

        do {
            let body: [String: Any] = ["message": text, "channel": "ios"]
            let response = try await APIClient.shared.post("/chat", body: body) as [String: Any]
            if let reply = response["reply"] as? String {
                messages.append(ChatMessage(role: .amber, content: reply, timestamp: Date()))
            }
        } catch {
            messages.append(ChatMessage(
                role: .amber,
                content: "I hit a snag — try again in a moment.",
                timestamp: Date()
            ))
        }
        isSending = false
    }
}

struct AmberChatView: View {
    @StateObject private var vm = AmberChatViewModel()
    @FocusState private var inputFocused: Bool

    var body: some View {
        ZStack {
            Color.amberBackground.ignoresSafeArea()

            VStack(spacing: 0) {
                // ── Header ────────────────────────────────────────────────
                HStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(LinearGradient(
                                colors: [.amberBlue.opacity(0.3), .amberGold.opacity(0.3)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ))
                            .frame(width: 36, height: 36)
                        Text("A")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundStyle(LinearGradient(
                                colors: [.amberBlue, .amberGold],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ))
                    }
                    VStack(alignment: .leading, spacing: 1) {
                        Text("Amber")
                            .font(.amberHeadline)
                            .foregroundColor(.amberText)
                        Text("Your health network")
                            .font(.amberCaption)
                            .foregroundColor(.amberSecondaryText)
                    }
                    Spacer()
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color.amberBackground)

                Divider().opacity(0.15)

                // ── Messages ──────────────────────────────────────────────
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 10) {
                            if vm.isLoading {
                                ProgressView()
                                    .tint(.amberGold)
                                    .padding(.top, 40)
                            } else if vm.messages.isEmpty {
                                EmptyStateView()
                            }
                            ForEach(vm.messages) { msg in
                                MessageBubble(message: msg)
                                    .id(msg.id)
                            }
                            if vm.isSending {
                                TypingIndicator()
                                    .id("typing")
                            }
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 16)
                    }
                    .onChange(of: vm.messages.count) { _ in
                        if let last = vm.messages.last {
                            withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                        }
                    }
                    .onChange(of: vm.isSending) { sending in
                        if sending {
                            withAnimation { proxy.scrollTo("typing", anchor: .bottom) }
                        }
                    }
                }

                Divider().opacity(0.15)

                // ── Input bar ─────────────────────────────────────────────
                HStack(alignment: .bottom, spacing: 10) {
                    TextField("Message Amber...", text: $vm.input, axis: .vertical)
                        .lineLimit(1...5)
                        .font(.amberBody)
                        .foregroundColor(.amberText)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(
                            RoundedRectangle(cornerRadius: 20)
                                .fill(Color.white.opacity(0.07))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 20)
                                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                                )
                        )
                        .focused($inputFocused)

                    Button {
                        Task { await vm.sendMessage() }
                    } label: {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.system(size: 34))
                            .foregroundStyle(
                                vm.input.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || vm.isSending
                                    ? AnyShapeStyle(Color.gray.opacity(0.4))
                                    : AnyShapeStyle(LinearGradient(
                                        colors: [.amberGold, .amberBlue],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    ))
                            )
                    }
                    .disabled(vm.input.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || vm.isSending)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(Color.amberBackground)
            }
        }
        .task { await vm.loadHistory() }
    }
}

// ── Subviews ─────────────────────────────────────────────────────────────────

private struct MessageBubble: View {
    let message: ChatMessage

    var body: some View {
        HStack {
            if message.role == .user { Spacer(minLength: 48) }
            Text(message.content)
                .font(.amberBody)
                .foregroundColor(message.role == .user ? .white : .amberText)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(
                    RoundedRectangle(cornerRadius: 18)
                        .fill(message.role == .user ? Color.amberBlue : Color.white.opacity(0.08))
                )
            if message.role == .amber { Spacer(minLength: 48) }
        }
    }
}

private struct TypingIndicator: View {
    @State private var phase: CGFloat = 0

    var body: some View {
        HStack {
            HStack(spacing: 4) {
                ForEach(0..<3, id: \.self) { i in
                    Circle()
                        .fill(Color.amberSecondaryText)
                        .frame(width: 7, height: 7)
                        .offset(y: phase == CGFloat(i) ? -4 : 0)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 18)
                    .fill(Color.white.opacity(0.08))
            )
            Spacer(minLength: 48)
        }
        .onAppear {
            Timer.scheduledTimer(withTimeInterval: 0.3, repeats: true) { _ in
                withAnimation(.easeInOut(duration: 0.2)) {
                    phase = phase >= 2 ? 0 : phase + 1
                }
            }
        }
    }
}

private struct EmptyStateView: View {
    var body: some View {
        VStack(spacing: 16) {
            Spacer(minLength: 60)
            Text("💛")
                .font(.system(size: 48))
            Text("Hey! I'm Amber.")
                .font(.amberTitle2)
                .foregroundColor(.amberText)
            Text("Tell me something about yourself or someone in your life.")
                .font(.amberBody)
                .foregroundColor(.amberSecondaryText)
                .multilineTextAlignment(.center)
            Spacer(minLength: 60)
        }
        .padding(.horizontal, 32)
    }
}

#Preview {
    AmberChatView()
}
