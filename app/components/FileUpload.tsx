"use client";

import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import React, { useState } from "react";
interface FileUploadProps {
  onSuccess: (res: any) => void;
  onProgess?: (progress: number) => void;
  fileType?: "image" | "video";
}
const FileUpload = ({ onSuccess, onProgess, fileType }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [, setError] = useState<string | null>(null);

  const validFile = (file: File) => {
    if (fileType === "video") {
      if (!file.type.startsWith("video/")) {
        setError("Only video files are allowed");
        return false;
      }
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("File size should be less than 100MB");
      return false;
    }
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file || !validFile(file)) return;
    setUploading(true);
    setError(null);

    try {
      const authRes = await fetch("/api/auth/imagekit-auth");
      const auth = await authRes.json();
      const res = await upload({
        file,
        fileName: file.name,
        publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
        signature: auth.signature,
        expire: auth.expire,
        token: auth.token,
        onProgress: (event) => {
          if (event.lengthComputable && onProgess) {
            const percent = (event.loaded / event.total) * 100;
            onProgess(Math.round(percent));
          }
        },
      });
      onSuccess(res);
    } catch (error) {
      if (error instanceof ImageKitInvalidRequestError) {
        setError(error.message);
      } else if (error instanceof ImageKitServerError) {
        setError(error.message);
      } else if (error instanceof ImageKitUploadNetworkError) {
        setError(error.message);
      } else if (error instanceof ImageKitAbortError) {
        setError(error.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        accept={fileType === "video" ? "video/*" : "image/*"}
        onChange={handleFileChange}
      />
      {uploading && <p>Uploading...</p>}
    </>
  );
};

export default FileUpload;
