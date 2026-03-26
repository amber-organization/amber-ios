//
//  Font+Amber.swift
//  Amber
//
//  Premium typography system — SF Pro with cinematic hierarchy.
//

import SwiftUI

extension Font {
    // MARK: - Display (hero moments, splash)
    static let amberDisplay = Font.system(size: 34, weight: .bold, design: .default)

    // MARK: - Titles
    static let amberTitle = Font.system(size: 28, weight: .bold)
    static let amberTitle2 = Font.system(size: 22, weight: .semibold)
    static let amberTitle3 = Font.system(size: 20, weight: .semibold)

    // MARK: - Body
    static let amberHeadline = Font.system(size: 17, weight: .semibold)
    static let amberBody = Font.system(size: 17, weight: .regular)
    static let amberCallout = Font.system(size: 16, weight: .regular)
    static let amberSubheadline = Font.system(size: 15, weight: .regular)

    // MARK: - Small
    static let amberFootnote = Font.system(size: 13, weight: .regular)
    static let amberCaption = Font.system(size: 12, weight: .regular)
    static let amberCaption2 = Font.system(size: 11, weight: .regular)

    // MARK: - Mono (for codes, stats, timestamps)
    static let amberMono = Font.system(size: 13, weight: .medium, design: .monospaced)
    static let amberMonoLarge = Font.system(size: 24, weight: .semibold, design: .monospaced)

    // MARK: - Rounded (for badges, tags, playful elements)
    static let amberRounded = Font.system(size: 13, weight: .semibold, design: .rounded)
    static let amberRoundedLarge = Font.system(size: 17, weight: .bold, design: .rounded)
}

// MARK: - View Extensions for consistent styling
extension View {
    func amberCardStyle() -> some View {
        self
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .strokeBorder(Color.white.opacity(0.06), lineWidth: 0.5)
            )
    }

    func amberSectionHeader() -> some View {
        self
            .font(.system(size: 13, weight: .semibold))
            .foregroundStyle(Color.amberSecondaryText)
            .textCase(.uppercase)
            .tracking(0.5)
    }
}
