//
//  OnboardingViewModel.swift
//  AmberApp
//
//  Created on 2026-03-04.
//

import SwiftUI

@MainActor
class OnboardingViewModel: ObservableObject {
    // MARK: - Navigation
    @Published var currentStep: OnboardingStep = .welcome

    // MARK: - User Data
    @Published var displayName: String = ""
    @Published var birthday: Date?
    @Published var birthdayTime: Date?
    @Published var birthLocation: String = ""
    @Published var hometown: String = ""
    @Published var currentCity: String = ""
    @Published var almaMater: String = ""

    // MARK: - Privacy
    @Published var selectedPrivacyTier: String = "selective_cloud"

    // MARK: - Permissions
    @Published var contactsPermission: Bool = false
    @Published var locationPermission: Bool = false
    @Published var healthKitPermission: Bool = false
    @Published var calendarPermission: Bool = false

    // MARK: - State
    @Published var isLoading: Bool = false
    @Published var error: String?

    // MARK: - Derived
    var derivedHoroscope: HoroscopeSign? {
        guard let birthday else { return nil }
        return HoroscopeSign.from(date: birthday)
    }

    // MARK: - Navigation Methods

    func nextStep() {
        guard let nextIndex = OnboardingStep.allCases.firstIndex(of: currentStep)
                .map({ OnboardingStep.allCases.index(after: $0) }),
              nextIndex < OnboardingStep.allCases.endIndex else { return }

        withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) {
            currentStep = OnboardingStep.allCases[nextIndex]
        }
    }

    func previousStep() {
        guard let currentIndex = OnboardingStep.allCases.firstIndex(of: currentStep),
              currentIndex > OnboardingStep.allCases.startIndex else { return }

        let prevIndex = OnboardingStep.allCases.index(before: currentIndex)
        withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) {
            currentStep = OnboardingStep.allCases[prevIndex]
        }
    }

    // MARK: - Submission

    func submitCurrentStep() {
        error = nil

        switch currentStep {
        case .basics:
            guard !displayName.trimmingCharacters(in: .whitespaces).isEmpty else {
                error = "Please enter your name."
                return
            }
        case .birthday:
            guard birthday != nil else {
                error = "Please select your birthday."
                return
            }
        case .location:
            guard !currentCity.trimmingCharacters(in: .whitespaces).isEmpty else {
                error = "Please enter your current city."
                return
            }
        default:
            break
        }

        // Store data locally for now — API integration later
        saveProfileLocally()
        nextStep()
    }

    func completeOnboarding() {
        saveProfileLocally()
        UserDefaults.standard.set(true, forKey: "hasCompletedOnboarding")
    }

    // MARK: - Local Storage

    private func saveProfileLocally() {
        let profile = UserProfileData(
            displayName: displayName,
            birthday: birthday,
            birthdayTime: birthdayTime,
            birthLocation: birthLocation,
            hometown: hometown,
            currentCity: currentCity,
            almaMater: almaMater,
            horoscopeSign: derivedHoroscope,
            privacyTier: selectedPrivacyTier,
            contactsPermission: contactsPermission,
            locationPermission: locationPermission,
            healthKitPermission: healthKitPermission,
            calendarPermission: calendarPermission
        )

        if let data = try? JSONEncoder().encode(profile) {
            UserDefaults.standard.set(data, forKey: "userProfileData")
        }
    }
}
