from app.ml.efficient_net_fine_tuner import EfficientNetFineTuner
from torchvision.models import efficientnet_b0
from functools import lru_cache
import torch
from pathlib import Path

ckpt_path = Path(__file__).parent / "saved_models" / "efficientnet_best2.ckpt"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

@lru_cache(maxsize=1)
def load_model():
    model = EfficientNetFineTuner.load_from_checkpoint(ckpt_path, num_classes=6)
    model.eval().to(device)
    return model