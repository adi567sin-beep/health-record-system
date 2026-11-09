import os
import re
from typing import List

from fastapi import FastAPI
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Health Record AI Service",
    version="2.0"
)

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is not set in .env")

client = genai.Client(api_key=api_key)



class MedicalRecord(BaseModel):
    sourceId: int = 0
    date: str
    hospital: str
    type: str
    title: str
    description: str = ""


class SummaryRequest(BaseModel):
    records: List[MedicalRecord]


class QuestionRequest(BaseModel):
    question: str
    records: List[MedicalRecord]


@app.get("/")
def home():
    return {
        "status": "AI Service Running",
        "provider": "Google Gemini"
    }



def call_gemini(prompt: str):

    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt
    )

    return response.text




@app.post("/summary")
def generate_summary(request: SummaryRequest):

    records_text = "\n\n".join(
        [
            f"""
[Source {record.sourceId}]
Date: {record.date}
Hospital: {record.hospital}
Type: {record.type}
Title: {record.title}
Description: {record.description}
"""
            for record in request.records
        ]
    )

    prompt = f"""
You are an AI medical record summarization assistant.

Analyze the following patient's medical records.

IMPORTANT RULES:

1. Use ONLY the information provided.
2. Do not invent diagnoses, medications, tests, or procedures.
3. Do not make a new medical diagnosis.
4. Give a concise and professional summary.
5. Mention the relevant hospital and date.
6. Clearly state when information is not available.

Medical Records:

{records_text}

Provide:

1. Overall medical history
2. Diagnoses
3. Medications
4. Laboratory tests
5. Procedures
6. Allergies
7. Important observations
"""

    answer = call_gemini(prompt)

    return {
        "summary": answer,
        "recordCount": len(request.records),
        "hospitals": list(
            set(record.hospital for record in request.records)
        ),
        "sources": [
            {
                "recordId": record.sourceId,
                "date": record.date,
                "hospital": record.hospital,
                "type": record.type,
                "title": record.title
            }
            for record in request.records
        ]
    }




@app.post("/ask")
def ask_question(request: QuestionRequest):

    records_text = "\n\n".join(
        [
            f"""
[Source {record.sourceId}]
Date: {record.date}
Hospital: {record.hospital}
Type: {record.type}
Title: {record.title}
Description: {record.description}
"""
            for record in request.records
        ]
    )

    prompt = f"""
You are an AI assistant helping a doctor understand a patient's
medical history.

Answer the doctor's question using ONLY the medical records below.

IMPORTANT RULES:

1. Do not invent information.
2. Do not assume information that is not present.
3. Do not provide a new medical diagnosis.
4. If the answer is not available, say:
   "This information is not available in the provided medical records."
5. Every factual statement must reference the relevant source.
6. Cite sources using exactly this format:
   [Source 1], [Source 2], etc.
7. Use the source number corresponding to the medical record.
8. Keep the answer clear and concise.
9. Mention the hospital and date when useful.

Medical Records:

{records_text}

Doctor's Question:

{request.question}

Provide the answer with source references.
"""

    answer = call_gemini(prompt)

    cited_source_ids = sorted(
        set(
            int(source_id)
            for source_id in re.findall(
                r"\[Source (\d+)\]",
                answer
            )
        )
    )

    if not cited_source_ids:
        cited_source_ids = [
            record.sourceId
            for record in request.records
        ]

    sources = [
        {
            "sourceId": record.sourceId,
            "date": record.date,
            "hospital": record.hospital,
            "type": record.type,
            "title": record.title
        }
        for record in request.records
        if record.sourceId in cited_source_ids
    ]

    return {
        "answer": answer,
        "sources": sources
    }