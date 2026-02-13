from app.ml.efficient_net_fine_tuner import EfficientNetFineTuner
from functools import lru_cache
import torch
from pathlib import Path

# Define the path to the model checkpoint and set the device for inference
ckpt_path = Path(__file__).parent / "saved_models" / "efficientnet_best2.ckpt"
device = torch.device("cpu")

@lru_cache(maxsize=1)
def load_model():
    """
    Load the pre-trained EfficientNet model from the saved checkpoint.
    """
    model = EfficientNetFineTuner.load_from_checkpoint(ckpt_path, num_classes=6)
    model.eval().to(device)
    return model