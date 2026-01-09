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


            emotions = audio.get('emotions', {})

            dominant_emotion = audio.get('dominant_emotion', 'neutral')

            sentiment_confidence = audio.get('sentiment_confidence', 0.5)

            

            emotion_details = ""

            if emotions:

                top_emotions = sorted(emotions.items(), key=lambda x: x[1], reverse=True)[:3]

                emotion_details = f"Top emotions: {', '.join([f'{e[0]} ({e[1]:.2f})' for e in top_emotions])}"

            

            context += f"""
Audio Analysis:
- Transcript: "{audio.get('transcript', '')[:300]}"{'...' if len(audio.get('transcript', '')) > 300 else ''}
- Word Count: {audio.get('word_count', 0)} words
- Speaking Pace: {audio.get('speaking_pace_wpm', 0)} words/min (Normal: 120-150 wpm)
- Voice Energy: {audio.get('voice_energy', 0):.2f} (0=quiet, 1=loud)
- Pitch Variance: {audio.get('pitch_variance', 0):.2f} (higher = more stress in voice)
- Hesitations/Pauses: {audio.get('pauses_count', 0)} long pauses
- Overall Sentiment: {audio.get('sentiment', 'neutral')} (confidence: {sentiment_confidence:.2f})
- Dominant Emotion: {dominant_emotion}
{emotion_details}
"""

        

        if notes:

            context += f"\nEmployee's Notes: {notes}\n"

        

        context += """
Based on the analysis above, provide a comprehensive qualitative assessment in narrative form. Write as if you observed the employee personally. Focus on:

1. OVERALL_EXPERIENCE: How was their overall experience during this check-in? What was their general demeanor and state of mind? (2-3 sentences)

2. EMOTIONAL_STATE: What emotions were evident? How was their emotional well-being? Describe their mood and emotional presence. (2-3 sentences)

3. WORK_MOTIVATION: How motivated and engaged do they appear? What does their energy level suggest about their work motivation? (2-3 sentences)

4. PROFESSIONAL_APPEARANCE: Comment on their professional appearance and office ethics. How did they present themselves? (2-3 sentences)

5. AI_OBSERVATIONS: What specific behaviors, patterns, or signals did the AI analysis reveal? What predictions can be made about their current state? (2-3 sentences)

6. RECOMMENDATIONS: 3-5 specific, actionable recommendations based on observations.

Write in a professional, empathetic, narrative style. NO NUMBERS OR METRICS. Focus on qualitative observations and human insights.

Format as:
OVERALL_EXPERIENCE: [narrative description]
EMOTIONAL_STATE: [narrative description]
WORK_MOTIVATION: [narrative description]
PROFESSIONAL_APPEARANCE: [narrative description]
AI_OBSERVATIONS: [narrative description]
RECOMMENDATIONS:
- [recommendation 1]
- [recommendation 2]
- [recommendation 3]
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

                            "max_tokens": 800

                        }

                    )

                    

                    if response.status_code == 200:

                        result = response.json()

                        ai_response = result["choices"][0]["message"]["content"].strip()

                        

                        insights_dict = parse_llm_response(ai_response, metrics)

                        

                        logger.info(f"Successfully generated Groq insights for {employee_name}")

                        

                        return insights_dict

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



def parse_llm_response(response: str, metrics: Dict[str, Any]) -> Dict[str, Any]:

    """
    Parse LLM response to extract all qualitative insights
    
    Args:
        response: Raw LLM response text
        metrics: Metrics dict (for fallback)
    
    Returns:
        Dictionary with all insight sections
    """

    lines = response.strip().split('\n')

    

    sections = {

        "overall_experience": "",

        "emotional_state": "",

        "work_motivation": "",

        "professional_appearance": "",

        "ai_observations": "",

        "recommendations": []

    }

    

    current_section = None

    current_text = []

    

    for line in lines:

        line = line.strip()

        if not line:

            continue

        


        if line.upper().startswith('OVERALL_EXPERIENCE'):

            if current_section and current_text:

                sections[current_section] = ' '.join(current_text).strip()

            current_section = "overall_experience"

            text = line.split(':', 1)[1].strip() if ':' in line else ''

            current_text = [text] if text else []

            continue

        

        if line.upper().startswith('EMOTIONAL_STATE'):

            if current_section and current_text:

                sections[current_section] = ' '.join(current_text).strip()

            current_section = "emotional_state"

            text = line.split(':', 1)[1].strip() if ':' in line else ''

            current_text = [text] if text else []

            continue

        

        if line.upper().startswith('WORK_MOTIVATION'):

            if current_section and current_text:

                sections[current_section] = ' '.join(current_text).strip()

            current_section = "work_motivation"

            text = line.split(':', 1)[1].strip() if ':' in line else ''

            current_text = [text] if text else []

            continue

        

        if line.upper().startswith('PROFESSIONAL_APPEARANCE'):

            if current_section and current_text:

                sections[current_section] = ' '.join(current_text).strip()

            current_section = "professional_appearance"

            text = line.split(':', 1)[1].strip() if ':' in line else ''

            current_text = [text] if text else []

            continue

        

        if line.upper().startswith('AI_OBSERVATIONS'):

            if current_section and current_text:

                sections[current_section] = ' '.join(current_text).strip()

            current_section = "ai_observations"

            text = line.split(':', 1)[1].strip() if ':' in line else ''

            current_text = [text] if text else []

            continue

        

        if line.upper().startswith('RECOMMENDATIONS'):

            if current_section and current_text:

                sections[current_section] = ' '.join(current_text).strip()

            current_section = None

            continue

        


        if current_section:

            if line.startswith('-') or line.startswith('•') or line.startswith('*'):


                if current_section == "recommendations" or current_section is None:

                    sections["recommendations"].append(line.lstrip('- •*').strip())

                else:


                    current_text.append(line)

            else:

                current_text.append(line)

        elif line.startswith('-') or line.startswith('•') or line.startswith('*'):


            sections["recommendations"].append(line.lstrip('- •*').strip())

    


    if current_section and current_text:

        sections[current_section] = ' '.join(current_text).strip()

    


    if not any(sections.values()) and not sections["recommendations"]:

        return generate_fallback_insights(metrics, None)

    


    if not sections["overall_experience"]:

        sections["overall_experience"] = "The employee appeared calm and engaged during the check-in, showing positive energy and focus."

    if not sections["emotional_state"]:

        sections["emotional_state"] = "Emotional state appears balanced and positive, with good energy levels."

    if not sections["work_motivation"]:

        sections["work_motivation"] = "Work motivation appears high, with strong engagement and active participation."

    if not sections["professional_appearance"]:

        sections["professional_appearance"] = "Professional presentation was maintained throughout the check-in."

    if not sections["ai_observations"]:

        sections["ai_observations"] = "AI analysis detected standard behavioral patterns consistent with a routine check-in."

    if not sections["recommendations"]:

        sections["recommendations"] = [

            "Continue maintaining regular check-ins",

            "Monitor overall well-being trends",

            "Stay engaged with work activities"

        ]

    

    return sections



def generate_fallback_insights(metrics: Dict[str, Any], notes: Optional[str] = None) -> Dict[str, Any]:

    """
    Generate qualitative fallback insights when LLM is not available
    
    Args:
        metrics: Analysis metrics
        notes: Optional employee notes
    
    Returns:
        Dictionary with all qualitative insight sections
    """

    stress_avg = metrics.get('stress_avg', 50)

    engagement = metrics.get('engagement_score', 50)

    yawns = metrics.get('yawns_count', 0)

    


    if stress_avg < 40 and engagement >= 70:

        overall_exp = "The employee appeared calm and engaged during the check-in, showing positive energy and focus. Their demeanor suggested a comfortable and confident state of mind."

        emotional = "Emotional state appears balanced and positive, with good energy levels and a sense of well-being evident throughout the session."

        motivation = "Work motivation appears high, with strong engagement and active participation. The employee demonstrated enthusiasm and commitment to their work."

    elif stress_avg < 70 and engagement >= 40:

        overall_exp = "The check-in showed moderate engagement with some signs of normal work-related stress. The employee maintained a professional demeanor while showing typical workplace energy levels."

        emotional = "Emotional state is generally stable, though some stress indicators were present. The employee managed their emotions well while navigating work demands."

        motivation = "Work motivation is at a moderate level, with consistent participation and engagement. The employee shows dedication but may benefit from additional support."

    else:

        overall_exp = "The check-in revealed elevated stress levels and reduced engagement, suggesting potential concerns. The employee appeared less comfortable and may be experiencing challenges."

        emotional = "Emotional state shows signs of stress and may benefit from support and attention. The employee's emotional well-being appears to need monitoring and care."

        motivation = "Work motivation appears lower than optimal, with reduced engagement levels. The employee may be experiencing factors affecting their work enthusiasm."

    


    professional = "Professional appearance and office ethics were maintained throughout the session. The employee presented themselves appropriately for the workplace environment."

    


    ai_obs_parts = []

    if yawns > 5:

        ai_obs_parts.append("The analysis detected signs of fatigue")

    if stress_avg > 70:

        ai_obs_parts.append("elevated stress indicators were observed")

    if engagement < 50:

        ai_obs_parts.append("engagement levels were lower than typical")

    

    if ai_obs_parts:

        ai_obs = f"AI analysis detected patterns indicating {', '.join(ai_obs_parts)}. These observations suggest the employee may benefit from wellness support and attention to their work-life balance."

    else:

        ai_obs = "AI analysis detected standard behavioral patterns consistent with a routine check-in. The employee's patterns align with healthy work engagement."

    


    recommendations = []

    if stress_avg > 70:

        recommendations.append("Consider stress management techniques like deep breathing exercises or short breaks throughout the day")

    if yawns > 5:

        recommendations.append("Ensure adequate rest and sleep to maintain alertness and productivity")

    if engagement < 50:

        recommendations.append("Take regular breaks to maintain focus and consider discussing workload with your supervisor")

    

    audio = metrics.get('audio', {})

    if audio.get('has_audio', False):

        sentiment = audio.get('sentiment', 'neutral')

        if sentiment == 'negative':

            recommendations.append("Consider discussing challenges with your team or manager to address concerns")

    

    if not recommendations:

        recommendations = [

            "Continue maintaining regular check-ins",

            "Monitor overall well-being trends",

            "Stay engaged with work activities"

        ]

    

    return {

        "overall_experience": overall_exp,

        "emotional_state": emotional,

        "work_motivation": motivation,

        "professional_appearance": professional,

        "ai_observations": ai_obs,

        "recommendations": recommendations

    }



