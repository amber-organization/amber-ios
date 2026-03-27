//
//  GlassCard.swift
//  AmberApp
//

import SwiftUI

struct GlassCard<Content: View>: View {
    var cornerRadius: CGFloat = 16
    var borderOpacity: Double = 0.08
    @ViewBuilder let content: () -> Content

    var body: some View {
        content()
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .strokeBorder(.white.opacity(borderOpacity), lineWidth: 0.5)
            )
    }
}
