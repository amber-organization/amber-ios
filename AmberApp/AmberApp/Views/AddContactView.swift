//
//  AddContactView.swift
//  AmberApp
//
//  Dark-themed form to create a new contact and save to device via CNContactStore.
//

import SwiftUI
import Contacts

struct AddContactView: View {
    @Environment(\.dismiss) private var dismiss
    var onSaved: (() -> Void)?

    @State private var firstName = ""
    @State private var lastName = ""
    @State private var phone = ""
    @State private var email = ""
    @State private var isSaving = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        // Avatar placeholder
                        ZStack {
                            Circle()
                                .fill(Color.amberSurface)
                                .frame(width: 80, height: 80)
                            Image(systemName: "person.fill")
                                .font(.system(size: 32, weight: .medium))
                                .foregroundStyle(Color.amberSecondaryText)
                        }
                        .padding(.top, 24)

                        // Fields
                        VStack(spacing: 0) {
                            inputField(label: "First Name", text: $firstName, placeholder: "Required")
                            fieldDivider
                            inputField(label: "Last Name", text: $lastName, placeholder: "Optional")
                            fieldDivider
                            inputField(label: "Phone", text: $phone, placeholder: "Optional", keyboard: .phonePad)
                            fieldDivider
                            inputField(label: "Email", text: $email, placeholder: "Optional", keyboard: .emailAddress)
                        }
                        .background(Color.amberSurface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .strokeBorder(Color.glassStroke, lineWidth: 0.5)
                        )
                        .padding(.horizontal, 16)

                        // Error
                        if let errorMessage {
                            Text(errorMessage)
                                .font(.amberCaption)
                                .foregroundStyle(Color.amberError)
                                .padding(.horizontal, 16)
                        }
                    }
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle("New Contact")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Color.black, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(Color.amberSecondaryText)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button {
                        saveContact()
                    } label: {
                        if isSaving {
                            ProgressView()
                                .tint(.amberWarm)
                        } else {
                            Text("Save")
                                .fontWeight(.semibold)
                                .foregroundStyle(firstName.isEmpty ? Color.amberTertiaryText : Color.amberWarm)
                        }
                    }
                    .disabled(firstName.isEmpty || isSaving)
                }
            }
        }
        .preferredColorScheme(.dark)
    }

    // MARK: - Input Field

    private func inputField(label: String, text: Binding<String>, placeholder: String, keyboard: UIKeyboardType = .default) -> some View {
        HStack(spacing: 0) {
            Text(label)
                .font(.amberBody)
                .foregroundStyle(Color.amberSecondaryText)
                .frame(width: 90, alignment: .leading)

            TextField("", text: text, prompt: Text(placeholder).foregroundStyle(Color.amberTertiaryText))
                .font(.amberBody)
                .foregroundStyle(Color.amberText)
                .keyboardType(keyboard)
                .autocorrectionDisabled()
                .textInputAutocapitalization(keyboard == .emailAddress ? .never : .words)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }

    private var fieldDivider: some View {
        Color.glassStroke
            .frame(height: 0.5)
            .padding(.leading, 106)
    }

    // MARK: - Save

    private func saveContact() {
        isSaving = true
        errorMessage = nil

        let newContact = CNMutableContact()
        newContact.givenName = firstName.trimmingCharacters(in: .whitespaces)
        newContact.familyName = lastName.trimmingCharacters(in: .whitespaces)

        let trimmedPhone = phone.trimmingCharacters(in: .whitespaces)
        if !trimmedPhone.isEmpty {
            newContact.phoneNumbers = [CNLabeledValue(label: CNLabelPhoneNumberMobile, value: CNPhoneNumber(stringValue: trimmedPhone))]
        }

        let trimmedEmail = email.trimmingCharacters(in: .whitespaces)
        if !trimmedEmail.isEmpty {
            newContact.emailAddresses = [CNLabeledValue(label: CNLabelHome, value: trimmedEmail as NSString)]
        }

        let saveRequest = CNSaveRequest()
        saveRequest.add(newContact, toContainerWithIdentifier: nil)

        do {
            try CNContactStore().execute(saveRequest)
            isSaving = false
            onSaved?()
            dismiss()
        } catch {
            isSaving = false
            errorMessage = "Failed to save: \(error.localizedDescription)"
        }
    }
}
