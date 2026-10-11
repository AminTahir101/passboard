import SwiftUI

struct CardView<Content: View>: View {
    let content: () -> Content

    init(@ViewBuilder content: @escaping () -> Content) {
        self.content = content
    }

    var body: some View {
        content()
            .padding()
            .background(Color.cardSurface)
            .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}
