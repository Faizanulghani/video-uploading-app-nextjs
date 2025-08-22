import VideoFeed from "./components/VideoFeed";

async function getVideos() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL_ENDPOINT ?? ""}/api/videos`,
    {
      // Revalidate periodically so new uploads appear
      next: { revalidate: 30 },
    }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function HomePage() {
  const videos = await getVideos();
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Latest Videos</h1>
      <VideoFeed videos={videos} />
    </main>
  );
}
