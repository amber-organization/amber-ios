//
//  ContactsViewModel.swift
//  AmberApp
//
//  Drives the Contacts tab — wraps ContactsService with search,
//  section grouping, and permission handling for the UI.
//

import SwiftUI
import Combine
import Contacts

@MainActor
final class ContactsViewModel: ObservableObject {
    @Published var searchText = ""
    @Published var service = ContactsService()

    // MARK: - Computed

    var permission: ContactsPermission { service.permission }
    var isLoading: Bool { service.isLoading }
    var totalCount: Int { service.contacts.count }

    var filteredContacts: [CNContact] {
        let all = service.contacts
        guard !searchText.isEmpty else { return all }
        let query = searchText.lowercased()
        return all.filter {
            $0.fullName.lowercased().contains(query) ||
            $0.organizationName.lowercased().contains(query)
        }
    }

    var sections: [(letter: String, contacts: [CNContact])] {
        let grouped = Dictionary(grouping: filteredContacts) { contact -> String in
            let key: String
            if !contact.familyName.isEmpty {
                key = String(contact.familyName.prefix(1)).uppercased()
            } else if !contact.givenName.isEmpty {
                key = String(contact.givenName.prefix(1)).uppercased()
            } else {
                key = "#"
            }
            return key
        }
        return grouped.keys.sorted().map { letter in
            (letter: letter, contacts: grouped[letter]!.sorted { $0.fullName.localizedCompare($1.fullName) == .orderedAscending })
        }
    }

    var sectionLetters: [String] {
        sections.map(\.letter)
    }

    // MARK: - Actions

    func loadContacts() async {
        service.syncPermissionState()

        switch service.permission {
        case .notDetermined:
            let granted = await service.requestAccess()
            if granted {
                await service.fetchAllContacts()
            }
        case .authorized:
            if service.contacts.isEmpty {
                await service.fetchAllContacts()
            }
        case .denied:
            break
        }
    }

    func refresh() async {
        await service.fetchAllContacts()
    }
}
