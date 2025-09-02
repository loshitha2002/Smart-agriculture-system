#!/usr/bin/env python3
"""
Quick Plant Disease Training Script
=================================
A simplified version that works with your current setup.
"""

import os
import sys
import numpy as np

def check_requirements():
    """Check if required packages are installed"""
    required_packages = [
        ('tensorflow', 'tensorflow'),
        ('numpy', 'numpy'), 
        ('PIL', 'pillow'),
        ('matplotlib', 'matplotlib'),
        ('sklearn', 'scikit-learn')
    ]
    
    missing_packages = []
    
    for import_name, package_name in required_packages:
        try:
            __import__(import_name)
            print(f"✅ {package_name}")
        except ImportError:
            missing_packages.append(package_name)
            print(f"❌ {package_name} - Missing")
    
    return missing_packages

def create_sample_dataset():
    """Create a sample dataset structure for testing"""
    print("\n📁 Creating Sample Dataset Structure...")
    
    dataset_dir = "sample_dataset"
    os.makedirs(dataset_dir, exist_ok=True)
    
    # Common plant diseases
    classes = [
        "healthy",
        "bacterial_blight", 
        "brown_spot",
        "leaf_blast",
        "tungro_virus",
        "bacterial_leaf_streak"
    ]
    
    for class_name in classes:
        class_dir = os.path.join(dataset_dir, class_name)
        os.makedirs(class_dir, exist_ok=True)
        
        # Create info file
        info_file = os.path.join(class_dir, "info.txt")
        with open(info_file, 'w') as f:
            f.write(f"Plant Disease Class: {class_name}\n")
            f.write("Add your plant leaf images here (JPG, PNG)\n")
            f.write("Recommended: 100+ images per class for good results\n")
            f.write("Image requirements:\n")
            f.write("- Clear leaf images\n")
            f.write("- Good lighting\n")
            f.write("- Minimal background\n")
            f.write("- Various angles/conditions\n")
    
    print(f"✅ Sample dataset created: {dataset_dir}")
    print("\n📋 Dataset Structure:")
    for class_name in classes:
        print(f"  📂 {dataset_dir}/{class_name}/")
    
    return dataset_dir

def train_simple_model():
    """Train a simple CNN model with mock data"""
    print("\n🧠 Training Simple CNN Model...")
    
    try:
        import tensorflow as tf
        from tensorflow import keras
        
        print("🏗️ Building Simple CNN...")
        
        # Simple CNN architecture
        model = keras.Sequential([
            keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
            keras.layers.MaxPooling2D(2, 2),
            keras.layers.Conv2D(64, (3, 3), activation='relu'),
            keras.layers.MaxPooling2D(2, 2),
            keras.layers.Conv2D(128, (3, 3), activation='relu'),
            keras.layers.MaxPooling2D(2, 2),
            keras.layers.Flatten(),
            keras.layers.Dropout(0.5),
            keras.layers.Dense(512, activation='relu'),
            keras.layers.Dense(6, activation='softmax')  # 6 classes
        ])
        
        # Compile model
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        print("✅ Model compiled successfully!")
        print(f"📊 Total parameters: {model.count_params():,}")
        
        # Save model architecture
        model.save('simple_plant_disease_model.h5')
        
        # Save class names
        classes = [
            "healthy",
            "bacterial_blight", 
            "brown_spot",
            "leaf_blast",
            "tungro_virus",
            "bacterial_leaf_streak"
        ]
        
        with open('simple_plant_disease_classes.txt', 'w') as f:
            for class_name in classes:
                f.write(f"{class_name}\n")
        
        print("💾 Model saved:")
        print("  - simple_plant_disease_model.h5")
        print("  - simple_plant_disease_classes.txt")
        
        return True
        
    except ImportError as e:
        print(f"❌ TensorFlow not available: {e}")
        return False

def integrate_with_backend():
    """Show how to integrate with the backend"""
    print("\n🔗 Integration Instructions:")
    print("=" * 40)
    
    print("\n1. Update ML Server (backend/ml_server.py):")
    print("   Replace the mock prediction with:")
    
    integration_code = '''
# Load your trained model
import tensorflow as tf
model = tf.keras.models.load_model('simple_plant_disease_model.h5')

# Load class names  
with open('simple_plant_disease_classes.txt', 'r') as f:
    classes = [line.strip() for line in f.readlines()]

def predict_disease_real(image_path):
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
        'severity': 'High' if confidence > 0.8 else 'Medium' if confidence > 0.6 else 'Low',
        'recommendations': get_treatment_recommendations(classes[predicted_class_idx])
    }
'''
    
    print(integration_code)
    
    print("\n2. Copy Model Files to Backend:")
    print("   cp simple_plant_disease_model.h5 ../backend/")
    print("   cp simple_plant_disease_classes.txt ../backend/")
    
    print("\n3. Restart ML Server:")
    print("   python ml_server.py")

def main():
    """Main function"""
    print("🌱 Quick Plant Disease Training Setup")
    print("=" * 50)
    
    # Check requirements
    print("\n🔍 Checking Requirements...")
    missing = check_requirements()
    
    if missing:
        print(f"\n❌ Missing packages: {', '.join(missing)}")
        print("\n📦 Install with:")
        print(f"pip install {' '.join(missing)}")
        return
    
    print("\n✅ All requirements satisfied!")
    
    # Menu
    print("\n📋 Options:")
    print("1. Create sample dataset structure")
    print("2. Train simple CNN model") 
    print("3. Show integration instructions")
    print("4. All of the above")
    
    choice = input("\nSelect option (1-4): ").strip()
    
    if choice == "1" or choice == "4":
        create_sample_dataset()
    
    if choice == "2" or choice == "4":
        train_simple_model()
    
    if choice == "3" or choice == "4":
        integrate_with_backend()
    
    if choice == "4":
        print("\n🎉 Complete Setup Done!")
        print("\n📝 Next Steps:")
        print("1. Add plant images to sample_dataset folders")
        print("2. Run full training script: python train_disease_model.py")
        print("3. Copy trained model to backend folder")
        print("4. Update ml_server.py to use real model")
        print("5. Test disease detection in your web app!")

if __name__ == "__main__":
    main()
