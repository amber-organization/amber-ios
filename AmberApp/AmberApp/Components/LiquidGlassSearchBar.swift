//
//  LiquidGlassSearchBar.swift
//  Amber
//
//  Perplexity-style search bar — minimal, grounded.
//

import SwiftUI

struct LiquidGlassSearchBar: View {
    @Binding var searchText: String
    var placeholder: String = "Search"
    @FocusState private var isFocused: Bool

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.amberSecondaryText)

            TextField(placeholder, text: $searchText)
                .font(.amberBody)
                .foregroundColor(.amberText)
                .focused($isFocused)

            if !searchText.isEmpty {
                Button(action: { searchText = "" }) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 16))
                        .foregroundColor(.amberSecondaryText)
                }
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(Color.amberSurface, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        .frame(height: 44)
    }
}
