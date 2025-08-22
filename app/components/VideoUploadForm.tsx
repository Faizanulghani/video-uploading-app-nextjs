"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "./Notification";
import { apiClient } from "@/lib/api-client";

export default function VideoUploadForm() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  async function getImageKitAuth() {
    const res = await fetch("/api/imagekit-auth", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to get ImageKit auth");
    return res.json();
  }

  async function uploadToImageKit(file: File) {
    // 1) get signature, token, expire
    const { signature, expire, token } = await getImageKitAuth();

    // 2) POST file to ImageKit Upload API
    const form = new FormData();
    form.append("file", file);
    form.append("fileName", file.name);
    form.append("useUniqueFileName", "true");
    form.append("signature", signature);
    form.append("expire", String(expire));
    form.append("token", token);

    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "ImageKit upload failed");
    }

    return res.json();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description || !file) {
      showNotification("Please fill all fields and choose a video", "error");
      return;
    }

    try {
      setIsUploading(true);
      // Upload to ImageKit first
      const uploaded = await uploadToImageKit(file);

      // Prepare payload for our DB
      const payload = {
        title,
        description,
        videoUrl: uploaded.filePath, // we store path, the viewer will render via IKVideo
        thumbnailUrl: uploaded.thumbnailUrl || uploaded.url,
        controls: true,
      };

      await apiClient.createVideo(payload);
      showNotification("Video uploaded", "success");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      showNotification(err?.message || "Upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 bg-base-100 p-6 rounded-2xl shadow"
    >
      <div className="form-control">
        <label className="label">
          <span className="label-text">Title</span>
        </label>
        <input
          type="text"
          className="input input-bordered"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your video a title"
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          className="textarea textarea-bordered min-h-28"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this video about?"
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Video file (mp4, mov, webm)</span>
        </label>
        <input
          type="file"
          accept="video/*"
          className="file-input file-input-bordered"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
      </div>

      <button
        type="submit"
        className={`btn btn-primary ${
          isUploading ? "btn-disabled loading" : ""
        }`}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
