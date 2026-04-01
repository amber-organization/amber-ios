//
//  DeviceContactDetailView.swift
//  AmberApp
//
//  Full contact detail — profile image, name, phone, email, actions.
//

import SwiftUI
import Contacts

struct DeviceContactDetailView: View {
    let contact: CNContact

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                avatarSection
                actionButtons
                phonesSection
                emailsSection
                addressesSection
                infoSection
            }
            .padding(.top, 24)
            .padding(.bottom, 120)
        }
        .background(Color.black.ignoresSafeArea())
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }

    // MARK: - Avatar & Name

    private var avatarSection: some View {
        VStack(spacing: 12) {
            // Large avatar
            if contact.imageDataAvailable,
               let data = contact.imageData ?? contact.thumbnailImageData,
               let img = UIImage(data: data) {
                Image(uiImage: img)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 100, height: 100)
                    .clipShape(Circle())
            } else {
                ZStack {
                    Circle()
                        .fill(contact.avatarColor)
                        .frame(width: 100, height: 100)
                    Text(contact.initials)
                        .font(.system(size: 36, weight: .semibold))
                        .foregroundStyle(.white)
                }
            }

            // Name
            Text(contact.fullName)
                .font(.amberTitle2)
                .foregroundStyle(Color.amberText)

            // Organization
            if !contact.organizationName.isEmpty {
                Text(contact.organizationName)
                    .font(.amberSubheadline)
                    .foregroundStyle(Color.amberSecondaryText)
            }

            // Job title
            if !contact.jobTitle.isEmpty {
                Text(contact.jobTitle)
                    .font(.amberCaption)
                    .foregroundStyle(Color.amberTertiaryText)
            }
        }
    }

    // MARK: - Action Buttons

    private var actionButtons: some View {
        HStack(spacing: 12) {
            if contact.primaryPhone != nil {
                actionButton(icon: "phone.fill", label: "Call", color: .healthPhysical) {
                    openURL("tel://\(contact.primaryPhone!.filter { $0.isNumber || $0 == "+" })")
                }
                actionButton(icon: "message.fill", label: "Message", color: .healthSocial) {
                    openURL("sms:\(contact.primaryPhone!.filter { $0.isNumber || $0 == "+" })")
                }
            }
            if contact.primaryEmail != nil {
                actionButton(icon: "envelope.fill", label: "Email", color: .amberWarm) {
                    openURL("mailto:\(contact.primaryEmail!)")
                }
            }
        }
        .padding(.horizontal, 16)
    }

    private func actionButton(icon: String, label: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(color)
                Text(label)
                    .font(.amberCaption)
                    .foregroundStyle(Color.amberSecondaryText)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 64)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .strokeBorder(Color.glassStroke, lineWidth: 0.5)
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Phone Numbers

    @ViewBuilder
    private var phonesSection: some View {
        if !contact.phoneNumbers.isEmpty {
            VStack(alignment: .leading, spacing: 0) {
                ForEach(Array(contact.phoneNumbers.enumerated()), id: \.offset) { index, phone in
                    let label = CNLabeledValue<CNPhoneNumber>.localizedString(forLabel: phone.label ?? "phone")
                    let number = phone.value.stringValue

                    Button {
                        openURL("tel://\(number.filter { $0.isNumber || $0 == "+" })")
                    } label: {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(label)
                                .font(.amberCaption)
                                .foregroundStyle(Color.amberSecondaryText)
                            Text(number)
                                .font(.amberBody)
                                .foregroundStyle(Color.amberBlue)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .buttonStyle(.plain)

                    if index < contact.phoneNumbers.count - 1 {
                        divider
                    }
                }
            }
            .liquidGlassCard()
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Emails

    @ViewBuilder
    private var emailsSection: some View {
        if !contact.emailAddresses.isEmpty {
            VStack(alignment: .leading, spacing: 0) {
                ForEach(Array(contact.emailAddresses.enumerated()), id: \.offset) { index, email in
                    let label = CNLabeledValue<NSString>.localizedString(forLabel: email.label ?? "email")
                    let address = email.value as String

                    Button {
                        openURL("mailto:\(address)")
                    } label: {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(label)
                                .font(.amberCaption)
                                .foregroundStyle(Color.amberSecondaryText)
                            Text(address)
                                .font(.amberBody)
                                .foregroundStyle(Color.amberBlue)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .buttonStyle(.plain)

                    if index < contact.emailAddresses.count - 1 {
                        divider
                    }
                }
            }
            .liquidGlassCard()
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Addresses

    @ViewBuilder
    private var addressesSection: some View {
        if !contact.postalAddresses.isEmpty {
            VStack(alignment: .leading, spacing: 0) {
                ForEach(Array(contact.postalAddresses.enumerated()), id: \.offset) { index, address in
                    let label = CNLabeledValue<CNPostalAddress>.localizedString(forLabel: address.label ?? "address")
                    let formatted = CNPostalAddressFormatter.string(from: address.value, style: .mailingAddress)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(label)
                            .font(.amberCaption)
                            .foregroundStyle(Color.amberSecondaryText)
                        Text(formatted)
                            .font(.amberBody)
                            .foregroundStyle(Color.amberText)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .frame(maxWidth: .infinity, alignment: .leading)

                    if index < contact.postalAddresses.count - 1 {
                        divider
                    }
                }
            }
            .liquidGlassCard()
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Additional Info

    @ViewBuilder
    private var infoSection: some View {
        let hasInfo = contact.birthday != nil || !contact.urlAddresses.isEmpty

        if hasInfo {
            VStack(alignment: .leading, spacing: 0) {
                if let bday = contact.birthday, let date = Calendar.current.date(from: bday) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Birthday")
                            .font(.amberCaption)
                            .foregroundStyle(Color.amberSecondaryText)
                        Text(date.formatted(date: .long, time: .omitted))
                            .font(.amberBody)
                            .foregroundStyle(Color.amberText)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                }

                if !contact.urlAddresses.isEmpty {
                    if contact.birthday != nil { divider }

                    ForEach(Array(contact.urlAddresses.enumerated()), id: \.offset) { index, url in
                        let label = CNLabeledValue<NSString>.localizedString(forLabel: url.label ?? "url")
                        let value = url.value as String

                        Button {
                            if let u = URL(string: value.hasPrefix("http") ? value : "https://\(value)") {
                                UIApplication.shared.open(u)
                            }
                        } label: {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(label)
                                    .font(.amberCaption)
                                    .foregroundStyle(Color.amberSecondaryText)
                                Text(value)
                                    .font(.amberBody)
                                    .foregroundStyle(Color.amberBlue)
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .buttonStyle(.plain)

                        if index < contact.urlAddresses.count - 1 {
                            divider
                        }
                    }
                }
            }
            .liquidGlassCard()
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Helpers

    private var divider: some View {
        Color.white.opacity(0.04)
            .frame(height: 0.5)
            .padding(.leading, 16)
    }

    private func openURL(_ string: String) {
        guard let url = URL(string: string) else { return }
        UIApplication.shared.open(url)
    }
}
