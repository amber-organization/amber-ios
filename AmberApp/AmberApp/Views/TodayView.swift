//
//  TodayView.swift
//  AmberApp
//
//  Calendar/feed view — birthdays, locations, daily info, tasks.
//

import SwiftUI

struct TodayView: View {
    @StateObject private var contactsService = ContactsService()
    @StateObject private var viewModel = AmberIDViewModel()
    @State private var selectedDate = Date()
    @State private var todos: [TodoItem] = TodoItem.samples

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        let firstName = viewModel.user.name.split(separator: " ").first.map(String.init) ?? "there"
        switch hour {
        case 5..<12:  return "Good morning, \(firstName)"
        case 12..<17: return "Good afternoon, \(firstName)"
        default:      return "Good evening, \(firstName)"
        }
    }

    private var dateString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMMM d"
        return formatter.string(from: Date())
    }

    var body: some View {
        NavigationStack {
            ScrollView(.vertical, showsIndicators: false) {
                VStack(alignment: .leading, spacing: 24) {
                    headerSection
                    calendarStrip
                    birthdaysSection
                    scheduleSection
                    todosSection
                    locationSection
                }
                .padding(.top, 16)
                .padding(.bottom, 120)
            }
            .background(Color.black.ignoresSafeArea())
            .preferredColorScheme(.dark)
        }
        .task {
            let granted = await contactsService.requestAccess()
            if granted { await contactsService.fetchAllContacts() }
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(greeting)
                .font(.amberLargeTitle)
                .foregroundStyle(Color.amberText)
            Text(dateString)
                .font(.amberSubheadline)
                .foregroundStyle(Color.amberSecondaryText)
        }
        .padding(.horizontal, 20)
    }

    // MARK: - Calendar Strip

    private var calendarStrip: some View {
        ScrollViewReader { proxy in
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(-3..<11, id: \.self) { offset in
                        let date = Calendar.current.date(byAdding: .day, value: offset, to: Date()) ?? Date()
                        let isToday = offset == 0
                        let isSelected = Calendar.current.isDate(date, inSameDayAs: selectedDate)

                        VStack(spacing: 6) {
                            Text(dayOfWeek(date))
                                .font(.amberCaption2)
                                .foregroundStyle(isSelected ? Color.amberText : Color.amberSecondaryText)
                            Text("\(Calendar.current.component(.day, from: date))")
                                .font(.amberHeadline)
                                .foregroundStyle(isSelected ? Color.amberText : Color.amberSecondaryText)
                        }
                        .frame(width: 44, height: 64)
                        .background(
                            isSelected
                                ? AnyShapeStyle(Color.amberWarm.opacity(0.3))
                                : isToday
                                    ? AnyShapeStyle(Color.amberCard)
                                    : AnyShapeStyle(Color.clear),
                            in: RoundedRectangle(cornerRadius: 12, style: .continuous)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .strokeBorder(isSelected ? Color.amberWarm : Color.clear, lineWidth: 1)
                        )
                        .id(offset)
                        .onTapGesture { selectedDate = date }
                    }
                }
                .padding(.horizontal, 16)
            }
            .onAppear { proxy.scrollTo(0, anchor: .center) }
        }
    }

    private func dayOfWeek(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE"
        return formatter.string(from: date).uppercased()
    }

    // MARK: - Birthdays

    private var birthdaysSection: some View {
        let birthdayContacts = contactsService.contactsWithBirthdayToday()
        return Group {
            if !birthdayContacts.isEmpty {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Birthdays Today")
                        .amberSectionHeader()
                        .padding(.horizontal, 20)

                    VStack(spacing: 0) {
                        ForEach(birthdayContacts, id: \.identifier) { contact in
                            HStack(spacing: 12) {
                                ZStack {
                                    Circle().fill(Color.amberGold).frame(width: 40, height: 40)
                                    Text(contact.initials)
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundStyle(.white)
                                }
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(contact.fullName)
                                        .font(.amberBody)
                                        .foregroundStyle(Color.amberText)
                                    Text("Birthday today!")
                                        .font(.amberCaption)
                                        .foregroundStyle(Color.amberGold)
                                }
                                Spacer()
                                Image(systemName: "gift.fill")
                                    .foregroundStyle(Color.amberGold)
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                        }
                    }
                    .liquidGlassCard()
                    .padding(.horizontal, 16)
                }
            } else {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Birthdays")
                        .amberSectionHeader()
                        .padding(.horizontal, 20)

                    HStack(spacing: 10) {
                        Image(systemName: "gift")
                            .foregroundStyle(Color.amberSecondaryText)
                        Text("No birthdays today")
                            .font(.amberCaption)
                            .foregroundStyle(Color.amberSecondaryText)
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .liquidGlassCard()
                    .padding(.horizontal, 16)
                }
            }
        }
    }

    // MARK: - Schedule

    private let schedule: [(time: String, title: String, subtitle: String?, color: Color)] = [
        ("9:00 AM", "Morning workout", nil, .healthPhysical),
        ("11:00 AM", "MAYA standup", nil, .amberWarm),
        ("1:00 PM", "Lunch with Dev", "Sweetgreen on Clark", .healthSocial),
        ("3:00 PM", "Design review with Angela", "Figma walkthrough", .amberGold),
        ("5:00 PM", "Product sync with Victor", nil, .amberPrimary),
    ]

    private var scheduleSection: some View {
        let hour = Calendar.current.component(.hour, from: Date())
        let currentIdx: Int = {
            switch hour {
            case ..<10: return 0
            case 10..<12: return 1
            case 12..<14: return 2
            case 14..<16: return 3
            default: return 4
            }
        }()

        return VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("Today's Schedule")
                    .amberSectionHeader()
                Spacer()
                Text("\(schedule.count) events")
                    .font(.amberCaption2)
                    .foregroundStyle(Color.amberTertiaryText)
            }
            .padding(.horizontal, 20)

            VStack(spacing: 0) {
                ForEach(Array(schedule.enumerated()), id: \.offset) { index, event in
                    let isNow = index == currentIdx
                    HStack(alignment: .top, spacing: 12) {
                        Text(event.time)
                            .font(.amberCaption)
                            .foregroundStyle(isNow ? Color.amberWarm : Color.amberSecondaryText)
                            .fontWeight(isNow ? .semibold : .regular)
                            .frame(width: 64, alignment: .trailing)

                        VStack(spacing: 0) {
                            Circle()
                                .fill(isNow ? Color.amberWarm : event.color)
                                .frame(width: isNow ? 10 : 8, height: isNow ? 10 : 8)
                            if index < schedule.count - 1 {
                                Rectangle()
                                    .fill(Color.amberSecondaryText.opacity(0.3))
                                    .frame(width: 1)
                            }
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text(event.title)
                                .font(.amberBody)
                                .fontWeight(isNow ? .semibold : .regular)
                                .foregroundStyle(Color.amberText)
                            if let sub = event.subtitle {
                                Text(sub)
                                    .font(.amberCaption)
                                    .foregroundStyle(Color.amberSecondaryText)
                            }
                            if isNow {
                                Text("NOW")
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundStyle(Color.amberWarm)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(Color.amberWarm.opacity(0.15), in: Capsule())
                            }
                        }
                        Spacer()
                    }
                    .padding(isNow ? 8 : 0)
                    .background(
                        isNow
                            ? RoundedRectangle(cornerRadius: 8).fill(Color.amberWarm.opacity(0.06))
                            : RoundedRectangle(cornerRadius: 8).fill(Color.clear)
                    )
                    .padding(.bottom, index == schedule.count - 1 ? 0 : 16)
                }
            }
            .liquidGlassCard()
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Todos

    private var todosSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Today's Actions")
                .amberSectionHeader()
                .padding(.horizontal, 20)

            ForEach(Array(todos.enumerated()), id: \.element.id) { index, item in
                HStack(alignment: .top, spacing: 12) {
                    Button {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                            todos[index].isCompleted.toggle()
                        }
                    } label: {
                        ZStack {
                            Circle()
                                .strokeBorder(item.isCompleted ? Color.amberWarm : Color.amberSecondaryText, lineWidth: 1.5)
                                .frame(width: 22, height: 22)
                            if item.isCompleted {
                                Circle().fill(Color.amberWarm).frame(width: 14, height: 14)
                            }
                        }
                    }
                    .buttonStyle(.plain)
                    .padding(.top, 2)

                    VStack(alignment: .leading, spacing: 3) {
                        Text(item.title)
                            .font(.amberBody)
                            .foregroundStyle(item.isCompleted ? Color.amberSecondaryText : Color.amberText)
                            .strikethrough(item.isCompleted, color: Color.amberSecondaryText)
                        Text(item.context)
                            .font(.amberCaption)
                            .foregroundStyle(Color.amberSecondaryText)
                    }
                    Spacer()

                    if let initials = item.linkedInitials {
                        ZStack {
                            Circle().fill(Color.amberSurface).frame(width: 28, height: 28)
                            Text(initials)
                                .font(.system(size: 10, weight: .bold))
                                .foregroundStyle(Color.amberSecondaryText)
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .amberCardStyle()
                .padding(.horizontal, 16)
            }
        }
    }

    // MARK: - Location

    private var locationSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Location")
                .amberSectionHeader()
                .padding(.horizontal, 20)

            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 10) {
                    Image(systemName: "mappin.and.ellipse")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundStyle(Color.amberWarm)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Los Angeles, CA")
                            .font(.amberBody)
                            .foregroundStyle(Color.amberText)
                        Text("Since 9:42 AM")
                            .font(.amberCaption)
                            .foregroundStyle(Color.amberSecondaryText)
                    }
                    Spacer()
                }
            }
            .padding(16)
            .liquidGlassCard()
            .padding(.horizontal, 16)
        }
    }
}
