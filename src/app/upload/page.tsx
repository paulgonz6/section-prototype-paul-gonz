import { UploadForm } from "@/components/upload/upload-form"

export default function UploadPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Upload Transcript
        </h1>
        <p className="text-sm text-secondary mt-1">
          Paste a raw interview transcript and watch the extraction pipeline
          process it in real time. Use the prompt template below to generate one
          with Claude, or paste a real conversation.
        </p>
      </div>

      <UploadForm />
    </div>
  )
}
