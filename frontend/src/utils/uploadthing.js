import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";

export const UploadButton = generateUploadButton({
  url: `${import.meta.env.VITE_API_URL}/api/uploadthing`,
});

export const UploadDropzone = generateUploadDropzone({
  url: `${import.meta.env.VITE_API_URL}/api/uploadthing`,
});