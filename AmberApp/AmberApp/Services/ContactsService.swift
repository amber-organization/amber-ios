//
//  ContactsService.swift
//  AmberApp
//
//  CNContactStore wrapper — fetches device contacts on a background thread,
//  handles all 3 permission states, caches results.
//

import SwiftUI
import Combine
import Contacts

// MARK: - Permission State

enum ContactsPermission {
    case notDetermined
    case authorized
    case denied
}

// MARK: - Service

@MainActor
final class ContactsService: ObservableObject {
    @Published var contacts: [CNContact] = []
    @Published var permission: ContactsPermission = .notDetermined
    @Published var isLoading = false

    /// Convenience — kept for backward compat with views that check this.
    var isAuthorized: Bool { permission == .authorized }

    private let store = CNContactStore()

    static let defaultKeysToFetch: [CNKeyDescriptor] = [
        CNContactGivenNameKey as CNKeyDescriptor,
        CNContactFamilyNameKey as CNKeyDescriptor,
        CNContactPhoneNumbersKey as CNKeyDescriptor,
        CNContactEmailAddressesKey as CNKeyDescriptor,
        CNContactImageDataAvailableKey as CNKeyDescriptor,
        CNContactThumbnailImageDataKey as CNKeyDescriptor,
        CNContactBirthdayKey as CNKeyDescriptor,
        CNContactOrganizationNameKey as CNKeyDescriptor,
        CNContactJobTitleKey as CNKeyDescriptor,
        CNContactPostalAddressesKey as CNKeyDescriptor,
        CNContactUrlAddressesKey as CNKeyDescriptor,
        CNContactNoteKey as CNKeyDescriptor,
        CNContactImageDataKey as CNKeyDescriptor,
    ]

    init() {
        syncPermissionState()
    }

    // MARK: - Permission

    /// Reads the current system authorization status without prompting.
    func syncPermissionState() {
        let status = CNContactStore.authorizationStatus(for: .contacts)
        switch status {
        case .authorized, .limited:
            permission = .authorized
        case .denied, .restricted:
            permission = .denied
        case .notDetermined:
            permission = .notDetermined
        @unknown default:
            permission = .notDetermined
        }
    }

    /// Prompts the user for contacts access if not yet determined.
    /// Returns true if authorized after the prompt.
    @discardableResult
    func requestAccess() async -> Bool {
        // If already determined, just re-sync and return.
        let status = CNContactStore.authorizationStatus(for: .contacts)
        if status != .notDetermined {
            syncPermissionState()
            return permission == .authorized
        }

        do {
            let granted = try await store.requestAccess(for: .contacts)
            permission = granted ? .authorized : .denied
            return granted
        } catch {
            permission = .denied
            return false
        }
    }

    // MARK: - Fetching (background thread)

    /// Fetches all contacts on a background thread and updates `contacts` on main.
    func fetchAllContacts() async {
        guard permission == .authorized else { return }
        isLoading = true

        let keys = Self.defaultKeysToFetch
        let fetched: [CNContact] = await withCheckedContinuation { continuation in
            DispatchQueue.global(qos: .userInitiated).async {
                let request = CNContactFetchRequest(keysToFetch: keys)
                request.sortOrder = .familyName
                var results: [CNContact] = []
                do {
                    try self.store.enumerateContacts(with: request) { contact, _ in
                        results.append(contact)
                    }
                } catch {
                    print("[ContactsService] Fetch error: \(error)")
                }
                continuation.resume(returning: results)
            }
        }

        contacts = fetched
        isLoading = false
    }

    // MARK: - Queries

    func contactsWithBirthdayToday() -> [CNContact] {
        let cal = Calendar.current
        let today = cal.dateComponents([.month, .day], from: Date())
        return contacts.filter { contact in
            guard let bday = contact.birthday else { return false }
            return bday.month == today.month && bday.day == today.day
        }
    }
}

// MARK: - CNContact Helpers

extension CNContact {
    var fullName: String {
        let name = [givenName, familyName].filter { !$0.isEmpty }.joined(separator: " ")
        return name.isEmpty ? "No Name" : name
    }

    var initials: String {
        let first = givenName.prefix(1)
        let last = familyName.prefix(1)
        let result = "\(first)\(last)".uppercased()
        return result.isEmpty ? "?" : result
    }

    var primaryPhone: String? {
        phoneNumbers.first?.value.stringValue
    }

    var primaryEmail: String? {
        emailAddresses.first?.value as String?
    }

    var subtitle: String {
        if !organizationName.isEmpty { return organizationName }
        if let phone = primaryPhone { return phone }
        if let email = primaryEmail { return email }
        return ""
    }

    /// Stable color based on the contact identifier.
    var avatarColor: Color {
        let colors: [Color] = [
            .healthEmotional, .healthSocial, .healthPhysical,
            .healthSpiritual, .healthIntellectual, .healthFinancial,
            .amberWarm, .amberGold, .amberHoney, .amberPrimary,
        ]
        let hash = abs(identifier.hashValue)
        return colors[hash % colors.count]
    }
}
