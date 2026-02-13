# Machine Learning – Plant Classification

This directory contains the research, dataset, and training notebooks used to develop the plant classification model powering.

The goal of this stage was **proof of concept**:
accurate identification of a small, curated set of indoor plants for integration into the IoT system.

---

## Directory Structure

```
ML/
│
├── plant_classification.ipynb
├── model_evaluation.ipynb
├── class_order.ipynb
├── database.ipynb
│
├── plant_care_database.xlsx
│
├── plant_img_database/
|   └── ...
└── ...
```

---

## Dataset

### Custom Curated Image Database

A suitable public dataset matching the specific plant species and indoor-use case could not be found.
Therefore, a **manual dataset was curated**.

### Dataset Characteristics

* **100 images per class**
* **6 plant species**

  * 3 herbs
  * 2 succulents
  * 1 small foliage plant
* Images manually selected and cleaned
* Used for development and validation purposes

This results in:

* 600 total images
* 70–15–15 train/validation/test split

<br>

---

## Scaling Considerations

This dataset is intentionally small and controlled.

For production-scale deployment:

* Increase:

  * Number of plant classes
  * Number of images per class

Scaling would simply require:

1. Expanding the dataset.
2. Updating label mappings.
3. Retraining the model.

No architectural redesign is required.

---

## Notebooks

### `plant_classification.ipynb`

Main training notebook.

Contains:

* Dataset loading
* Preprocessing
* Transfer learning setup
* Model training loop
* Checkpoint saving

The model is fine-tuned using transfer learning from a pretrained CNN backbone.

---

### `model_evaluation.ipynb`

Model validation and performance analysis.

Includes:

* Accuracy metrics
* Confusion matrix
* Sample inference tests
* Error inspection

Used to verify model readiness for backend deployment.

---

### `class_order.ipynb`

Ensures:

* Correct class-to-index mapping
* Alignment between:

  * Training labels
  * Backend label lookup
  * Care database

This prevents label mismatch issues between:

* ML output
* Backend plant-care mapping
* Frontend display

---

### `database.ipynb`

Exploratory analysis of:

* The plant care dataset
* Label consistency
* Dataset integrity checks

---

## Plant Care Database

The file:

```
plant_care_database.xlsx
```

Is identical to the one used in the backend.

It maps:

* Plant name to Care instructions

  * Moisture requirement
  * Light requirement

Because this dataset is **static and immutable**, it is well suited to:

* Local storage
* Fast lookup
* No synchronization requirements

If scaling is required, it can easily be migrated to:

* PostgreSQL
* MongoDB
* Firebase
* Or another hosted database

No structural changes are needed.

---

## Model Integration

After training:

* The best model checkpoint is exported.
* The backend loads this model at runtime.
* Inference returns:

  * `label`
  * `confidence`
  * `notes` (care guidance)

These are passed through:
Backend → WebSocket → Frontend → Raspberry Pi

---

## Summary

This ML directory represents:

* A functional prototype classifier
* A manually curated dataset
* A reproducible training pipeline
* A clean path to scale

The system architecture was designed so that:

> Expanding plant coverage only requires retraining, not redesigning.
