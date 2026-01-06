from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas
from datetime import datetime
from typing import Dict, Any, List
import os
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

PDF_DIR = Path("/tmp/solace_pdfs")
PDF_DIR.mkdir(parents=True, exist_ok=True)

def create_header(canvas_obj, doc):
    canvas_obj.saveState()
    canvas_obj.setFont('Helvetica-Bold', 16)
    canvas_obj.setFillColor(colors.HexColor("#10b981"))
    canvas_obj.drawString(inch, letter[1] - 0.5*inch, "Solace AI")
    canvas_obj.setFont('Helvetica', 10)
    canvas_obj.setFillColor(colors.black)
    canvas_obj.drawRightString(letter[0] - inch, letter[1] - 0.5*inch, 
                               f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    canvas_obj.line(inch, letter[1] - 0.6*inch, letter[0] - inch, letter[1] - 0.6*inch)
    canvas_obj.restoreState()

def create_footer(canvas_obj, doc):
    canvas_obj.saveState()
    canvas_obj.setFont('Helvetica', 8)
    canvas_obj.setFillColor(colors.grey)
    canvas_obj.drawCentredString(letter[0]/2, 0.5*inch, 
                                 f"Page {doc.page} | Solace AI - Employee Check-in Report")
    canvas_obj.restoreState()

def get_stress_color(stress: float) -> colors.Color:
    if stress < 40:
        return colors.HexColor("#10b981")
    elif stress < 70:
        return colors.HexColor("#f59e0b")
    else:
        return colors.HexColor("#ef4444")

def get_engagement_color(score: float) -> colors.Color:
    if score >= 70:
        return colors.HexColor("#10b981")
    elif score >= 40:
        return colors.HexColor("#f59e0b")
    else:
        return colors.HexColor("#ef4444")

async def generate_checkin_pdf(
    checkin_data: Dict[str, Any],
    emp_name: str,
    emp_email: str
) -> str:
    """
    Generate a PDF report for a check-in
    
    Args:
        checkin_data: Check-in document from database
        emp_name: Employee name
        emp_email: Employee email
    
    Returns:
        str: Path to generated PDF file
    """
    try:
        checkin_id = str(checkin_data.get("_id", "unknown"))
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        pdf_filename = f"checkin_{checkin_id}_{timestamp}.pdf"
        pdf_path = PDF_DIR / pdf_filename
        
        logger.info(f"Generating PDF report: {pdf_path}")
        
        doc = SimpleDocTemplate(
            str(pdf_path),
            pagesize=letter,
            rightMargin=inch,
            leftMargin=inch,
            topMargin=inch,
            bottomMargin=inch
        )
        
        elements = []
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor("#10b981"),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor("#1f2937"),
            spaceAfter=12,
            spaceBefore=12
        )
        normal_style = styles['Normal']
        
        elements.append(Paragraph("Daily Check-in Report", title_style))
        elements.append(Spacer(1, 0.2*inch))
        
        elements.append(Paragraph("Employee Information", heading_style))
        
        emp_info_data = [
            ["Name:", emp_name],
            ["Email:", emp_email],
            ["Check-in Date:", datetime.fromisoformat(str(checkin_data.get("date", datetime.now()))).strftime("%B %d, %Y")],
            ["Check-in Time:", datetime.fromisoformat(str(checkin_data.get("date", datetime.now()))).strftime("%I:%M %p")],
            ["Status:", checkin_data.get("status", "N/A").upper()]
        ]
        
        emp_table = Table(emp_info_data, colWidths=[2*inch, 4*inch])
        emp_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#f3f4f6")),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(emp_table)
        elements.append(Spacer(1, 0.3*inch))
        
        metrics = checkin_data.get("metrics", {})
        elements.append(Paragraph("Analysis Metrics", heading_style))
        
        metrics_data = [
            ["Metric", "Value", "Status"],
            ["Stress Level (Avg)", f"{metrics.get('stress_avg', 0):.1f}%", ""],
            ["Stress Level (Max)", f"{metrics.get('stress_max', 0):.1f}%", ""],
            ["Stress Level (Min)", f"{metrics.get('stress_min', 0):.1f}%", ""],
            ["Yawns Detected", str(metrics.get('yawns_count', 0)), ""],
            ["Engagement Score", f"{metrics.get('engagement_score', 0):.1f}%", ""],
            ["Head Pose Variance", f"{metrics.get('head_pose_variance', 0):.2f}", ""],
            ["Video Duration", f"{metrics.get('duration_seconds', 0):.1f}s", ""],
            ["Frames Processed", f"{metrics.get('frames_processed', 0)}/{metrics.get('total_frames', 0)}", ""],
        ]
        
        metrics_table = Table(metrics_data, colWidths=[2.5*inch, 2*inch, 1.5*inch])
        
        stress_avg = metrics.get('stress_avg', 0)
        engagement = metrics.get('engagement_score', 0)
        
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#10b981")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (1, 1), (1, -1), 'CENTER'),
            ('ALIGN', (2, 1), (2, -1), 'CENTER'),
            
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
        ]))
        
        elements.append(metrics_table)
        elements.append(Spacer(1, 0.3*inch))
        
        audio = metrics.get('audio', {})
        if audio.get('has_audio', False) and audio.get('transcript'):
            elements.append(Paragraph("🎤 Audio Analysis", heading_style))
            
            audio_data = [
                ["Metric", "Value"],
                ["Word Count", f"{audio.get('word_count', 0)} words"],
                ["Speaking Pace", f"{audio.get('speaking_pace_wpm', 0)} words/min"],
                ["Voice Energy", f"{audio.get('voice_energy', 0):.3f}"],
                ["Pitch Variance", f"{audio.get('pitch_variance', 0):.2f}"],
                ["Hesitations/Pauses", str(audio.get('pauses_count', 0))],
                ["Overall Sentiment", audio.get('sentiment', 'neutral').upper()],
            ]
            
            audio_table = Table(audio_data, colWidths=[2.5*inch, 3.5*inch])
            audio_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#8b5cf6")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                
                ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 1), (1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('ALIGN', (1, 1), (1, -1), 'LEFT'),
                
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f3f4f6")]),
            ]))
            
            elements.append(audio_table)
            elements.append(Spacer(1, 0.2*inch))
            
            transcript = audio.get('transcript', '')
            if transcript:
                elements.append(Paragraph("<b>Transcript:</b>", normal_style))
                elements.append(Spacer(1, 0.1*inch))
                
                transcript_style = ParagraphStyle(
                    'TranscriptStyle',
                    parent=normal_style,
                    fontSize=9,
                    textColor=colors.HexColor("#374151"),
                    leftIndent=20,
                    rightIndent=20,
                    spaceBefore=6,
                    spaceAfter=6
                )
                elements.append(Paragraph(f'"{transcript}"', transcript_style))
                elements.append(Spacer(1, 0.3*inch))
        
        insights = checkin_data.get("insights", {})
        elements.append(Paragraph("AI-Generated Insights", heading_style))
        
        summary = insights.get("summary", "No insights available.")
        elements.append(Paragraph(summary, normal_style))
        elements.append(Spacer(1, 0.2*inch))
        
        actions = insights.get("actions", [])
        if actions:
            elements.append(Paragraph("<b>Recommended Actions:</b>", normal_style))
            elements.append(Spacer(1, 0.1*inch))
            
            for i, action in enumerate(actions, 1):
                elements.append(Paragraph(f"• {action}", normal_style))
            
            elements.append(Spacer(1, 0.3*inch))
        
        notes = checkin_data.get("notes", "")
        if notes:
            elements.append(Paragraph("Employee Notes", heading_style))
            elements.append(Paragraph(notes, normal_style))
            elements.append(Spacer(1, 0.3*inch))
        
        elements.append(Spacer(1, 0.2*inch))
        
        if stress_avg < 40 and engagement >= 70:
            overall_status = "EXCELLENT"
            status_color = colors.HexColor("#10b981")
        elif stress_avg < 70 and engagement >= 40:
            overall_status = "GOOD"
            status_color = colors.HexColor("#f59e0b")
        else:
            overall_status = "NEEDS ATTENTION"
            status_color = colors.HexColor("#ef4444")
        
        summary_data = [
            [Paragraph(f"<b>Overall Status: {overall_status}</b>", normal_style)]
        ]
        
        summary_table = Table(summary_data, colWidths=[6*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), status_color),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 14),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BOX', (0, 0), (-1, -1), 2, colors.white),
        ]))
        
        elements.append(summary_table)
        
        elements.append(Spacer(1, 0.5*inch))
        footer_text = "This report was automatically generated by Solace AI. For questions or concerns, please contact your supervisor."
        footer_para = Paragraph(footer_text, ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_CENTER
        ))
        elements.append(footer_para)
        
        doc.build(elements, onFirstPage=create_header, onLaterPages=create_header)
        
        logger.info(f"PDF generated successfully: {pdf_path}")
        return str(pdf_path)
        
    except Exception as e:
        logger.error(f"Error generating PDF: {e}", exc_info=True)
        raise

