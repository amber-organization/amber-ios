//
//  LoginView.swift
//  AmberApp
//

import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel

    var body: some View {
        ZStack {
            Color.amberBackground.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 0) {
                    Spacer(minLength: 60)

                    // ── Logo ──────────────────────────────────────────────
                    VStack(spacing: 14) {
                        ZStack {
                            Circle()
                                .fill(LinearGradient(
                                    colors: [.amberBlue.opacity(0.25), .amberGold.opacity(0.25)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ))
                                .frame(width: 80, height: 80)
                            Text("A")
                                .font(.system(size: 40, weight: .bold))
                                .foregroundStyle(LinearGradient(
                                    colors: [.amberBlue, .amberGold],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ))
                        }
                        Text("Amber")
                            .font(.system(size: 34, weight: .bold))
                            .foregroundColor(.white)
                        Text("Your Health Network")
                            .font(.amberBody)
                            .foregroundColor(.gray)
                    }

                    Spacer(minLength: 48)

                    // ── Sign in ───────────────────────────────────────────
                    VStack(spacing: 14) {
                        Text("Sign in to Amber")
                            .font(.amberHeadline)
                            .foregroundColor(.white)

                        if let error = authViewModel.error {
                            Text(error)
                                .font(.amberCaption)
                                .foregroundColor(.red)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 16)
                        }

                        VStack(spacing: 10) {
                            AuthButton(systemIcon: "g.circle.fill",  label: "Continue with Google",    style: .glass) { authViewModel.loginWithGoogle() }
                            AuthButton(systemIcon: "apple.logo",      label: "Continue with Apple",     style: .dark)  { authViewModel.loginWithApple() }
                            AuthButton(systemIcon: "chevron.left.forwardslash.chevron.right", label: "Continue with GitHub", style: .glass) { authViewModel.loginWithGitHub() }
                            AuthButton(systemIcon: "briefcase.fill",  label: "Continue with LinkedIn",  style: .glass) { authViewModel.loginWithLinkedIn() }
                            AuthButton(systemIcon: "square.grid.2x2.fill", label: "Continue with Microsoft", style: .glass) { authViewModel.loginWithMicrosoft() }
                            AuthButton(systemIcon: "envelope.fill",   label: "Continue with Email",     style: .blue)  { authViewModel.loginWithEmail() }
                        }
                        .disabled(authViewModel.isLoading)

                        if authViewModel.isLoading {
                            ProgressView().tint(.amberGold)
                        }
                    }
                    .padding(.horizontal, 24)

                    Spacer(minLength: 40)

                    Text("By continuing, you agree to Amber's Terms of Service and Privacy Policy.")
                        .font(.amberCaption)
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                        .padding(.bottom, 40)
                }
            }
        }
        .preferredColorScheme(.dark)
    }
}

// ── Reusable auth button ─────────────────────────────────────────────────────

private enum AuthButtonStyle { case glass, dark, blue }

private struct AuthButton: View {
    let systemIcon: String
    let label: String
    let style: AuthButtonStyle
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: systemIcon)
                    .font(.system(size: 17, weight: .medium))
                Text(label)
                    .font(.system(size: 16, weight: .semibold))
                Spacer()
            }
            .foregroundColor(.white)
            .padding(.horizontal, 18)
            .frame(height: 52)
            .background(background)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(borderColor, lineWidth: 1)
            )
        }
    }

    @ViewBuilder
    private var background: some View {
        switch style {
        case .glass: Color.white.opacity(0.07)
        case .dark:  Color(red: 0.1, green: 0.1, blue: 0.1)
        case .blue:  Color.amberBlue
        }
    }

    private var borderColor: Color {
        style == .blue ? .clear : Color.white.opacity(0.12)
    }
}

#Preview {
    LoginView().environmentObject(AuthViewModel())
}
