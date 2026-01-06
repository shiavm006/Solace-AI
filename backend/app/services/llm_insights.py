import httpx
from typing import Dict, Any, List, Optional
import logging
import asyncio
from app.config import settings

logger = logging.getLogger(__name__)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = settings.GROQ_API_KEY
GROQ_MODEL = "llama-3.1-8b-instant"

async def generate_insights(
    metrics: Dict[str, Any],
    notes: Optional[str] = None,
    employee_name: str = "Employee"
) -> Dict[str, Any]:
    """
    Generate intelligent insights from check-in metrics using Groq (free LLM API)
    
    Args:
        metrics: Dictionary containing analysis metrics (stress, yawns, engagement, etc.)
        notes: Optional employee notes from check-in
        employee_name: Employee's name for personalization
    
    Returns:
        Dictionary with summary and action items
    """
    
    if not GROQ_API_KEY:
        logger.warning("GROQ_API_KEY not found, using fallback insights")
        return generate_fallback_insights(metrics, notes)
    
    try:
        audio = metrics.get('audio', {})
        has_audio = audio.get('has_audio', False)
        
        context = f"""You are an AI wellness coach analyzing a daily check-in for {employee_name}.

Video Analysis Metrics:
- Stress Level (Average): {metrics.get('stress_avg', 0):.1f}%
- Stress Level (Max): {metrics.get('stress_max', 0):.1f}%
- Stress Level (Min): {metrics.get('stress_min', 0):.1f}%
- Yawns Detected: {metrics.get('yawns_count', 0)}
- Engagement Score: {metrics.get('engagement_score', 0):.1f}%
- Head Pose Variance: {metrics.get('head_pose_variance', 0):.2f}
- Video Duration: {metrics.get('duration_seconds', 0):.1f} seconds
- Face Detected: {metrics.get('face_detected', True)}
"""
        
        if has_audio and audio.get('transcript'):
            context += f"""
Audio Analysis:
- Transcript: "{audio.get('transcript', '')[:300]}"{'...' if len(audio.get('transcript', '')) > 300 else ''}
- Word Count: {audio.get('word_count', 0)} words
- Speaking Pace: {audio.get('speaking_pace_wpm', 0)} words/min (Normal: 120-150 wpm)
- Voice Energy: {audio.get('voice_energy', 0):.2f} (0=quiet, 1=loud)
- Pitch Variance: {audio.get('pitch_variance', 0):.2f} (higher = more stress in voice)
- Hesitations/Pauses: {audio.get('pauses_count', 0)} long pauses
- Overall Sentiment: {audio.get('sentiment', 'neutral')}
"""
        
        if notes:
            context += f"\nEmployee's Notes: {notes}\n"
        
        context += """
Provide:
1. A brief, empathetic summary (2-3 sentences)
2. 3-5 specific, actionable recommendations

Format as:
SUMMARY: [your summary]
ACTIONS:
- [action 1]
- [action 2]
- [action 3]
"""
        
        max_retries = 3
        retry_delay = 1
        
        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        GROQ_API_URL,
                        headers={
                            "Authorization": f"Bearer {GROQ_API_KEY}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": GROQ_MODEL,
                            "messages": [
                                {
                                    "role": "system",
                                    "content": "You are a compassionate AI wellness coach specializing in employee wellbeing. Your insights should be professional, supportive, and actionable."
                                },
                                {
                                    "role": "user",
                                    "content": context
                                }
                            ],
                            "temperature": 0.7,
                            "max_tokens": 400
                        }
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        ai_response = result["choices"][0]["message"]["content"].strip()
                        
                        summary, actions = parse_llm_response(ai_response, metrics)
                        
                        logger.info(f"Successfully generated Groq insights for {employee_name}")
                        
                        return {
                            "summary": summary,
                            "actions": actions
                        }
                    elif response.status_code == 429:
                        logger.warning(f"Groq API rate limit (attempt {attempt + 1}/{max_retries})")
                        if attempt < max_retries - 1:
                            await asyncio.sleep(retry_delay * (attempt + 1))
                            continue
                    elif response.status_code >= 500:
                        logger.warning(f"Groq API server error: {response.status_code} (attempt {attempt + 1}/{max_retries})")
                        if attempt < max_retries - 1:
                            await asyncio.sleep(retry_delay)
                            continue
                    else:
                        logger.warning(f"Groq API error: {response.status_code} - {response.text}")
                        return generate_fallback_insights(metrics, notes)
                        
            except httpx.TimeoutException:
                logger.warning(f"Groq API timeout (attempt {attempt + 1}/{max_retries})")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay)
                    continue
            except httpx.RequestError as e:
                logger.warning(f"Groq API request error: {e} (attempt {attempt + 1}/{max_retries})")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay)
                    continue
        
        logger.error("All Groq API retry attempts failed, using fallback insights")
        return generate_fallback_insights(metrics, notes)
        
    except Exception as e:
        logger.error(f"Error generating Groq insights: {e}", exc_info=True)
        return generate_fallback_insights(metrics, notes)

