export function UploadedImagesCard({ images }: { images: string[] }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {images.map((url, i) => (
        <div key={i} className="relative w-28 h-44 rounded-xl overflow-hidden border border-gray-200">
          <img src={url} alt={`设计稿 ${i + 1}`} className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
            <span className="text-xs text-white font-medium">第 {i + 1} 页</span>
          </div>
        </div>
      ))}
    </div>
  )
}
