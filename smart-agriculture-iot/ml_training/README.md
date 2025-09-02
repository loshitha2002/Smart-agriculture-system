# 🌱 Plant Disease Detection Training Guide

## 🎯 Overview
This guide will help you train a real AI model to detect plant diseases from leaf images using state-of-the-art deep learning techniques.

## 📋 Prerequisites

### 1. Install Python Dependencies
```bash
cd ml_training
pip install -r requirements.txt
```

### 2. Setup Kaggle API (Optional - for dataset download)
1. Go to https://www.kaggle.com/account
2. Create new API token
3. Download `kaggle.json`
4. Place it at `~/.kaggle/kaggle.json`

## 🗂️ Dataset Options

### Option 1: Download Public Datasets
```bash
python download_dataset.py
```

**Available Datasets:**
- **PlantVillage**: 38 disease classes, 54,000+ images
- **Cassava Leaf Disease**: 5 classes, 21,000+ images  
- **Crop Diseases**: Multiple plant types

### Option 2: Use Your Own Dataset
Create this folder structure:
```
dataset/
├── healthy/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
├── bacterial_blight/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
├── brown_spot/
│   ├── image1.jpg
│   └── ...
└── leaf_blast/
    ├── image1.jpg
    └── ...
```

## 🚀 Training Process

### Step 1: Quick Start Training
```bash
python train_disease_model.py
```

### Step 2: Custom Training Configuration
Edit the configuration in `train_disease_model.py`:

```python
# Configuration
DATA_DIR = "dataset"           # Your dataset path
IMG_SIZE = (224, 224)         # Image size (224x224 recommended)
BATCH_SIZE = 32               # Batch size (adjust based on GPU memory)
EPOCHS = 30                   # Initial training epochs
FINE_TUNE_EPOCHS = 20         # Fine-tuning epochs
MODEL_NAME = 'EfficientNetB3' # Model architecture
```

## 🏗️ Model Architectures

### Available Models:
1. **EfficientNetB3** (Recommended)
   - Best accuracy/efficiency balance
   - 12M parameters
   - Great for mobile deployment

2. **ResNet50V2**
   - Proven architecture
   - 25M parameters
   - Good for high accuracy

3. **MobileNetV2**
   - Fastest inference
   - 3.5M parameters
   - Perfect for mobile/edge devices

## 📊 Training Strategy

### Two-Phase Training:
1. **Phase 1**: Train classification head only (faster)
2. **Phase 2**: Fine-tune entire model (better accuracy)

### Data Augmentation:
- Rotation (±30°)
- Width/Height shift (±20%)
- Zoom (±20%)
- Horizontal flip
- Shear transformation

### Callbacks:
- **Early Stopping**: Prevents overfitting
- **Learning Rate Reduction**: Improves convergence
- **Model Checkpoint**: Saves best model

## 📈 Monitoring Training

### Real-time Metrics:
- Training/Validation Accuracy
- Training/Validation Loss
- Top-3 Accuracy
- Learning Rate

### Generated Outputs:
- `training_history.png` - Training curves
- `confusion_matrix.png` - Model performance
- `best_plant_disease_model.h5` - Best model weights

## 🎯 Expected Results

### Performance Targets:
- **Training Accuracy**: 95%+
- **Validation Accuracy**: 90%+
- **Inference Time**: <100ms
- **Model Size**: <50MB

### Common Issues & Solutions:

**Low Accuracy:**
- Increase dataset size (1000+ images per class)
- Try different model architecture
- Adjust learning rate
- Add more data augmentation

**Overfitting:**
- Increase dropout rates
- Add more regularization
- Use early stopping
- Get more training data

**Slow Training:**
- Reduce batch size
- Use smaller model (MobileNetV2)
- Enable mixed precision training

## 🔄 Integration with Your App

### Step 1: Update ML Server
Replace the mock model in `backend/ml_server.py`:

```python
# Load your trained model
model = tf.keras.models.load_model('plant_disease_model_final.h5')

# Load class names
with open('plant_disease_model_final_classes.txt', 'r') as f:
    classes = [line.strip() for line in f.readlines()]
```

### Step 2: Update Prediction Function
```python
def predict_disease(image_path):
    # Load and preprocess image
    img = tf.keras.preprocessing.image.load_img(image_path, target_size=(224, 224))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0) / 255.0
    
    # Make prediction
    predictions = model.predict(img_array)
    predicted_class_idx = np.argmax(predictions[0])
    confidence = predictions[0][predicted_class_idx]
    
    return {
        'disease': classes[predicted_class_idx],
        'confidence': float(confidence),
        'all_predictions': dict(zip(classes, predictions[0]))
    }
```

## 🛠️ Advanced Training Options

### 1. Hyperparameter Optimization
```python
# Use Optuna for automatic hyperparameter tuning
import optuna

def objective(trial):
    lr = trial.suggest_loguniform('lr', 1e-5, 1e-2)
    batch_size = trial.suggest_categorical('batch_size', [16, 32, 64])
    dropout = trial.suggest_uniform('dropout', 0.1, 0.7)
    
    # Train model with these parameters
    # Return validation accuracy
```

### 2. Transfer Learning from Custom Models
```python
# Load a pre-trained agriculture model
base_model = tf.keras.models.load_model('agriculture_pretrained.h5')
base_model.trainable = False

# Add custom head for your specific diseases
```

### 3. Multi-Scale Training
```python
# Train on multiple image sizes for better generalization
IMG_SIZES = [(224, 224), (256, 256), (299, 299)]
```

## 📱 Model Deployment

### 1. Convert to TensorFlow Lite (Mobile)
```python
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

with open('plant_disease_model.tflite', 'wb') as f:
    f.write(tflite_model)
```

### 2. Export to ONNX (Cross-platform)
```python
import tf2onnx

spec = (tf.TensorSpec((None, 224, 224, 3), tf.float32, name="input"),)
output_path = "plant_disease_model.onnx"
model_proto, _ = tf2onnx.convert.from_keras(model, input_signature=spec, opset=13)
```

## 🎉 Quick Start Commands

### 1. Setup Everything
```bash
# Install dependencies
pip install -r requirements.txt

# Create sample dataset
python download_dataset.py
```

### 2. Train Model
```bash
# Train with default settings
python train_disease_model.py

# Custom training
python train_disease_model.py --data_dir /path/to/dataset --epochs 50 --model EfficientNetB3
```

### 3. Evaluate Results
```bash
# Model files will be generated:
# - plant_disease_model_final.h5
# - plant_disease_model_final_classes.txt
# - training_history.png
# - confusion_matrix.png
```

## 📞 Need Help?

### Common Commands:
```bash
# Check GPU availability
python -c "import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))"

# Monitor training (if using wandb)
wandb login
wandb init

# Test trained model
python -c "from train_disease_model import *; trainer = PlantDiseaseTrainer('dataset'); trainer.predict_image('test_image.jpg')"
```

### Resources:
- 📖 [TensorFlow Documentation](https://www.tensorflow.org/guide)
- 🌱 [PlantVillage Dataset](https://www.kaggle.com/datasets/arjuntejaswi/plant-village)
- 🔬 [Plant Disease Research Papers](https://scholar.google.com/scholar?q=plant+disease+detection+deep+learning)

Happy Training! 🚀🌱
