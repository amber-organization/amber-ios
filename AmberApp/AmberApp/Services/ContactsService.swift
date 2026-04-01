//
//  ContactsService.swift
//  AmberApp
//
//  Lightweight CNContactStore wrapper used by SearchView, TodayView,
//  and any view that needs quick access to device contacts.
//  The Contacts tab uses ContactsViewModel directly instead.
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
    @Published var isAuthorized = false
    @Published var isLoading = false

    private let store = CNContactStore()

    @discardableResult
    func requestAccess() async -> Bool {
        do {
            let granted = try await store.requestAccess(for: .contacts)
            isAuthorized = granted
            return granted
        } catch {
            isAuthorized = false
            return false
        }
    }

    func fetchAllContacts() async {
        guard isAuthorized else { return }
        isLoading = true

        let fetched: [CNContact] = await withCheckedContinuation { continuation in
            DispatchQueue.global(qos: .userInitiated).async {
                let keys: [CNKeyDescriptor] = [
                    CNContactGivenNameKey as CNKeyDescriptor,
                    CNContactFamilyNameKey as CNKeyDescriptor,
                    CNContactPhoneNumbersKey as CNKeyDescriptor,
                    CNContactEmailAddressesKey as CNKeyDescriptor,
                    CNContactImageDataAvailableKey as CNKeyDescriptor,
                    CNContactThumbnailImageDataKey as CNKeyDescriptor,
                    CNContactBirthdayKey as CNKeyDescriptor,
                    CNContactOrganizationNameKey as CNKeyDescriptor,
                    CNContactJobTitleKey as CNKeyDescriptor,
                ]
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
