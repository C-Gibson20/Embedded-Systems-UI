from pydantic import BaseModel
from typing import List

class AnalysisResult(BaseModel):
    label: str
    confidence: float
    notes: List[str]