from PIL import Image
import torch
from torchvision import transforms
from torchvision.models import EfficientNet_B0_Weights
from torchvision.transforms.functional import InterpolationMode

weights = EfficientNet_B0_Weights.DEFAULT

inference_transform = transforms.Compose([
    transforms.Resize(256, interpolation=InterpolationMode.BILINEAR),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=weights.transforms().mean, std=weights.transforms().std),
])

def preprocess_image(img: Image.Image) -> torch.Tensor:
    if img.mode != "RGB":
        img = img.convert("RGB")
    x = inference_transform(img)
    return x.unsqueeze(0) 