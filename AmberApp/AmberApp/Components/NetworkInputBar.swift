//
//  NetworkInputBar.swift
//  Amber
//
//  Glass capsule input — magnifying glass + text + send.
//

import SwiftUI

struct NetworkInputBar: View {
    @Binding var inputText: String
    @FocusState.Binding var isInputFocused: Bool

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.amberSecondaryText)

            TextField("Ask about your network...", text: $inputText, axis: .vertical)
                .font(.amberBody)
                .foregroundColor(.amberText)
                .focused($isInputFocused)
                .lineLimit(1...3)

            if !inputText.isEmpty {
                Button {
                    sendMessage()
                } label: {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.system(size: 24))
                        .foregroundColor(.amberBlue)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(.regularMaterial, in: Capsule())
        .overlay(
            Capsule()
                .strokeBorder(
                    isInputFocused ? Color.amberBlue.opacity(0.4) : Color.glassStroke,
                    lineWidth: 0.5
                )
        )
        .padding(.horizontal, 16)
    }

    private func sendMessage() {
        inputText = ""
    }
}
