"use client";

import VideoUploadForm from "../components/VideoUploadForm";


export default function UploadPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Upload a New Video</h1>
      <VideoUploadForm />
    </main>
  );
}
