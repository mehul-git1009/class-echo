"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  CheckCircle,
  XCircle,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import {
  loadFaceModels,
  startCamera,
  stopCamera,
  captureFaceDescriptor,
  base64ToDescriptor,
  verifyFaceMatch,
} from "@/lib/faceVerification";

interface FaceVerificationProps {
  referenceFaceData: string; // Base64 encoded face descriptor
  onVerified: () => void;
  onFailed: () => void;
  onCancel?: () => void;
}

export function FaceVerification({
  referenceFaceData,
  onVerified,
  onFailed,
  onCancel,
}: FaceVerificationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // Add ref to track stream
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "verifying" | "success" | "failed" | "error"
  >("idle");
  const [error, setError] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
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

  const handleVerify = async () => {
    if (!videoRef.current) return;

    try {
      setStatus("verifying");
      setError("");

      // Countdown
      for (let i = 3; i > 0; i--) {
        setCountdown(i);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setCountdown(0);

      const liveDescriptor = await captureFaceDescriptor(videoRef.current);

      if (!liveDescriptor) {
        throw new Error(
          "No face detected. Please ensure your face is clearly visible."
        );
      }

      const referenceDescriptor = base64ToDescriptor(referenceFaceData);

      const result = verifyFaceMatch(referenceDescriptor, liveDescriptor);

      setConfidence(result.confidence);

      if (result.match) {
        setStatus("success");
        
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        if (streamRef.current) {
          stopCamera(streamRef.current);
          streamRef.current = null;
        }
        
        onVerified();
      } else {
        setStatus("failed");
        setError(
          `Face does not match. Confidence: ${result.confidence.toFixed(1)}%`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setStatus("error");
    }
  };

  const handleRetry = () => {
    setStatus("ready");
    setError("");
    setConfidence(0);
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 bg-neutral-950/95 border-amber-200/30">
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="w-6 h-6 text-amber-200" />
            <h3 className="text-xl font-semibold text-white">
              Face Verification
            </h3>
          </div>
          <p className="text-sm text-neutral-400">
            Verify your identity to mark attendance
          </p>
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
              Ready to Verify
            </Badge>
          )}
          {status === "verifying" && (
            <Badge className="bg-amber-200/20 text-amber-200 border-amber-200/30">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Verifying...
            </Badge>
          )}
          {status === "success" && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified! ({confidence.toFixed(1)}% match)
            </Badge>
          )}
          {status === "failed" && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              <XCircle className="w-3 h-3 mr-1" />
              Verification Failed
            </Badge>
          )}
          {status === "error" && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              <AlertCircle className="w-3 h-3 mr-1" />
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

          {status === "failed" && (
            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-16 h-16 text-red-400" />
            </div>
          )}

          {/* Face detection guide overlay */}
          {(status === "ready" || status === "verifying") && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`w-48 h-64 border-4 rounded-full ${
                  status === "verifying"
                    ? "border-amber-200 animate-pulse"
                    : "border-amber-200/50"
                }`}
              />
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
              Ensure good lighting<br />
              Look directly at the camera
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {status === "ready" && (
            <>
              <Button
                onClick={handleVerify}
                className="flex-1 bg-amber-200 hover:bg-amber-300 text-black font-semibold"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Verify Face
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

          {status === "failed" && (
            <>
              <Button
                onClick={handleRetry}
                className="flex-1 bg-amber-200 hover:bg-amber-300 text-black font-semibold"
              >
                Try Again
              </Button>
              {onCancel && (
                <Button
                  onClick={() => {
                    if (streamRef.current) {
                      stopCamera(streamRef.current);
                      streamRef.current = null;
                    }
                    onFailed();
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
              Retry
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
