//
//  ContactsViewModel.swift
//  AmberApp
//
//  Drives the Contacts tab — owns contact fetching, permission state,
//  search filtering, and section grouping directly (no nested ObservableObject).
//

import SwiftUI
import Combine
import Contacts

@MainActor
final class ContactsViewModel: ObservableObject {
    // MARK: - Published State

    @Published var contacts: [CNContact] = []
    @Published var permission: ContactsPermission = .notDetermined
    @Published var isLoading = false
    @Published var searchText = ""

    private let store = CNContactStore()

    var totalCount: Int { contacts.count }

    // MARK: - Filtered / Sectioned

    var filteredContacts: [CNContact] {
        guard !searchText.isEmpty else { return contacts }
        let query = searchText.lowercased()
        return contacts.filter {
            $0.fullName.lowercased().contains(query) ||
            $0.organizationName.lowercased().contains(query)
        }
    }

    var sections: [(letter: String, contacts: [CNContact])] {
        let grouped = Dictionary(grouping: filteredContacts) { contact -> String in
            if !contact.familyName.isEmpty {
                return String(contact.familyName.prefix(1)).uppercased()
            } else if !contact.givenName.isEmpty {
                return String(contact.givenName.prefix(1)).uppercased()
            }
            return "#"
        }
        return grouped.keys.sorted().map { letter in
            (letter: letter, contacts: grouped[letter]!.sorted {
                $0.fullName.localizedCompare($1.fullName) == .orderedAscending
            })
        }
    }

    var sectionLetters: [String] { sections.map(\.letter) }

    // MARK: - Init

    init() {
        syncPermission()
    }

    // MARK: - Permission

    func syncPermission() {
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

    // MARK: - Load (called from .task)

    func loadContacts() async {
        syncPermission()

        switch permission {
        case .notDetermined:
            // This triggers the system prompt
            do {
                let granted = try await store.requestAccess(for: .contacts)
                permission = granted ? .authorized : .denied
                if granted {
                    await fetchAllContacts()
                }
            } catch {
                permission = .denied
            }

        case .authorized:
            if contacts.isEmpty {
                await fetchAllContacts()
            }

        case .denied:
            break
        }
    }

    // MARK: - Fetch (background thread)

    func fetchAllContacts() async {
        guard permission == .authorized else { return }
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
                    CNContactImageDataKey as CNKeyDescriptor,
                    CNContactBirthdayKey as CNKeyDescriptor,
                    CNContactOrganizationNameKey as CNKeyDescriptor,
                    CNContactJobTitleKey as CNKeyDescriptor,
                    CNContactPostalAddressesKey as CNKeyDescriptor,
                    CNContactUrlAddressesKey as CNKeyDescriptor,
                ]
                let request = CNContactFetchRequest(keysToFetch: keys)
                request.sortOrder = .familyName

                var results: [CNContact] = []
                do {
                    try self.store.enumerateContacts(with: request) { contact, _ in
                        results.append(contact)
                    }
                } catch {
                    print("[ContactsVM] Fetch error: \(error)")
                }
                continuation.resume(returning: results)
            }
        }

        contacts = fetched
        isLoading = false
        print("[ContactsVM] Fetched \(fetched.count) contacts")
    }

    func refresh() async {
        await fetchAllContacts()
    }
}
