//
//  Color+Amber.swift
//  Amber
//
//  Premium color system inspired by amber resin, gold, and warmth.
//

import SwiftUI

extension Color {
    // MARK: - Brand Primary (from logo: warm amber egg)
    static let amberPrimary = Color(hex: "C45A1C")       // Deep amber-orange
    static let amberWarm = Color(hex: "E8832A")           // Molten amber
    static let amberGold = Color(hex: "D4A542")           // Rich gold
    static let amberHoney = Color(hex: "E6B84F")          // Light honey
    static let amberEmber = Color(hex: "9E3A12")          // Deep ember

    // MARK: - Brand Gradient
    static let amberGradientStart = Color(hex: "E8832A")  // Top: warm orange
    static let amberGradientMid = Color(hex: "C45A1C")    // Mid: deep amber
    static let amberGradientEnd = Color(hex: "9E3A12")    // Bottom: ember

    // MARK: - Backgrounds (warm-tinted darks)
    static let amberBackground = Color(hex: "080706")     // Near-black with warm undertone
    static let amberSurface = Color(hex: "141210")         // Elevated surface
    static let amberCard = Color(hex: "1A1714")            // Card background
    static let amberCardBackground = Color(hex: "1A1714")  // Alias for amberCard
    static let amberCardElevated = Color(hex: "231F1A")    // Elevated card

    // MARK: - Text
    static let amberText = Color(hex: "F5F0EB")           // Warm white
    static let amberSecondaryText = Color(hex: "8A8078")   // Warm gray
    static let amberTertiaryText = Color(hex: "5A5248")    // Muted

    // MARK: - Accents (keeping blue for interactive, adding warm accents)
    static let amberBlue = Color(hex: "4A90D9")            // Interactive elements
    static let amberAccent = Color(hex: "E8832A")          // Primary warm accent

    // MARK: - Semantic
    static let amberSuccess = Color(hex: "4CAF6E")
    static let amberWarning = Color(hex: "E6B84F")
    static let amberError = Color(hex: "D94A4A")

    // MARK: - Health Dimensions (warmer palette)
    static let healthSpiritual = Color(hex: "A668C4")
    static let healthEmotional = Color(hex: "E06B5E")
    static let healthPhysical = Color(hex: "4CAF6E")
    static let healthIntellectual = Color(hex: "E6A23C")
    static let healthSocial = Color(hex: "5BA3D9")
    static let healthFinancial = Color(hex: "3DB8A0")

    // MARK: - Circle Types
    static let circleOneToOne = Color(hex: "E8832A")       // Warm, intimate
    static let circleOneToMany = Color(hex: "5BA3D9")      // Broadcast blue
    static let circleManyToMany = Color(hex: "A668C4")     // Community purple

    // MARK: - Gradients
    static var amberBrandGradient: LinearGradient {
        LinearGradient(
            colors: [amberGradientStart, amberGradientMid, amberGradientEnd],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    static var amberSubtleGradient: LinearGradient {
        LinearGradient(
            colors: [amberWarm.opacity(0.15), amberGold.opacity(0.05)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    static var amberGlowGradient: RadialGradient {
        RadialGradient(
            colors: [amberWarm.opacity(0.3), amberWarm.opacity(0)],
            center: .center,
            startRadius: 0,
            endRadius: 120
        )
    }

    // MARK: - Hex Initializer
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
