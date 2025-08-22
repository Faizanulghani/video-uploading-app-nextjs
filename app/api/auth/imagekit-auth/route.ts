import { getUploadAuthParams } from "@imagekit/next/server";

export async function GET() {
  try {
    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
      console.error("❌ IMAGEKIT_PRIVATE_KEY not found");
    }

    const authParams = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    });

    console.log("✅ Auth Params:", authParams);

    return Response.json(authParams);
  } catch (error) {
    console.error("❌ Error in /api/imagekit-auth:", error);
    return Response.json(
      { error: "Failed to get authentication parameters" },
      { status: 500 }
    );
  }
}
