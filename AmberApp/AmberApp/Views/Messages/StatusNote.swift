//
//  StatusNote.swift
//  AmberApp
//
//  Model for contact status notes shown in the Messages tab.
//

import SwiftUI

struct StatusNote: Identifiable {
    let id = UUID()
    let name: String
    let initials: String
    let avatarColor: Color
    let note: String
    let isYours: Bool
}

extension StatusNote {
    static let samples: [StatusNote] = [
        StatusNote(name: "Your note", initials: "ST", avatarColor: .amberWarm, note: "Today's vibe...", isYours: true),
        StatusNote(name: "Roy", initials: "RH", avatarColor: .amberGold, note: "\u{1F488}\u{1F92B}", isYours: false),
        StatusNote(name: "Angela", initials: "AC", avatarColor: .healthEmotional, note: "studying all day \u{1F4DA}", isYours: false),
        StatusNote(name: "Dev", initials: "DK", avatarColor: .healthPhysical, note: "birthday weekend!! \u{1F382}", isYours: false),
        StatusNote(name: "Victor", initials: "VH", avatarColor: .healthIntellectual, note: "gym then tacos \u{1F4AA}\u{1F32E}", isYours: false),
        StatusNote(name: "Husna", initials: "HA", avatarColor: .healthSocial, note: "finally done with midterms", isYours: false),
    ]
}
