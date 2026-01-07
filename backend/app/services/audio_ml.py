import whisper
import librosa
import numpy as np
from typing import Dict, Any
import logging
import os
from pathlib import Path
import asyncio
import warnings

warnings.filterwarnings("ignore", category=FutureWarning, module="librosa")
warnings.filterwarnings("ignore", message=".*pkg_resources.*", category=UserWarning)

logger = logging.getLogger(__name__)

WHISPER_MODEL = None
SENTIMENT_ANALYZER = None
EMOTION_ANALYZER = None

def init_whisper():
    global WHISPER_MODEL
    if WHISPER_MODEL is None:
        import os
        model_size = os.environ.get("WHISPER_MODEL_SIZE", "base")
        logger.info(f"Loading Whisper model ({model_size})...")
        try:
            WHISPER_MODEL = whisper.load_model(model_size)
            logger.info(f"✅ Whisper model ({model_size}) loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            raise

def init_sentiment_models():
    """Initialize sentiment and emotion analysis models on startup"""
    global SENTIMENT_ANALYZER, EMOTION_ANALYZER
    
    if SENTIMENT_ANALYZER is None:
        try:
            from transformers import pipeline
            logger.info("🔄 Loading sentiment analysis model (DistilBERT)...")
            SENTIMENT_ANALYZER = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english",
                device=-1  # Use CPU (-1) or GPU (0, 1, etc.)
            )
            logger.info("✅ Sentiment analysis model loaded successfully (DistilBERT)")
        except Exception as e:
            logger.warning(f"⚠️ Failed to load sentiment model, using fallback: {e}")
            SENTIMENT_ANALYZER = None
    
    if EMOTION_ANALYZER is None:
        try:
            from transformers import pipeline
            logger.info("🔄 Loading emotion detection model (DistilRoBERTa)...")
            EMOTION_ANALYZER = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                device=-1,
                top_k=None  # Return all emotions with scores
            )
            logger.info("✅ Emotion detection model loaded successfully (7 emotions)")
        except Exception as e:
            logger.warning(f"⚠️ Failed to load emotion model: {e}")
            EMOTION_ANALYZER = None

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
            # Suppress librosa warnings for cleaner logs
            import warnings
            with warnings.catch_warnings():
                warnings.filterwarnings("ignore", category=FutureWarning)
                warnings.filterwarnings("ignore", category=UserWarning)
                warnings.filterwarnings("ignore", message="PySoundFile failed")
                warnings.filterwarnings("ignore", message=".*audioread.*")
                
                try:
                    audio, sr = librosa.load(
                        video_path, 
                        sr=16000, 
                        duration=60,
                        res_type='kaiser_best'  # Better quality resampling (requires resampy)
                    )
                except (ImportError, ValueError) as resampy_error:
                    # Fallback to scipy resampling if resampy is not available
                    logger.debug(f"resampy not available, using scipy resampling: {resampy_error}")
                    audio, sr = librosa.load(
                        video_path, 
                        sr=16000, 
                        duration=60,
                        res_type='scipy'  # Fallback resampling method
                    )
            
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
        
        # Analyze sentiment and emotions using transformer models
        sentiment_result = analyze_sentiment(transcript)
        emotion_result = analyze_emotions(transcript)
        
        logger.info(f"✅ Audio analysis complete: {total_words} words, pace={speaking_pace:.1f} wpm, sentiment={sentiment_result.get('sentiment', 'neutral')}")
        
        return {
            "transcript": transcript,
            "word_count": total_words,
            "speaking_pace_wpm": round(speaking_pace, 1),
            "voice_energy": round(voice_energy, 3),
            "pitch_variance": round(pitch_variance, 2),
            "pauses_count": pauses,
            "sentiment": sentiment_result.get("sentiment", "neutral"),
            "sentiment_confidence": sentiment_result.get("confidence", 0.5),
            "emotions": emotion_result.get("emotions", {}),
            "dominant_emotion": emotion_result.get("dominant_emotion", "neutral"),
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
            "sentiment_confidence": 0.5,
            "emotions": {},
            "dominant_emotion": "neutral",
            "duration_seconds": 0,
            "has_audio": False,
            "error": str(e)
        }

