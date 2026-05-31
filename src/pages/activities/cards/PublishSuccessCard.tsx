export function PublishSuccessCard({ url }: { url: string }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl rounded-tl-md p-5 text-center space-y-3">
      <div className="text-3xl">🎉</div>
      <p className="text-sm font-semibold text-green-800">活动发布成功！</p>
      <a href={url} className="text-sm text-blue-500 underline">{url}</a>
    </div>
  )
}
