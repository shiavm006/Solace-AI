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
    Generate a qualitative PDF report for a check-in (NO NUMERICAL METRICS)
    Shows only narrative observations and insights about the employee's experience,
    emotional state, work motivation, professional appearance, and AI observations.
    
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

        

        logger.info(f"Generating qualitative PDF report: {pdf_path}")

        

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

            ["Check-in Time:", datetime.fromisoformat(str(checkin_data.get("date", datetime.now()))).strftime("%I:%M %p")]

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

        elements.append(Spacer(1, 0.4*inch))

        


        insights = checkin_data.get("insights", {})

        


        narrative_style = ParagraphStyle(

            'NarrativeStyle',

            parent=normal_style,

            fontSize=11,

            textColor=colors.HexColor("#374151"),

            spaceAfter=12,

            leading=16,

            alignment=TA_LEFT

        )

        


        elements.append(Paragraph("Overall Experience", heading_style))

        overall_exp = insights.get("overall_experience", "Analysis indicates a standard check-in session with typical engagement patterns.")

        elements.append(Paragraph(overall_exp, narrative_style))

        elements.append(Spacer(1, 0.3*inch))

        


        elements.append(Paragraph("Emotional State & Well-being", heading_style))

        emotional_state = insights.get("emotional_state", "Emotional state appears balanced and stable.")

        elements.append(Paragraph(emotional_state, narrative_style))

        elements.append(Spacer(1, 0.3*inch))

        


        elements.append(Paragraph("Work Motivation & Engagement", heading_style))

        work_motivation = insights.get("work_motivation", "Work motivation levels appear consistent with normal work patterns.")

        elements.append(Paragraph(work_motivation, narrative_style))

        elements.append(Spacer(1, 0.3*inch))

        


        elements.append(Paragraph("Professional Appearance & Office Ethics", heading_style))

        professional = insights.get("professional_appearance", "Professional presentation was maintained throughout the check-in session.")

        elements.append(Paragraph(professional, narrative_style))

        elements.append(Spacer(1, 0.3*inch))

        


        elements.append(Paragraph("AI Analysis & Observations", heading_style))

        ai_obs = insights.get("ai_observations", "AI analysis detected standard behavioral patterns consistent with a routine check-in.")

        elements.append(Paragraph(ai_obs, narrative_style))

        elements.append(Spacer(1, 0.3*inch))

        


        audio = checkin_data.get("metrics", {}).get("audio", {})

        if audio.get("has_audio", False) and audio.get("transcript"):

            elements.append(Paragraph("What Was Said", heading_style))

            transcript_style = ParagraphStyle(

                'TranscriptStyle',

                parent=narrative_style,

                fontSize=10,

                textColor=colors.HexColor("#4b5563"),

                leftIndent=20,

                rightIndent=20,

                fontStyle='italic'

            )

            elements.append(Paragraph(f'"{audio.get("transcript", "")}"', transcript_style))

            elements.append(Spacer(1, 0.3*inch))

        


        recommendations = insights.get("recommendations", [])

        if recommendations:

            elements.append(Paragraph("Recommendations", heading_style))

            for rec in recommendations:

                elements.append(Paragraph(f"• {rec}", narrative_style))

            elements.append(Spacer(1, 0.3*inch))

        


        notes = checkin_data.get("notes", "")

        if notes:

            elements.append(Paragraph("Employee Notes", heading_style))

            elements.append(Paragraph(notes, narrative_style))

            elements.append(Spacer(1, 0.3*inch))

        

        elements.append(Spacer(1, 0.3*inch))

        footer_text = "This report was automatically generated by Solace AI based on qualitative analysis. For questions or concerns, please contact your supervisor."

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



