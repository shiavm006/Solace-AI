import whisper
import librosa
import numpy as np
from typing import Dict, Any
import logging
import os
from pathlib import Path
import asyncio

logger = logging.getLogger(__name__)

WHISPER_MODEL = None

def init_whisper():
    global WHISPER_MODEL
    if WHISPER_MODEL is None:
        logger.info("Loading Whisper model (base)...")
        try:
            WHISPER_MODEL = whisper.load_model("base")
            logger.info("✅ Whisper model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            raise

async def analyze_audio(video_path: str) -> Dict[str, Any]:
    """
    Extract and analyze audio from video
    
    Args:
        video_path: Path to video file (with audio)
    
    Returns:
        Dictionary with audio analysis metrics:
        - transcript: What was said
        - sentiment: Positive/Negative/Neutral
        - speaking_pace_wpm: Words per minute
        - voice_energy: Average loudness
        - pauses_count: Number of long pauses (hesitation)
        - word_count: Total words spoken
        - pitch_variance: Voice pitch variance (stress indicator)
    """
    try:
        if WHISPER_MODEL is None:
            init_whisper()
        
        logger.info(f"🎤 Starting audio analysis for {video_path}")
        
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, 
            lambda: WHISPER_MODEL.transcribe(
                video_path,
                language="en",
                fp16=False,
                verbose=False
            )
        )
        
        transcript = result["text"].strip()
        segments = result.get("segments", [])
        
        logger.info(f"📝 Transcript: {transcript[:100]}..." if len(transcript) > 100 else f"📝 Transcript: {transcript}")
        
        total_words = len(transcript.split()) if transcript else 0
        duration = segments[-1]["end"] if segments else 0
        speaking_pace = (total_words / duration * 60) if duration > 0 else 0
        
        pauses = 0
        if len(segments) > 1:
            for i in range(1, len(segments)):
                gap = segments[i]["start"] - segments[i-1]["end"]
                if gap > 1.0:
                    pauses += 1
        
        try:
            audio, sr = librosa.load(video_path, sr=16000, duration=60)
            
            rms = librosa.feature.rms(y=audio)[0]
            voice_energy = float(np.mean(rms))
            
            pitches, magnitudes = librosa.piptrack(y=audio, sr=sr)
            pitch_values = []
            for t in range(pitches.shape[1]):
                index = magnitudes[:, t].argmax()
                pitch = pitches[index, t]
                if pitch > 0:
                    pitch_values.append(pitch)
            
            pitch_variance = float(np.std(pitch_values)) if pitch_values else 0
        except Exception as audio_feature_error:
            logger.warning(f"Could not extract audio features: {audio_feature_error}")
            voice_energy = 0
            pitch_variance = 0
        
        sentiment = analyze_sentiment(transcript)
        
        logger.info(f"✅ Audio analysis complete: {total_words} words, pace={speaking_pace:.1f} wpm, sentiment={sentiment}")
        
        return {
            "transcript": transcript,
            "word_count": total_words,
            "speaking_pace_wpm": round(speaking_pace, 1),
            "voice_energy": round(voice_energy, 3),
            "pitch_variance": round(pitch_variance, 2),
            "pauses_count": pauses,
            "sentiment": sentiment,
            "duration_seconds": round(duration, 2),
            "has_audio": len(transcript) > 0
        }
    
    except Exception as e:
        logger.error(f"❌ Error analyzing audio: {e}", exc_info=True)
        return {
            "transcript": "",
            "word_count": 0,
            "speaking_pace_wpm": 0,
            "voice_energy": 0,
            "pitch_variance": 0,
            "pauses_count": 0,
            "sentiment": "neutral",
            "duration_seconds": 0,
            "has_audio": False,
            "error": str(e)
        }

def analyze_sentiment(text: str) -> str:
    """
    Simple keyword-based sentiment analysis
    (Can be replaced with proper NLP model like BERT)
    
    Args:
        text: Transcript text
    
    Returns:
        "positive", "negative", or "neutral"
    """
    if not text:
        return "neutral"
    
    positive_words = [
        "good", "great", "excited", "happy", "productive", "accomplished", 
        "progress", "excellent", "amazing", "love", "enjoy", "smooth", 
        "successful", "confident", "motivated", "energized", "focused"
    ]
    
    negative_words = [
        "stressed", "tired", "blocked", "frustrated", "difficult", "problem", 
        "issue", "confused", "stuck", "worried", "anxious", "overwhelmed",
        "exhausted", "struggling", "concerned", "challenging", "hard"
    ]
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count + 1:
        return "positive"
    elif negative_count > positive_count + 1:
        return "negative"
    else:
        return "neutral"

def get_sentiment_emoji(sentiment: str) -> str:
    if sentiment == "positive":
        return "😊"
    elif sentiment == "negative":
        return "😟"
    else:
        return "😐"