def analyze_sentiment(text: str) -> Dict[str, Any]:
    """
    Advanced sentiment analysis using pre-trained transformer model (DistilBERT)
    Falls back to keyword-based if model not available
    
    Args:
        text: Transcript text
    
    Returns:
        Dictionary with sentiment, confidence, and label
    """
    if not text or len(text.strip()) < 3:
        return {
            "sentiment": "neutral",
            "confidence": 0.5,
            "label": "NEUTRAL",
            "method": "fallback"
        }
    
    # Try transformer model first
    global SENTIMENT_ANALYZER
    if SENTIMENT_ANALYZER is None:
        init_sentiment_models()
    
    if SENTIMENT_ANALYZER is not None:
        try:
            # Truncate to model's max length (512 tokens)
            text_truncated = text[:512] if len(text) > 512 else text
            
            result = SENTIMENT_ANALYZER(text_truncated)[0]
            
            # Map model output to our format
            label = result['label'].upper()
            confidence = result['score']
            
            # Convert LABEL to sentiment (POSITIVE/NEGATIVE -> positive/negative)
            sentiment = "positive" if "POSITIVE" in label else "negative"
            
            # If confidence is low, treat as neutral
            if confidence < 0.6:
                sentiment = "neutral"
            
            return {
                "sentiment": sentiment,
                "confidence": round(confidence, 3),
                "label": label,
                "method": "transformer"
            }
        except Exception as e:
            logger.warning(f"Transformer sentiment analysis failed: {e}, using fallback")
    
    # Fallback to keyword-based analysis
    return analyze_sentiment_keyword(text)

def analyze_sentiment_keyword(text: str) -> Dict[str, Any]:
    """
    Fallback keyword-based sentiment analysis
    """
    positive_words = [
        "good", "great", "excited", "happy", "productive", "accomplished", 
        "progress", "excellent", "amazing", "love", "enjoy", "smooth", 
        "successful", "confident", "motivated", "energized", "focused",
        "wonderful", "fantastic", "pleased", "satisfied", "optimistic"
    ]
    
    negative_words = [
        "stressed", "tired", "blocked", "frustrated", "difficult", "problem", 
        "issue", "confused", "stuck", "worried", "anxious", "overwhelmed",
        "exhausted", "struggling", "concerned", "challenging", "hard",
        "terrible", "awful", "disappointed", "failing", "stuck"
    ]
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    total_matches = positive_count + negative_count
    if total_matches == 0:
        sentiment = "neutral"
        confidence = 0.5
    elif positive_count > negative_count:
        sentiment = "positive"
        confidence = min(0.9, 0.5 + (positive_count / max(total_matches, 1)) * 0.4)
    elif negative_count > positive_count:
        sentiment = "negative"
        confidence = min(0.9, 0.5 + (negative_count / max(total_matches, 1)) * 0.4)
    else:
        sentiment = "neutral"
        confidence = 0.5
    
    return {
        "sentiment": sentiment,
        "confidence": round(confidence, 3),
        "label": sentiment.upper(),
        "method": "keyword"
    }

def analyze_emotions(text: str) -> Dict[str, Any]:
    """
    Analyze emotions in text using pre-trained emotion detection model
    Detects: joy, sadness, anger, fear, surprise, disgust, neutral
    
    Args:
        text: Transcript text
    
    Returns:
        Dictionary with emotions, scores, and dominant emotion
    """
    if not text or len(text.strip()) < 3:
        return {
            "emotions": {},
            "dominant_emotion": "neutral",
            "method": "fallback"
        }
    
    global EMOTION_ANALYZER
    if EMOTION_ANALYZER is None:
        init_sentiment_models()
    
    if EMOTION_ANALYZER is not None:
        try:
            # Truncate to model's max length
            text_truncated = text[:512] if len(text) > 512 else text
            
            results = EMOTION_ANALYZER(text_truncated)
            
            # The pipeline returns a list of dictionaries when top_k=None
            # Each dict has 'label' and 'score' keys
            emotions = {}
            
            if isinstance(results, list) and len(results) > 0:
                # Process each result
                for item in results:
                    if isinstance(item, dict):
                        label = item.get('label', '').lower()
                        score = item.get('score', 0.0)
                        if label:
                            emotions[label] = round(score, 3)
                    elif isinstance(item, list) and len(item) > 0:
                        # Handle nested list format
                        if isinstance(item[0], dict):
                            label = item[0].get('label', '').lower()
                            score = item[0].get('score', 0.0)
                            if label:
                                emotions[label] = round(score, 3)
            elif isinstance(results, dict):
                # Single result (unexpected with top_k=None, but handle it)
                label = results.get('label', '').lower()
                score = results.get('score', 0.0)
                if label:
                    emotions[label] = round(score, 3)
            else:
                logger.warning(f"Unexpected emotion results format: {type(results)}")
                raise ValueError(f"Unexpected results type: {type(results)}")
            
            # Find dominant emotion
            if emotions:
                dominant_emotion = max(emotions.items(), key=lambda x: x[1])[0]
            else:
                dominant_emotion = "neutral"
                emotions = {"neutral": 1.0}
            
            return {
                "emotions": emotions,
                "dominant_emotion": dominant_emotion,
                "method": "transformer"
            }
        except Exception as e:
            logger.warning(f"Emotion analysis failed: {e}, using fallback", exc_info=True)
    
    # Fallback: return neutral
    return {
        "emotions": {"neutral": 1.0},
        "dominant_emotion": "neutral",
        "method": "fallback"
    }

def get_sentiment_emoji(sentiment: str) -> str:
    if sentiment == "positive":
        return "😊"
    elif sentiment == "negative":
        return "😟"
    else:
        return "😐"


