from app.schemas.analysis import AnalysisResult
from io import BytesIO
from PIL import Image
import torch
import torch.nn.functional as F
from app.schemas.analysis import AnalysisResult
from app.ml.model_loader import load_model, device
from app.ml.preprocessing import preprocess_image
from app.ml.labels import idx_to_class
from app.ml.plant_care import plant_care_df

name_label_map = {
    "haworthia_pumila": "Haworthia Pumila",
    "echeveria_lilacina": "Echeveria Lilacina",
    "fittonia_albivenis": "Fittonia Albivenis",
    "corriandum_sativum": "Coriandrum Sativum",
    "salvia_officinalis": "Salvia Officinalis",
    "mentha_spicata": "Mentha Spicata",
}

def analyze_image(_image_bytes: bytes) -> AnalysisResult:
    img = Image.open(BytesIO(_image_bytes)).convert("RGB")

    x = preprocess_image(img).to(device)

    model = load_model()
    with torch.inference_mode():
        logits = model(x)
        probs = F.softmax(logits, dim=1)
        conf, idx = torch.max(probs, dim=1)
        conf_val = float(conf.item())
        idx_val = int(idx.item())

    label = idx_to_class.get(idx_val, "Unknown")

    notes = []
    care_advice = plant_care_df.loc[label]
    notes.append(f"Light Requirements: {care_advice['Light Requirement']}")
    notes.append(f"Moisture Requirements: {care_advice['Moisture Requirement']}")
    if conf_val < 0.7:
        notes.append("The model is not very confident about this prediction. Consider retaking the photo under better lighting or different angles.")

    return AnalysisResult(
        label=name_label_map.get(label, label),
        confidence=conf_val,
        notes=notes,
    )
