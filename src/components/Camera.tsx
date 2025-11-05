import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

interface CameraProps {
  onPhotoCapture: (photoData: string) => void;
  selectedContact?: {
    email: string;
    name: string;
  };
}

export const Camera: React.FC<CameraProps> = ({ onPhotoCapture, selectedContact }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access camera. Please make sure you have granted camera permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg');
        onPhotoCapture(photoData);
        stopCamera();
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex gap-2">
        {!isStreaming ? (
          <Button onClick={startCamera} variant="default">
            Start Camera
          </Button>
        ) : (
          <>
            <Button onClick={capturePhoto} variant="default">
              Take Photo
            </Button>
            <Button onClick={stopCamera} variant="outline">
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}; 