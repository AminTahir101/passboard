import SwiftUI

struct LoadingOverlay: View {
    let isLoading: Bool

    var body: some View {
        if isLoading {
            ZStack {
                Color.black.opacity(0.18).ignoresSafeArea()
                ZStack {
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .fill(.regularMaterial)
                        .frame(width: 80, height: 80)
                    ProgressView()
                        .tint(Color.brand)
                }
            }
        }
    }
}
