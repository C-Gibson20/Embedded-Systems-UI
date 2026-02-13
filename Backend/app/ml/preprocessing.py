from PIL import Image
import torch
from torchvision import transforms
from torchvision.models import EfficientNet_B0_Weights
from torchvision.transforms.functional import InterpolationMode

# Use the default weights for EfficientNet_B0 to get normalization parameters
weights = EfficientNet_B0_Weights.DEFAULT

# Define the preprocessing transformation pipeline for the input images
# Including resizing, cropping, normalization, and conversion to tensor
inference_transform = transforms.Compose([
    transforms.Resize(256, interpolation=InterpolationMode.BILINEAR),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=weights.transforms().mean, std=weights.transforms().std),
])

def preprocess_image(img):
    """
    Preprocess the input PIL image using the defined transformation pipeline. 
    Ensures the image is in RGB format and returns a tensor ready for model input. 
    """
    if img.mode != "RGB":
        img = img.convert("RGB")
    x = inference_transform(img)
    return x.unsqueeze(0) 