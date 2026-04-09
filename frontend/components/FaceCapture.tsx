"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, CheckCircle, XCircle, Loader2, User } from "lucide-react";
import {
  loadFaceModels,
  startCamera,
  stopCamera,
  captureFaceDescriptor,
  descriptorToBase64,
} from "@/lib/faceVerification";

interface FaceCaptureProps {
  onCapture: (faceData: string) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
}

export function FaceCapture({
  onCapture,
  onCancel,
  title = "Face Registration",
  description = "Position your face in the frame",
}: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // Add ref to track stream
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "capturing" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    initializeCamera();
    return () => {
      if (streamRef.current) {
        stopCamera(streamRef.current);
        streamRef.current = null;
      }
    };
  }, []); // Empty dependency array for mount/unmount only

  const initializeCamera = async () => {
    try {
      setStatus("loading");
      setError("");

      // Load ML models
      await loadFaceModels();

      // Start camera
      if (videoRef.current) {
        const mediaStream = await startCamera(videoRef.current);
        setStream(mediaStream);
        streamRef.current = mediaStream; // Store in ref too
        setStatus("ready");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to initialize camera"
      );
      setStatus("error");
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;

    try {
      setStatus("capturing");
      setError("");

      // Countdown
      for (let i = 3; i > 0; i--) {
        setCountdown(i);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setCountdown(0);

      // Capture face
      const descriptor = await captureFaceDescriptor(videoRef.current);

      if (!descriptor) {
        throw new Error(
          "No face detected. Please ensure your face is clearly visible and try again."
        );
      }

      // Convert to base64 for storage
      const faceData = descriptorToBase64(descriptor);

      setStatus("success");
      
      // Wait a moment to show success state
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (streamRef.current) {
        stopCamera(streamRef.current);
        streamRef.current = null;
      }
      
      onCapture(faceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to capture face");
      setStatus("error");
    }
  };

  const handleRetry = () => {
    setStatus("ready");
    setError("");
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 bg-neutral-950/95 border-amber-200/30">
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Camera className="w-6 h-6 text-amber-200" />
            <h3 className="text-xl font-semibold text-white">{title}</h3>
          </div>
          <p className="text-sm text-neutral-400">{description}</p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          {status === "loading" && (
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Initializing...
            </Badge>
          )}
          {status === "ready" && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Ready to Capture
            </Badge>
          )}
          {status === "capturing" && (
            <Badge className="bg-amber-200/20 text-amber-200 border-amber-200/30">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Capturing...
            </Badge>
          )}
          {status === "success" && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Captured Successfully!
            </Badge>
          )}
          {status === "error" && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              <XCircle className="w-3 h-3 mr-1" />
              Error
            </Badge>
          )}
        </div>

        {/* Video Preview */}
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border-2 border-neutral-800">
          {countdown > 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="text-8xl font-bold text-white animate-pulse">
                {countdown}
              </div>
            </div>
          )}
          
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover mirror"
            style={{ transform: "scaleX(-1)" }}
          />

          {status === "success" && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
          )}

          {/* Face detection guide overlay */}
          {status === "ready" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-64 border-4 border-amber-200/50 rounded-full" />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Instructions */}
        {status === "ready" && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-400 text-center">
              Position your face within the oval guide<br />
              Ensure good lighting and remove glasses if possible<br />
              Look directly at the camera
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {status === "ready" && (
            <>
              <Button
                onClick={handleCapture}
                className="flex-1 bg-amber-200 hover:bg-amber-300 text-black font-semibold"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture Face
              </Button>
              {onCancel && (
                <Button
                  onClick={() => {
                    if (streamRef.current) {
                      stopCamera(streamRef.current);
                      streamRef.current = null;
                    }
                    onCancel();
                  }}
                  variant="outline"
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                >
                  Cancel
                </Button>
              )}
            </>
          )}

          {status === "error" && (
            <Button
              onClick={handleRetry}
              className="flex-1 bg-amber-200 hover:bg-amber-300 text-black font-semibold"
            >
              Try Again
            </Button>
          )}

          {status === "loading" && (
            <Button disabled className="flex-1">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
