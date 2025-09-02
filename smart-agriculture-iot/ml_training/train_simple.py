#!/usr/bin/env python3
"""
Fixed Plant Disease Detection Training Script
===========================================
Simplified version that works with current Keras setup.
"""

import os
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
import argparse

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

def train_simple_model(data_dir="training_dataset", epochs=20, model_name='MobileNetV2'):
    """Train a simple but effective plant disease detection model"""
    print("🌱 Simple Plant Disease Training")
    print("="*50)
    
    IMG_SIZE = (224, 224)
    BATCH_SIZE = 16  # Smaller batch size for limited data
    
    # Check if dataset exists
    if not os.path.exists(data_dir):
        print(f"❌ Dataset directory '{data_dir}' not found!")
        return False
    
    # Count images
    total_images = 0
    classes = []
    for class_dir in os.listdir(data_dir):
        class_path = os.path.join(data_dir, class_dir)
        if os.path.isdir(class_path):
            image_files = [f for f in os.listdir(class_path) 
                          if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            image_count = len(image_files)
            total_images += image_count
            if image_count > 0:
                classes.append(class_dir)
    
    print(f"📊 Total Images: {total_images}")
    print(f"🏷️ Classes: {len(classes)}")
    
    if total_images < 8:
        print("❌ Need at least 8 images total to train!")
        return False
    
    # Data generators with heavy augmentation for small dataset
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=40,
        width_shift_range=0.3,
        height_shift_range=0.3,
        shear_range=0.3,
        zoom_range=0.3,
        horizontal_flip=True,
        vertical_flip=True,
        fill_mode='nearest',
        validation_split=0.2
    )
    
    val_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )
    
    # Create data generators
    train_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        shuffle=True
    )
    
    val_generator = val_datagen.flow_from_directory(
        data_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        shuffle=False
    )
    
    num_classes = len(train_generator.class_indices)
    class_names = list(train_generator.class_indices.keys())
    
    print(f"✅ Training samples: {train_generator.samples}")
    print(f"✅ Validation samples: {val_generator.samples}")
    print(f"🏷️ Classes: {class_names}")
    
    # Create simple but effective model
    print(f"\n🏗️ Building {model_name} Model...")
    
    if model_name == 'MobileNetV2':
        base_model = keras.applications.MobileNetV2(
            weights='imagenet',
            include_top=False,
            input_shape=(*IMG_SIZE, 3)
        )
    else:
        base_model = keras.applications.EfficientNetB0(
            weights='imagenet',
            include_top=False,
            input_shape=(*IMG_SIZE, 3)
        )
    
    # Freeze base model
    base_model.trainable = False
    
    # Add classification head
    model = keras.Sequential([
        base_model,
        keras.layers.GlobalAveragePooling2D(),
        keras.layers.Dropout(0.5),
        keras.layers.Dense(128, activation='relu'),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(num_classes, activation='softmax')
    ])
    
    # Compile with simple metrics
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    print(f"✅ Model created with {model.count_params():,} parameters")
    
    # Callbacks
    callbacks = [
        EarlyStopping(
            monitor='val_accuracy',
            patience=8,
            restore_best_weights=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=4,
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
    
    # Train model
    print(f"\n🚀 Training for {epochs} epochs...")
    
    history = model.fit(
        train_generator,
        epochs=epochs,
        validation_data=val_generator,
        callbacks=callbacks,
        verbose=1
    )
    
    # Save final model
    model.save('plant_disease_model_final.h5')
    
    # Save class names
    with open('plant_disease_model_final_classes.txt', 'w') as f:
        for class_name in class_names:
            f.write(f"{class_name}\n")
    
    print("\n✅ Training completed!")
    print("📁 Files created:")
    print("  - plant_disease_model_final.h5")
    print("  - plant_disease_model_final_classes.txt")
    print("  - best_plant_disease_model.h5")
    
    # Plot training history
    if len(history.history['accuracy']) > 1:
        plt.figure(figsize=(12, 4))
        
        plt.subplot(1, 2, 1)
        plt.plot(history.history['accuracy'], label='Training Accuracy')
        if 'val_accuracy' in history.history:
            plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
        plt.title('Model Accuracy')
        plt.xlabel('Epoch')
        plt.ylabel('Accuracy')
        plt.legend()
        plt.grid(True)
        
        plt.subplot(1, 2, 2)
        plt.plot(history.history['loss'], label='Training Loss')
        if 'val_loss' in history.history:
            plt.plot(history.history['val_loss'], label='Validation Loss')
        plt.title('Model Loss')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.legend()
        plt.grid(True)
        
        plt.tight_layout()
        plt.savefig('training_history.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        print("📈 Training history saved: training_history.png")
    
    # Final accuracy
    final_acc = max(history.history['accuracy'])
    if 'val_accuracy' in history.history and len(history.history['val_accuracy']) > 0:
        final_val_acc = max(history.history['val_accuracy'])
        print(f"\n🎯 Best Training Accuracy: {final_acc:.2%}")
        print(f"🎯 Best Validation Accuracy: {final_val_acc:.2%}")
    else:
        print(f"\n🎯 Best Training Accuracy: {final_acc:.2%}")
    
    return True

def main():
    """Main training function"""
    parser = argparse.ArgumentParser(description='Train plant disease detection model')
    parser.add_argument('--data_dir', default='training_dataset', help='Dataset directory')
    parser.add_argument('--epochs', type=int, default=20, help='Number of epochs')
    parser.add_argument('--model', default='MobileNetV2', choices=['MobileNetV2', 'EfficientNetB0'])
    
    args = parser.parse_args()
    
    print("🌱 Plant Disease Detection Training")
    print("="*50)
    print(f"📂 Dataset: {args.data_dir}")
    print(f"⏱️ Epochs: {args.epochs}")
    print(f"🏗️ Model: {args.model}")
    
    success = train_simple_model(
        data_dir=args.data_dir,
        epochs=args.epochs,
        model_name=args.model
    )
    
    if success:
        print("\n🎉 Training completed successfully!")
        print("\n📝 Next Steps:")
        print("1. Copy model to backend:")
        print("   copy plant_disease_model_final.h5 ..\\backend\\simple_plant_disease_model.h5")
        print("   copy plant_disease_model_final_classes.txt ..\\backend\\simple_plant_disease_classes.txt")
        print("2. Restart ML server:")
        print("   cd ..\\backend && python ml_server.py")
        print("3. Test in web app: http://localhost:3000")
    else:
        print("\n❌ Training failed. Add more images and try again.")

if __name__ == "__main__":
    main()
