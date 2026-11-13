import { useEffect, useRef, useState } from "react";

const MAX_MB = 5;

function PhotoPicker({ file, onChange, onError }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Small preview of the chosen photo
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Show the live camera picture once the video element exists
  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOpen]);

  // Switch the camera off when leaving the page
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  function accept(chosen) {
    onError("");
    if (!chosen) return;
    if (!chosen.type.startsWith("image/")) {
      onError("Please choose an image file.");
      return;
    }
    if (chosen.size > MAX_MB * 1024 * 1024) {
      onError("The photo is too big (maximum " + MAX_MB + " MB).");
      return;
    }
    onChange(chosen);
  }

  function handleInput(event) {
    accept(event.target.files[0]);
    event.target.value = "";
  }

  async function openCamera() {
    onError("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      onError("The camera is not available here. Use Choose file instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch (err) {
      onError("Could not open the camera. Check that you allowed camera access.");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  }

  function takeSnapshot() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      onError("The camera is not ready yet, try again in a second.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          onError("Could not take the photo.");
          return;
        }
        const photo = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
        accept(photo);
        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  }

  return (
    <div>
      <label className="muted">Photo (optional, max {MAX_MB} MB)</label>

      {cameraOpen ? (
        <div className="camera-box">
          <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
          <div className="camera-actions">
            <button type="button" onClick={takeSnapshot}>Capture</button>
            <button type="button" className="btn-ghost" onClick={stopCamera}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="photo-actions">
          <button
            type="button"
            className="btn-ghost btn-small"
            onClick={() => fileInputRef.current.click()}
          >
            Choose file
          </button>
          <button
            type="button"
            className="btn-ghost btn-small"
            onClick={() => cameraInputRef.current.click()}
          >
            Take photo (phone)
          </button>
          <button type="button" className="btn-ghost btn-small" onClick={openCamera}>
            Live camera
          </button>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInput} hidden />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInput}
        hidden
      />

      {previewUrl && (
        <div className="photo-preview">
          <img src={previewUrl} alt="Selected" />
          <button type="button" className="btn-ghost btn-small" onClick={() => onChange(null)}>
            Remove photo
          </button>
        </div>
      )}
    </div>
  );
}

export default PhotoPicker;