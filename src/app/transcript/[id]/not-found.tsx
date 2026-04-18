import Link from "next/link"

export default function TranscriptNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <h2 className="text-lg font-semibold text-foreground mb-2">
        Transcript Not Found
      </h2>
      <p className="text-sm text-secondary mb-4">
        This transcript doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition-colors"
      >
        Back to Overview
      </Link>
    </div>
  )
}
