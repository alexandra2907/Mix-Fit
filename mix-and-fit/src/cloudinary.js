const CLOUD_NAME = "wzgyrzcc";
const UPLOAD_PRESET = "mixfit_unsigned";

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/" + CLOUD_NAME + "/image/upload",
    { method: "POST", body: formData }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Upload failed");
  }
  return data.secure_url;
}

// Smaller, optimized version of an image for the cards (faster page)
export function thumbnail(url) {
  return url.replace("/upload/", "/upload/w_400,q_auto,f_auto/");
}

// Opens Google Lens with a photo that is already online
export function lensUrl(url) {
  return "https://lens.google.com/uploadbyurl?url=" + encodeURIComponent(url);
}