def parse_llm_response(response: str, metrics: Dict[str, Any]) -> tuple[str, List[str]]:
    """
    Parse LLM response to extract summary and action items
    
    Args:
        response: Raw LLM response text
        metrics: Metrics dict (for fallback)
    
    Returns:
        Tuple of (summary, actions_list)
    """
    lines = response.strip().split('\n')
    summary_lines = []
    actions = []
    
    in_summary = False
    in_actions = False
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        if line.upper().startswith('SUMMARY'):
            in_summary = True
            in_actions = False
            text = line.split(':', 1)[1].strip() if ':' in line else ''
            if text:
                summary_lines.append(text)
            continue
        
        if line.upper().startswith('ACTIONS') or line.upper().startswith('RECOMMENDATIONS'):
            in_summary = False
            in_actions = True
            continue
        
        if in_actions and any(line.startswith(prefix) for prefix in ['•', '-', '*', '1.', '2.', '3.', '4.', '5.']):
            action = line.lstrip('•-*123456789. ').strip()
            if action:
                actions.append(action)
        elif in_summary:
            summary_lines.append(line)
        elif not in_summary and not in_actions:
            summary_lines.append(line)
    
    summary = ' '.join(summary_lines) if summary_lines else generate_fallback_summary(metrics)
    
    if not actions:
        actions = generate_fallback_actions(metrics)
    
    return summary, actions

def generate_fallback_summary(metrics: Dict[str, Any]) -> str:
    if not metrics.get("face_detected", False):
        return "No face detected in video. Please ensure good lighting and camera positioning for accurate analysis."
    
    stress_avg = metrics.get('stress_avg', 0)
    yawns = metrics.get('yawns_count', 0)
    engagement = metrics.get('engagement_score', 0)
    
    summary = f"Detected {yawns} yawns. "
    summary += f"Average stress level: {stress_avg:.1f}%. "
    summary += f"Engagement score: {engagement:.1f}%."
    
    audio = metrics.get('audio', {})
    if audio.get('has_audio', False):
        word_count = audio.get('word_count', 0)
        sentiment = audio.get('sentiment', 'neutral')
        summary += f" Spoke {word_count} words with {sentiment} sentiment."
    
    return summary

def generate_fallback_actions(metrics: Dict[str, Any]) -> List[str]:
    actions = []
    
    stress_avg = metrics.get('stress_avg', 0)
    yawns = metrics.get('yawns_count', 0)
    engagement = metrics.get('engagement_score', 0)
    
    if stress_avg > 70:
        actions.append("Consider stress management techniques like deep breathing or short breaks")
    if yawns > 5:
        actions.append("Ensure adequate rest and sleep to maintain alertness")
    if engagement < 50:
        actions.append("Take regular breaks to maintain focus and productivity")
    
    audio = metrics.get('audio', {})
    if audio.get('has_audio', False):
        pace = audio.get('speaking_pace_wpm', 0)
        pauses = audio.get('pauses_count', 0)
        sentiment = audio.get('sentiment', 'neutral')
        
        if pace > 160:
            actions.append("Speaking pace was fast. Try slowing down and taking deeper breaths to reduce anxiety")
        if pauses > 5:
            actions.append("Multiple hesitations detected. Consider preparing talking points before check-ins")
        if sentiment == 'negative':
            actions.append("Detected negative sentiment. Consider discussing challenges with your team or manager")
    
    if not actions:
        actions.append("Keep up the good work! Maintain your current wellbeing practices")
    
    return actions

def generate_fallback_insights(metrics: Dict[str, Any], notes: Optional[str] = None) -> Dict[str, Any]:
    """
    Generate simple rule-based insights when LLM is not available
    
    Args:
        metrics: Analysis metrics
        notes: Optional employee notes
    
    Returns:
        Dictionary with summary and actions
    """
    summary = generate_fallback_summary(metrics)
    actions = generate_fallback_actions(metrics)
    
    return {
        "summary": summary,
        "actions": actions
    }

