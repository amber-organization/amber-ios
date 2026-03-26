//
//  ProfileAvatarButton.swift
//  Amber
//
//  Reusable toolbar avatar that navigates to Profile tab.
//

import SwiftUI

struct ProfileAvatarButton: View {
    var body: some View {
        ZStack {
            Circle()
                .fill(Color.amberCard)
                .frame(width: 32, height: 32)
                .overlay(
                    Circle()
                        .strokeBorder(
                            LinearGradient(
                                colors: [.amberWarm.opacity(0.8), .amberGold.opacity(0.6)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1.5
                        )
                )

            Text("S")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(.amberText)
        }
    }
}
