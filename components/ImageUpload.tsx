"use client";

import { config } from "@/lib/config";
import {
  ImageKitProvider,
  upload,
  Image,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitUploadNetworkError,
  ImageKitServerError,
  UploadResponse,
} from "@imagekit/next";
import { useRef, useState } from "react";
import { Input } from "./ui/input";
import NextImage from "next/image";
import { toast } from "sonner";
import { Progress } from "./ui/progress";

const {
  env: {
    imageKit: { urlEndpoint, publicKey },
  },
} = config;

const authenticator = async () => {
  try {
    const url = `${config.env.apiEndpoint}/api/auth/imagekit`;
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status: ${response.status}: ${errorText}`
      );
    }
    const data = await response.json();
    const { signature, expire, token } = data;
    return { signature, expire, token };
  } catch (error: any) {
    throw new Error("Authentication request failed: " + error.message);
  }
};

const ImageUpload = ({
  onFileChange,
}: {
  onFileChange: (filePath: string) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileRes, setFileRes] = useState<UploadResponse | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const onSuccess = () => {
    toast("Image uploaded successfully!");
  };

  const onError = (errorMessage: string) => {
    toast(errorMessage);
  };

  const handleUpload = async () => {
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput?.files || !fileInput?.files.length) {
      toast("Please select a file to upload");
      return;
    }
    const file = fileInput.files[0];
    setFile(file);
    setFileRes(null);
    let authParams;
    try {
      authParams = await authenticator();
    } catch (error) {
      console.error(error);
      return;
    }
    const { signature, expire, token } = authParams;
    try {
      const uploadRes = await upload({
        expire,
        token,
        signature,
        publicKey,
        file,
        fileName: file.name,
        onProgress: (event) => {
          setProgress((event.loaded / event.total) * 100);
        },
      });
      console.info(uploadRes);
      setFileRes(uploadRes);
      onSuccess();
      onFileChange(uploadRes.url ?? "");
    } catch (error) {
      if (error instanceof ImageKitAbortError) {
        onError("Upload aborted: " + error.reason);
      } else if (error instanceof ImageKitInvalidRequestError) {
        toast("Invalid request: " + error.message);
      } else if (error instanceof ImageKitUploadNetworkError) {
        toast("Network error: " + error.message);
      } else if (error instanceof ImageKitServerError) {
        toast("Server error: " + error.message);
      } else {
        toast("Image upload failed");
      }
    }
  };

  return (
    <ImageKitProvider urlEndpoint={urlEndpoint}>
      <Input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleUpload}
      />
      <button
        className="upload-btn"
        onClick={(e) => {
          e.preventDefault();
          if (fileInputRef?.current) {
            fileInputRef.current.click();
          }
        }}
      >
        <NextImage
          src={"/icons/upload.svg"}
          alt="Upload"
          width={20}
          height={20}
          className="object-contain"
        />
        <p className="text-base text-light-100">Upload a file</p>
        {file ? <p className="upload-filename">{file.name}</p> : null}
      </button>
      {fileRes && fileRes?.url && fileRes?.name ? (
        <Image alt={fileRes?.name} src={fileRes.url} width={500} height={300} />
      ) : (
        <>{progress ? <Progress value={progress} /> : null}</>
      )}
    </ImageKitProvider>
  );
};

export default ImageUpload;
