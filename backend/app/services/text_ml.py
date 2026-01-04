from functools import lru_cache
from transformers import pipeline
import logging

logger = logging.getLogger(__name__)

@lru_cache(maxsize=1)
def get_emotion_model():
    try:
        logger.info("🔄 Loading multilingual emotion model...")
        # English + Hindi + Malay + More [web:158]
        model = pipeline(
            "text-classification", 
            model="rmtariq/multilingual-emotion-classifier"
        )
        logger.info("✅ Multilingual model ready! (Hindi/English)")
        return model
    except Exception as e:
        logger.error(f"❌ Model failed: {e}")
        return None

def _keyword_fallback(text):
    """Keyword-based emotion detection for Hindi/Hinglish"""
    text_lower = text.lower()
    
    # hindi/hinglish stress/anger keywords
    stress_keywords = ['stress', 'chillaya', 'daanta', 'tension', 'gussa', 'angry', 'yelled', 'maar', 'killing', 'frustrated']
    sad_keywords = ['sad', 'udas', 'depressed', 'dukhi', 'rona', 'cry', 'padhai nahi', 'upset']
    happy_keywords = ['khush', 'happy', 'mast', 'mazaa', 'accha', 'great', 'amazing', 'achha', 'feeling good', 'badhiya']
    fear_keywords = ['dar', 'scared', 'darr', 'exam', 'test', 'deadline', 'fail', 'worried']
    
    if any(word in text_lower for word in stress_keywords):
        return "anger", 0.75
    elif any(word in text_lower for word in sad_keywords):
        return "sadness", 0.75
    elif any(word in text_lower for word in happy_keywords):
        return "happy", 0.75
    elif any(word in text_lower for word in fear_keywords):
        return "fear", 0.75
    else:
        return "neutral", 0.65

def analyze_emotion(text):
    model = get_emotion_model()
    if model is None:
        # fallback
        emotion, confidence = _keyword_fallback(text)
        negative_emotions = ['anger', 'sadness', 'fear', 'disgust']
        positive_emotions = ['happy', 'joy', 'surprise']
        sentiment = "negative" if emotion in negative_emotions else "positive" if emotion in positive_emotions else "neutral"
        return {"emotion": emotion, "confidence": confidence, "sentiment": sentiment, "fallback": True}
    
    # ml analysis (works with hindi/english/hinglish)
    result = model(text)[0]
    emotion = result['label'].lower()
    confidence = round(result['score'], 2)
    
    # hybrid approach: always check keywords first for common patterns
    keyword_emotion, keyword_conf = _keyword_fallback(text)
    
    # use keyword result if:
    # 1. ml confidence is low (< 75%), OR
    # 2. keyword found something specific (not neutral)
    if confidence < 0.75 or (keyword_emotion != "neutral" and confidence < 0.95):
        emotion = keyword_emotion
        confidence = keyword_conf
    
    # map sentiment based on emotion
    # note: model returns "happy" not "joy"
    negative_emotions = ['anger', 'sadness', 'fear', 'disgust']
    positive_emotions = ['happy', 'joy', 'surprise']
    sentiment = "negative" if emotion in negative_emotions else "positive" if emotion in positive_emotions else "neutral"
    
    return {
        "emotion": emotion,
        "confidence": confidence,
        "sentiment": sentiment
    }

def generate_reply(analysis, text):
    emotion = analysis["emotion"]
    
    # emotion-specific replies (works for hindi/english/hinglish)
    # note: model returns "happy" not "joy"
    if emotion == "anger":
        return "Sounds really heavy. Want a quick breathing exercise or to break this down?"
    elif emotion == "sadness":
        return "I'm sorry you're feeling this way. What's one small thing that might help today?"
    elif emotion == "fear":
        return "I hear the worry in your words. Let's take it one step at a time. What's your biggest concern right now?"
    elif emotion == "happy" or emotion == "joy":
        return "It's wonderful to hear that! What's bringing you joy today?"
    elif emotion == "surprise":
        return "That sounds unexpected! Tell me more about what happened."
    elif emotion == "disgust":
        return "That must be really uncomfortable. Want to talk about what's bothering you?"
    else:
        return f"I hear {emotion} in what you're saying. Anything specific on your mind?"
