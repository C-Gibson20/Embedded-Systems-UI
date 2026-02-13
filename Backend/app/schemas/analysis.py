from pydantic import BaseModel
from typing import List

class AnalysisResult(BaseModel):
    """
    Configuration result from ML inference on plant image, including:
        - label: the identified plant species or condition, 
        - confidence: the confidence score of the prediction, 
        - notes: any additional information or care instructions related to the analysis.
    """
    label: str
    confidence: float
    notes: List[str]