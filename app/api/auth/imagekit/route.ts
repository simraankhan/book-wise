import { config } from "@/lib/config";
import ImageKit from "imagekit";
import { NextResponse } from "next/server";

const {
  env: {
    imageKit: { privateKey, publicKey, urlEndpoint },
  },
} = config;

const imageKit = new ImageKit({
  privateKey,
  publicKey,
  urlEndpoint,
});

export async function GET() {
  return NextResponse.json(imageKit.getAuthenticationParameters());
}
