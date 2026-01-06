"use client";

import { useState, useRef, useEffect } from 'react';
import { Square } from 'lucide-react';

interface CheckInOverlayProps {
  onClose: () => void;
}

export default function CheckInOverlay({ onClose }: CheckInOverlayProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
          audio: true
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }

        setTimeout(() => {
          startRecording(stream);
        }, 500);
      } catch (err: any) {
        setError('Camera access denied. Please allow camera and microphone access.');
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = (stream: MediaStream) => {
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        saveRecording();
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err: any) {
      setError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const saveRecording = async () => {
    setIsSaving(true);
    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('video', blob, 'checkin.webm');
      formData.append('notes', 'Daily check-in');

      const response = await fetch('http://localhost:8000/api/checkin/daily-checkin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        
        if (response.status === 401 || error.detail?.includes('credentials')) {
          alert('Your session has expired. Please log in again.');
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          return;
        }
        
        throw new Error(error.detail || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload successful:', data);

      setIsSaving(false);
      handleClose();
      alert(`Check-in saved successfully! 🎉\nTask ID: ${data.task_id}`);
    } catch (err: any) {
      console.error('Upload error:', err);
      setIsSaving(false);
      setError(`Failed to upload: ${err.message}`);
      
      setTimeout(() => {
        handleClose();
      }, 3000);
    }
  };

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
      />

      {}
      <div className="absolute inset-0 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-black/40 via-transparent to-black/60">
        {}
        <div className="w-full max-w-2xl text-center mt-12">
          {}
          <div className="bg-black/50 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <p className="text-xl text-white font-medium">
              📢 Tell us about your day
            </p>
            <p className="text-sm text-white/70 mt-2">
              How are you feeling? What's on your mind?
            </p>
          </div>
        </div>

        {}
        <div className="w-full max-w-md">
          {error && (
            <div className="mb-4 p-4 bg-red-500/90 backdrop-blur-sm rounded-lg text-white text-center">
              {error}
            </div>
          )}

          {isSaving ? (
            <div className="flex flex-col items-center gap-3 p-6 bg-black/60 backdrop-blur-md rounded-2xl border border-emerald-500/50">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white font-semibold">Saving your check-in...</p>
            </div>
          ) : isRecording ? (
            <div className="flex items-center justify-between p-6 bg-black/60 backdrop-blur-md rounded-2xl border border-red-500/50">
              {}
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold">Recording...</span>
              </div>

              {}
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-full font-semibold text-white transition-colors shadow-lg"
              >
                <Square size={18} fill="white" />
                <span>STOP</span>
              </button>
            </div>
          ) : (
            <div className="p-6 bg-black/60 backdrop-blur-md rounded-2xl border border-white/20">
              <p className="text-white text-center">Initializing camera...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

