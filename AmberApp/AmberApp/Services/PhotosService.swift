//
//  PhotosService.swift
//  AmberApp
//
//  PHPhotoLibrary wrapper — fetches recent photos.
//

import Foundation
import Combine
import Photos
import UIKit

@MainActor
final class PhotosService: ObservableObject {
    @Published var recentImages: [UIImage] = []
    @Published var isAuthorized = false
    @Published var isLoading = false

    func requestAccess() async -> Bool {
        let status = await PHPhotoLibrary.requestAuthorization(for: .readWrite)
        isAuthorized = status == .authorized || status == .limited
        return isAuthorized
    }

    func fetchRecentPhotos(limit: Int = 30) async {
        guard isAuthorized else { return }
        isLoading = true

        let options = PHFetchOptions()
        options.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
        options.fetchLimit = limit

        let results = PHAsset.fetchAssets(with: .image, options: options)
        let manager = PHImageManager.default()
        let targetSize = CGSize(width: 300, height: 300)
        let requestOptions = PHImageRequestOptions()
        requestOptions.isSynchronous = false
        requestOptions.deliveryMode = .opportunistic
        requestOptions.resizeMode = .fast

        var images: [UIImage] = []

        await withTaskGroup(of: (Int, UIImage?).self) { group in
            for i in 0..<results.count {
                let asset = results.object(at: i)
                group.addTask {
                    await withCheckedContinuation { continuation in
                        manager.requestImage(for: asset, targetSize: targetSize, contentMode: .aspectFill, options: requestOptions) { image, _ in
                            continuation.resume(returning: (i, image))
                        }
                    }
                }
            }

            var indexed: [(Int, UIImage)] = []
            for await (index, image) in group {
                if let image { indexed.append((index, image)) }
            }
            images = indexed.sorted { $0.0 < $1.0 }.map(\.1)
        }

        recentImages = images
        isLoading = false
    }
}
