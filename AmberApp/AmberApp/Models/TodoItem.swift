//
//  TodoItem.swift
//  AmberApp
//
//  Shared to-do item model used by ProfileView and TodayView.
//

import Foundation

struct TodoItem: Identifiable {
    let id = UUID()
    let title: String
    let context: String
    let linkedInitials: String?
    var isCompleted: Bool
}

extension TodoItem {
    static let samples: [TodoItem] = [
        TodoItem(title: "Reply to Angela about design review", context: "Overdue by 2 days", linkedInitials: "AC", isCompleted: false),
        TodoItem(title: "Call Mom", context: "Weekly check-in", linkedInitials: "CT", isCompleted: false),
        TodoItem(title: "Follow up with Rohan on BMA deck", context: "Sent 3 days ago", linkedInitials: "RM", isCompleted: false),
        TodoItem(title: "Send birthday message to Dev", context: "Birthday is tomorrow", linkedInitials: "DK", isCompleted: false),
        TodoItem(title: "Review Kaitlyn's product spec", context: "Shared yesterday", linkedInitials: "KR", isCompleted: true),
    ]
}
