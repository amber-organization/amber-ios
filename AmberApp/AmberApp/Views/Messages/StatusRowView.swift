//
//  StatusRowView.swift
//  AmberApp
//
//  Horizontal scrollable row of status notes.
//

import SwiftUI

struct StatusRowView: View {
    let statuses: [StatusNote]
    var onYourNoteTapped: () -> Void = {}

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(alignment: .bottom, spacing: 8) {
                ForEach(statuses) { status in
                    StatusBubbleView(status: status) {
                        if status.isYours {
                            onYourNoteTapped()
                        }
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 4)
        }
    }
}
