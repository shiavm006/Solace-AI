"use client";

import { useState, useRef, useEffect } from 'react';
import { Square } from 'lucide-react';
import Alert from '@/components/ui/alert';

interface CheckInOverlayProps {
  onClose: () => void;
}

export default function CheckInOverlay({ onClose }: CheckInOverlayProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes in seconds
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const startRecording = (stream: MediaStream) => {
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      chunksRef.current = [];
      // Clear any previous messages
      setError(null);
      setSuccess(null);
      
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
      setTimeRemaining(120); // Reset to 2 minutes

      // Start countdown timer
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Auto-stop recording when timer reaches 0
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop();
              setIsRecording(false);
            }
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    // Clear timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
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
          setError('Your session has expired. Please log in again.');
          setTimeout(() => {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
          }, 2000);
          return;
        }
        
        throw new Error(error.detail || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload successful:', data);

      setIsSaving(false);
      setSuccess(`Check-in saved successfully! 🎉 Task ID: ${data.task_id}`);
      
      setTimeout(() => {
        handleClose();
      }, 3000);
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
    // Clear timer on close
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    onClose();
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
            <div className="mb-4">
              <Alert type="error" message={error} />
            </div>
          )}

          {success && (
            <div className="mb-4">
              <Alert type="success" message={success} />
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
              <div className="flex items-center gap-4">
                <div className="text-white font-mono text-2xl font-bold">
                  {formatTime(timeRemaining)}
                </div>
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-full font-semibold text-white transition-colors shadow-lg"
                >
                  <Square size={18} fill="white" />
                  <span>STOP</span>
                </button>
              </div>
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

