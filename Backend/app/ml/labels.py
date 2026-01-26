import json
from pathlib import Path

class_to_idx_path = Path(__file__).with_name("class_to_idx.json")

with open(class_to_idx_path, "r") as f:
    class_to_idx = json.load(f)

idx_to_class = {int(v): k for k, v in class_to_idx.items()}