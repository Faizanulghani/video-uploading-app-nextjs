import { VideoFromData } from "@/types";

class ApiClient {
  private async _fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`/api${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed: ${res.status}`);
    }

    return res.json();
  }

  async getVideos() {
    return this._fetch("/videos");
  }

  async createVideo(videoData: VideoFromData) {
    return this._fetch("/videos", {
      method: "POST",
      body: JSON.stringify(videoData),
    });
  }
}

export const apiClient = new ApiClient();

export default apiClient;
