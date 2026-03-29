//
//  Color+Amber.swift
//  Amber
//
//  Liquid Glass color system — neutral darks, iOS-aligned semantics, amber brand accent.
//

import SwiftUI

extension Color {
    // MARK: - Brand (2 values only)
    static let amberPrimary = Color(hex: "C45A1C")
    static let amberWarm = Color(hex: "E8832A")
    static let amberAccent = Color(hex: "E8832A")

    // MARK: - Deprecated brand aliases (will be removed in Phase 2 view rewrites)
    static let amberGold = Color(hex: "E8832A")
    static let amberHoney = Color(hex: "E8832A")
    static let amberEmber = Color(hex: "C45A1C")

    // MARK: - Backgrounds (pure neutral, OLED-optimized)
    static let amberBackground = Color(hex: "000000")
    static let amberSurface = Color(hex: "1C1C1E")
    static let amberCard = Color(hex: "2C2C2E")
    static let amberCardBackground = Color(hex: "2C2C2E")
    static let amberCardElevated = Color(hex: "3A3A3C")

    // MARK: - Text (cool whites, iOS-aligned)
    static let amberText = Color(hex: "F5F5F7")
    static let amberSecondaryText = Color(hex: "8E8E93")
    static let amberTertiaryText = Color(hex: "48484A")

    // MARK: - Interactive
    static let amberBlue = Color(hex: "0A84FF")

    // MARK: - Semantic (iOS system colors)
    static let amberSuccess = Color(hex: "30D158")
    static let amberWarning = Color(hex: "FFD60A")
    static let amberError = Color(hex: "FF453A")

    // MARK: - Glass
    static let glassStroke = Color.white.opacity(0.12)
    static let glassFill = Color.white.opacity(0.05)
    static let glassHighlight = Color.white.opacity(0.25)

    // MARK: - Health Dimensions
    static let healthSpiritual = Color(hex: "A668C4")
    static let healthEmotional = Color(hex: "E06B5E")
    static let healthPhysical = Color(hex: "4CAF6E")
    static let healthIntellectual = Color(hex: "E6A23C")
    static let healthSocial = Color(hex: "5BA3D9")
    static let healthFinancial = Color(hex: "3DB8A0")

    // MARK: - Circle Types
    static let circleOneToOne = Color(hex: "E8832A")
    static let circleOneToMany = Color(hex: "5BA3D9")
    static let circleManyToMany = Color(hex: "A668C4")

    // MARK: - Brand Gradient (simplified two-stop)
    static let amberGradientStart = Color(hex: "E8832A")
    static let amberGradientMid = Color(hex: "C45A1C")
    static let amberGradientEnd = Color(hex: "C45A1C")

    static var amberBrandGradient: LinearGradient {
        LinearGradient(
            colors: [amberWarm, amberPrimary],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    // MARK: - Deprecated gradients (aliased, removed in Phase 2)
    static var amberSubtleGradient: LinearGradient {
        LinearGradient(
            colors: [amberWarm.opacity(0.08), amberPrimary.opacity(0.03)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    static var amberGlowGradient: RadialGradient {
        RadialGradient(
            colors: [amberWarm.opacity(0.15), amberWarm.opacity(0)],
            center: .center,
            startRadius: 0,
            endRadius: 80
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
