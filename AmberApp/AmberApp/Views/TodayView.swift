//
//  TodayView.swift
//  AmberApp
//
//  Daily snapshot — calendar, birthdays, schedule, music, friends map.
//

import SwiftUI
import MapKit

struct TodayView: View {
    @StateObject private var contactsService = ContactsService()
    @StateObject private var viewModel = AmberIDViewModel()
    @State private var selectedDate = Date()
    @State private var mapRegion = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 34.0522, longitude: -118.2437),
        span: MKCoordinateSpan(latitudeDelta: 0.15, longitudeDelta: 0.15)
    )

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
                    nowPlayingSection
                    birthdaysSection
                    scheduleSection
                    findMyFriendsSection
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

    // MARK: - Now Playing (Apple Music)

    private var nowPlayingSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Now Playing")
                .amberSectionHeader()
                .padding(.horizontal, 20)

            HStack(spacing: 14) {
                // Album art placeholder
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [Color.amberWarm.opacity(0.6), Color.healthSocial.opacity(0.4)],
                            startPoint: .topLeading, endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 56, height: 56)
                    .overlay {
                        Image(systemName: "music.note")
                            .font(.system(size: 22, weight: .medium))
                            .foregroundStyle(.white.opacity(0.9))
                    }

                VStack(alignment: .leading, spacing: 4) {
                    Text("Not Playing")
                        .font(.amberBody)
                        .foregroundStyle(Color.amberText)
                    Text("Open Apple Music to start listening")
                        .font(.amberCaption)
                        .foregroundStyle(Color.amberSecondaryText)
                }
                Spacer()

                // Playback controls
                HStack(spacing: 16) {
                    Image(systemName: "backward.fill")
                        .font(.system(size: 14))
                        .foregroundStyle(Color.amberSecondaryText)
                    Image(systemName: "play.fill")
                        .font(.system(size: 18))
                        .foregroundStyle(Color.amberWarm)
                    Image(systemName: "forward.fill")
                        .font(.system(size: 14))
                        .foregroundStyle(Color.amberSecondaryText)
                }
            }
            .padding(14)
            .liquidGlassCard()
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Find My Friends Map

    private struct FriendLocation: Identifiable {
        let id = UUID()
        let name: String
        let initials: String
        let lat: Double
        let lng: Double
        let status: String
    }

    private let friendLocations: [FriendLocation] = [
        FriendLocation(name: "Angela Chen", initials: "AC", lat: 34.0195, lng: -118.4912, status: "Santa Monica"),
        FriendLocation(name: "Kaitlyn Lee", initials: "KL", lat: 34.0689, lng: -118.4452, status: "Beverly Hills"),
        FriendLocation(name: "Reem Khan", initials: "RK", lat: 34.0407, lng: -118.2468, status: "Downtown LA"),
        FriendLocation(name: "Matthew Kim", initials: "MK", lat: 34.0259, lng: -118.3963, status: "Culver City"),
    ]

    private var findMyFriendsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Friends Nearby")
                    .amberSectionHeader()
                Spacer()
                Text("\(friendLocations.count) active")
                    .font(.amberCaption2)
                    .foregroundStyle(Color.amberWarm)
            }
            .padding(.horizontal, 20)

            VStack(spacing: 0) {
                // Map
                Map(coordinateRegion: .constant(mapRegion), annotationItems: friendLocations, annotationContent: { friend in
                    MapAnnotation(coordinate: CLLocationCoordinate2D(latitude: friend.lat, longitude: friend.lng)) {
                        VStack(spacing: 2) {
                            ZStack {
                                Circle()
                                    .fill(Color.amberWarm)
                                    .frame(width: 32, height: 32)
                                    .shadow(color: Color.amberWarm.opacity(0.5), radius: 6)
                                Text(friend.initials)
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundStyle(.white)
                            }
                            Text(friend.name.split(separator: " ").first.map(String.init) ?? "")
                                .font(.system(size: 9, weight: .semibold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 4)
                                .padding(.vertical, 1)
                                .background(Color.black.opacity(0.6), in: Capsule())
                        }
                    }
                })
                .frame(height: 200)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .allowsHitTesting(true)

                // Friend list below map
                VStack(spacing: 0) {
                    ForEach(Array(friendLocations.enumerated()), id: \.offset) { index, friend in
                        HStack(spacing: 12) {
                            ZStack {
                                Circle().fill(Color.amberWarm.opacity(0.2)).frame(width: 36, height: 36)
                                Text(friend.initials)
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundStyle(Color.amberWarm)
                            }
                            VStack(alignment: .leading, spacing: 2) {
                                Text(friend.name)
                                    .font(.amberCaption)
                                    .foregroundStyle(Color.amberText)
                                Text(friend.status)
                                    .font(.amberCaption2)
                                    .foregroundStyle(Color.amberSecondaryText)
                            }
                            Spacer()
                            Image(systemName: "location.fill")
                                .font(.system(size: 11))
                                .foregroundStyle(Color.amberWarm)
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)

                        if index < friendLocations.count - 1 {
                            Color.glassStroke.frame(height: 0.5).padding(.leading, 62)
                        }
                    }
                }
            }
            .liquidGlassCard()
            .padding(.horizontal, 16)
        }
    }
}
