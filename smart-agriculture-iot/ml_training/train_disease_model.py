#!/usr/bin/env python3
"""
Plant Disease Detection Model Training Script
===========================================
This script trains a CNN model to detect plant diseases from leaf images.
Uses transfer learning with pre-trained models for better accuracy.
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB3, ResNet50V2, MobileNetV2
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
import warnings
warnings.filterwarnings('ignore')

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

class PlantDiseaseTrainer:
    def __init__(self, data_dir, img_size=(224, 224), batch_size=32):
        """
        Initialize the Plant Disease Detection trainer
        
        Args:
            data_dir: Path to dataset directory
            img_size: Input image size (height, width)
            batch_size: Training batch size
        """
        self.data_dir = data_dir
        self.img_size = img_size
        self.batch_size = batch_size
        self.model = None
        self.history = None
        self.class_names = None
        
        print("🌱 Plant Disease Detection Trainer Initialized")
        print(f"📂 Data Directory: {data_dir}")
        print(f"🖼️ Image Size: {img_size}")
        print(f"📦 Batch Size: {batch_size}")
    
    def prepare_data(self):
        """Prepare training and validation datasets with data augmentation"""
        print("\n📊 Preparing Training Data...")
        
        # Data augmentation for training
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=30,
            width_shift_range=0.2,
            height_shift_range=0.2,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            fill_mode='nearest',
            validation_split=0.2  # 20% for validation
        )
        
        # Only rescaling for validation
        val_datagen = ImageDataGenerator(
            rescale=1./255,
            validation_split=0.2
        )
        
        # Training data generator
        self.train_generator = train_datagen.flow_from_directory(
            self.data_dir,
            target_size=self.img_size,
            batch_size=self.batch_size,
            class_mode='categorical',
            subset='training',
            shuffle=True
        )
        
        # Validation data generator
        self.val_generator = val_datagen.flow_from_directory(
            self.data_dir,
            target_size=self.img_size,
            batch_size=self.batch_size,
            class_mode='categorical',
            subset='validation',
            shuffle=False
        )
        
        # Store class names
        self.class_names = list(self.train_generator.class_indices.keys())
        self.num_classes = len(self.class_names)
        
        print(f"✅ Found {self.train_generator.samples} training images")
        print(f"✅ Found {self.val_generator.samples} validation images")
        print(f"🏷️ Classes ({self.num_classes}): {self.class_names}")
        
        return self.train_generator, self.val_generator
    
    def create_model(self, model_name='EfficientNetB3'):
        """
        Create CNN model using transfer learning
        
        Args:
            model_name: Pre-trained model to use ('EfficientNetB3', 'ResNet50V2', 'MobileNetV2')
        """
        print(f"\n🏗️ Building Model with {model_name}...")
        
        # Select base model
        if model_name == 'EfficientNetB3':
            base_model = EfficientNetB3(
                weights='imagenet',
                include_top=False,
                input_shape=(*self.img_size, 3)
            )
        elif model_name == 'ResNet50V2':
            base_model = ResNet50V2(
                weights='imagenet',
                include_top=False,
                input_shape=(*self.img_size, 3)
            )
        elif model_name == 'MobileNetV2':
            base_model = MobileNetV2(
                weights='imagenet',
                include_top=False,
                input_shape=(*self.img_size, 3)
            )
        else:
            raise ValueError(f"Unsupported model: {model_name}")
        
        # Freeze base model initially
        base_model.trainable = False
        
        # Add custom classification head
        self.model = keras.Sequential([
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.Dropout(0.3),
            layers.Dense(512, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(self.num_classes, activation='softmax')
        ])
        
        # Compile model
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy', 'top_3_accuracy']
        )
        
        print("✅ Model created successfully!")
        print(f"📊 Total parameters: {self.model.count_params():,}")
        
        return self.model
    
    def train_model(self, epochs=50, fine_tune_epochs=30):
        """
        Train the model in two phases:
        1. Train only the classification head
        2. Fine-tune the entire model
        """
        print("\n🚀 Starting Training Process...")
        
        # Callbacks
        callbacks = [
            EarlyStopping(
                monitor='val_accuracy',
                patience=10,
                restore_best_weights=True,
                verbose=1
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7,
                verbose=1
            ),
            ModelCheckpoint(
                'best_plant_disease_model.h5',
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1
            )
        ]
        
        # Phase 1: Train classification head only
        print("\n📚 Phase 1: Training Classification Head...")
        history1 = self.model.fit(
            self.train_generator,
            epochs=epochs,
            validation_data=self.val_generator,
            callbacks=callbacks,
            verbose=1
        )
        
        # Phase 2: Fine-tune entire model
        print("\n🔧 Phase 2: Fine-tuning Entire Model...")
        
        # Unfreeze base model
        self.model.layers[0].trainable = True
        
        # Recompile with lower learning rate
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.0001),
            loss='categorical_crossentropy',
            metrics=['accuracy', 'top_3_accuracy']
        )
        
        # Continue training
        history2 = self.model.fit(
            self.train_generator,
            epochs=fine_tune_epochs,
            validation_data=self.val_generator,
            callbacks=callbacks,
            verbose=1
        )
        
        # Combine histories
        self.history = {
            'loss': history1.history['loss'] + history2.history['loss'],
            'accuracy': history1.history['accuracy'] + history2.history['accuracy'],
            'val_loss': history1.history['val_loss'] + history2.history['val_loss'],
            'val_accuracy': history1.history['val_accuracy'] + history2.history['val_accuracy']
        }
        
        print("✅ Training completed!")
        return self.history
    
    def evaluate_model(self):
        """Evaluate model performance"""
        print("\n📊 Evaluating Model Performance...")
        
        # Get predictions
        predictions = self.model.predict(self.val_generator)
        predicted_classes = np.argmax(predictions, axis=1)
        true_classes = self.val_generator.classes
        
        # Classification report
        print("\n📋 Classification Report:")
        print(classification_report(
            true_classes, 
            predicted_classes, 
            target_names=self.class_names
        ))
        
        # Confusion matrix
        cm = confusion_matrix(true_classes, predicted_classes)
        
        plt.figure(figsize=(12, 8))
        sns.heatmap(
            cm, 
            annot=True, 
            fmt='d', 
            cmap='Blues',
            xticklabels=self.class_names,
            yticklabels=self.class_names
        )
        plt.title('Confusion Matrix')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        plt.xticks(rotation=45)
        plt.yticks(rotation=0)
        plt.tight_layout()
        plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        return predictions, predicted_classes
    
    def plot_training_history(self):
        """Plot training history"""
        print("\n📈 Plotting Training History...")
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
        
        # Accuracy plot
        ax1.plot(self.history['accuracy'], label='Training Accuracy')
        ax1.plot(self.history['val_accuracy'], label='Validation Accuracy')
        ax1.set_title('Model Accuracy')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Accuracy')
        ax1.legend()
        ax1.grid(True)
        
        # Loss plot
        ax2.plot(self.history['loss'], label='Training Loss')
        ax2.plot(self.history['val_loss'], label='Validation Loss')
        ax2.set_title('Model Loss')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Loss')
        ax2.legend()
        ax2.grid(True)
        
        plt.tight_layout()
        plt.savefig('training_history.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def save_model(self, save_path='plant_disease_model'):
        """Save the trained model"""
        print(f"\n💾 Saving model to {save_path}...")
        
        # Save in different formats
        self.model.save(f'{save_path}.h5')
        self.model.save(f'{save_path}_savedmodel', save_format='tf')
        
        # Save class names
        with open(f'{save_path}_classes.txt', 'w') as f:
            for class_name in self.class_names:
                f.write(f"{class_name}\n")
        
        print("✅ Model saved successfully!")
    
    def predict_image(self, image_path):
        """Predict disease for a single image"""
        print(f"\n🔍 Predicting: {image_path}")
        
        # Load and preprocess image
        img = keras.preprocessing.image.load_img(
            image_path, 
            target_size=self.img_size
        )
        img_array = keras.preprocessing.image.img_to_array(img)
        img_array = tf.expand_dims(img_array, 0) / 255.0
        
        # Make prediction
        predictions = self.model.predict(img_array, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = predictions[0][predicted_class_idx]
        predicted_class = self.class_names[predicted_class_idx]
        
        print(f"🏷️ Predicted: {predicted_class}")
        print(f"🎯 Confidence: {confidence:.2%}")
        
        return predicted_class, confidence


# Example usage and training script
if __name__ == "__main__":
    print("🌱 Plant Disease Detection Training Script")
    print("=" * 50)
    
    # Configuration
    DATA_DIR = "training_dataset"     # Updated to use our created dataset
    IMG_SIZE = (224, 224)
    BATCH_SIZE = 32
    EPOCHS = 30
    FINE_TUNE_EPOCHS = 20
    
    # Check if dataset exists
    if not os.path.exists(DATA_DIR):
        print(f"❌ Dataset directory '{DATA_DIR}' not found!")
        print("\n📋 Dataset Structure Should Be:")
        print("dataset/")
        print("├── healthy/")
        print("│   ├── image1.jpg")
        print("│   └── image2.jpg")
        print("├── disease1/")
        print("│   ├── image1.jpg")
        print("│   └── image2.jpg")
        print("└── disease2/")
        print("    ├── image1.jpg")
        print("    └── image2.jpg")
        print("\n💡 Download a plant disease dataset first!")
        exit(1)
    
    # Initialize trainer
    trainer = PlantDiseaseTrainer(
        data_dir=DATA_DIR,
        img_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )
    
    # Prepare data
    train_gen, val_gen = trainer.prepare_data()
    
    # Create model
    model = trainer.create_model('EfficientNetB3')
    
    # Train model
    history = trainer.train_model(epochs=EPOCHS, fine_tune_epochs=FINE_TUNE_EPOCHS)
    
    # Evaluate model
    predictions, predicted_classes = trainer.evaluate_model()
    
    # Plot training history
    trainer.plot_training_history()
    
    # Save model
    trainer.save_model('plant_disease_model_final')
    
    print("\n🎉 Training completed successfully!")
    print("📁 Files created:")
    print("  - plant_disease_model_final.h5")
    print("  - plant_disease_model_final_savedmodel/")
    print("  - plant_disease_model_final_classes.txt")
    print("  - confusion_matrix.png")
    print("  - training_history.png")
