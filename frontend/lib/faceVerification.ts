import * as faceapi from 'face-api.js';

let modelsLoaded = false;

/**
 * Load face-api.js models (only once)
 */
export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;
  
  try {
    const MODEL_URL = '/models';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    ]);
    
    modelsLoaded = true;
  } catch (error) {
    throw new Error('Failed to load face detection models. Please refresh the page.');
  }
}

/**
 * Capture face from video stream
 */
export async function captureFaceDescriptor(
  videoElement: HTMLVideoElement
): Promise<Float32Array | null> {
  try {
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      return null;
    }

    return detection.descriptor;
  } catch (error) {
    return null;
  }
}

/**
 * Compare two face descriptors and return similarity score
 * @returns similarity score (0-1, where 0 is identical)
 */
export function compareFaces(
  descriptor1: Float32Array,
  descriptor2: Float32Array
): number {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  return distance;
}

/**
 * Verify if two faces match (threshold: 0.6)
 * Lower threshold = stricter matching
 */
export function verifyFaceMatch(
  referenceDescriptor: Float32Array,
  liveDescriptor: Float32Array,
  threshold: number = 0.6
): { match: boolean; confidence: number } {
  const distance = compareFaces(referenceDescriptor, liveDescriptor);
  const match = distance < threshold;
  const confidence = Math.max(0, Math.min(100, (1 - distance) * 100));
  
  return { match, confidence };
}

/**
 * Convert Float32Array to base64 string for storage
 */
export function descriptorToBase64(descriptor: Float32Array): string {
  const array = Array.from(descriptor);
  return btoa(JSON.stringify(array));
}

/**
 * Convert base64 string back to Float32Array
 */
export function base64ToDescriptor(base64: string): Float32Array {
  const array = JSON.parse(atob(base64));
  return new Float32Array(array);
}

/**
 * Start camera stream
 */
export async function startCamera(
  videoElement: HTMLVideoElement
): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user',
      },
      audio: false,
    });

    videoElement.srcObject = stream;
    
    // Handle play promise to avoid unhandled promise rejection
    try {
      await videoElement.play();
    } catch (playError: any) {
      if (playError.name !== 'AbortError') {
        throw playError;
      }
    }
    
    return stream;
  } catch (error: any) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      throw new Error('Camera permission denied. Please allow camera access in your browser settings.');
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      throw new Error('No camera found. Please connect a camera and try again.');
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      throw new Error('Camera is already in use by another application. Please close other apps using the camera.');
    } else if (error.name === 'OverconstrainedError') {
      throw new Error('Camera does not meet the required specifications.');
    } else if (error.name === 'TypeError') {
      throw new Error('Camera access is not supported in this browser.');
    } else {
      throw new Error(error.message || 'Unable to access camera. Please check your camera settings and try again.');
    }
  }
}

/**
 * Stop camera stream
 */
export function stopCamera(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}
