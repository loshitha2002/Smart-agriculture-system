#!/usr/bin/env python3
"""
Alternative Dataset Setup - No Kaggle Required
==============================================
Downloads plant disease datasets from public sources or creates sample structure.
"""

import os
import requests
import zipfile
from pathlib import Path
import shutil

def create_comprehensive_sample_dataset():
    """Create a comprehensive sample dataset structure"""
    print("🌱 Creating Comprehensive Sample Dataset Structure...")
    
    dataset_dir = Path("training_dataset")
    dataset_dir.mkdir(exist_ok=True)
    
    # Comprehensive plant disease classes
    disease_classes = {
        'healthy': {
            'description': 'Healthy plants with no visible diseases',
            'symptoms': 'Green leaves, normal growth, no spots or discoloration',
            'treatment': 'Continue regular care and monitoring'
        },
        'bacterial_blight': {
            'description': 'Bacterial infection causing leaf spots',
            'symptoms': 'Water-soaked spots, yellowing, wilting',
            'treatment': 'Copper-based bactericides, remove infected parts'
        },
        'brown_spot': {
            'description': 'Fungal disease causing brown circular spots',
            'symptoms': 'Brown spots with yellow halos, leaf yellowing',
            'treatment': 'Fungicide spray, improve air circulation'
        },
        'leaf_blast': {
            'description': 'Serious fungal disease affecting leaves',
            'symptoms': 'Diamond-shaped lesions, leaf death',
            'treatment': 'Systemic fungicides, resistant varieties'
        },
        'tungro_virus': {
            'description': 'Viral disease transmitted by insects',
            'symptoms': 'Yellow-orange discoloration, stunted growth',
            'treatment': 'Remove infected plants, control insect vectors'
        },
        'bacterial_leaf_streak': {
            'description': 'Bacterial disease causing streaks',
            'symptoms': 'Yellow to brown streaks on leaves',
            'treatment': 'Copper compounds, field sanitation'
        },
        'sheath_blight': {
            'description': 'Fungal disease affecting plant sheaths',
            'symptoms': 'Oval lesions, grayish-white centers',
            'treatment': 'Fungicide application, proper spacing'
        },
        'anthracnose': {
            'description': 'Fungal disease causing dark lesions',
            'symptoms': 'Dark, sunken spots, pink spore masses',
            'treatment': 'Fungicide spray, remove plant debris'
        }
    }
    
    for class_name, info in disease_classes.items():
        class_dir = dataset_dir / class_name
        class_dir.mkdir(exist_ok=True)
        
        # Create detailed info file
        info_file = class_dir / "class_info.txt"
        with open(info_file, 'w') as f:
            f.write(f"Disease Class: {class_name.replace('_', ' ').title()}\n")
            f.write("="*50 + "\n\n")
            f.write(f"Description: {info['description']}\n\n")
            f.write(f"Symptoms: {info['symptoms']}\n\n")
            f.write(f"Treatment: {info['treatment']}\n\n")
            f.write("Image Requirements:\n")
            f.write("- Add 50-200 images per class for good training\n")
            f.write("- Use JPG, PNG formats\n")
            f.write("- Clear, well-lit images preferred\n")
            f.write("- Various angles and conditions\n")
            f.write("- Image size: 224x224 pixels or larger\n\n")
            f.write("Sources for images:\n")
            f.write("- Plant pathology databases\n")
            f.write("- Agricultural research institutes\n")
            f.write("- Field photographs\n")
            f.write("- Online plant disease resources\n")
        
        # Create sample placeholder
        placeholder_file = class_dir / "add_images_here.txt"
        with open(placeholder_file, 'w') as f:
            f.write(f"Add {class_name.replace('_', ' ')} images to this folder\n")
            f.write("Recommended: 50+ images for good training results\n")
    
    print(f"✅ Comprehensive dataset structure created: {dataset_dir}")
    print(f"📁 Created {len(disease_classes)} disease classes")
    
    # Create training guide
    guide_file = dataset_dir / "TRAINING_GUIDE.txt"
    with open(guide_file, 'w') as f:
        f.write("Plant Disease Dataset Training Guide\n")
        f.write("="*40 + "\n\n")
        f.write("1. ADDING IMAGES:\n")
        f.write("   - Add 50-200 images per disease class\n")
        f.write("   - Use clear, high-quality images\n")
        f.write("   - Ensure proper lighting and focus\n\n")
        f.write("2. IMAGE SOURCES:\n")
        f.write("   - PlantNet (https://plantnet.org/)\n")
        f.write("   - Plant Pathology databases\n")
        f.write("   - Agricultural university resources\n")
        f.write("   - Field photography\n\n")
        f.write("3. TRAINING COMMAND:\n")
        f.write("   python train_disease_model.py --data_dir training_dataset\n\n")
        f.write("4. EXPECTED RESULTS:\n")
        f.write("   - Training time: 1-3 hours\n")
        f.write("   - Expected accuracy: 85-95%\n")
        f.write("   - Model size: ~50MB\n")
    
    return str(dataset_dir)

def download_sample_images():
    """Download some sample plant images for demonstration"""
    print("\n📥 Downloading Sample Plant Images...")
    
    # Public domain plant images (Creative Commons)
    sample_urls = [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Green_leaf.jpg/640px-Green_leaf.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Diseased_leaf.jpg/640px-Diseased_leaf.jpg",
    ]
    
    dataset_dir = Path("training_dataset")
    
    try:
        for i, url in enumerate(sample_urls):
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                if i == 0:
                    file_path = dataset_dir / "healthy" / f"sample_healthy_{i}.jpg"
                else:
                    file_path = dataset_dir / "bacterial_blight" / f"sample_disease_{i}.jpg"
                
                with open(file_path, 'wb') as f:
                    f.write(response.content)
                print(f"✅ Downloaded sample image: {file_path.name}")
            else:
                print(f"❌ Failed to download: {url}")
                
    except Exception as e:
        print(f"⚠️ Error downloading samples: {e}")
        print("💡 You can manually add images to the folders")

def create_training_script():
    """Create a simple training script for the dataset"""
    print("\n📝 Creating Training Script...")
    
    training_script = """#!/usr/bin/env python3
import os
import sys

def main():
    print("🌱 Plant Disease Training - Simple Version")
    print("="*50)
    
    dataset_dir = "training_dataset"
    
    if not os.path.exists(dataset_dir):
        print(f"❌ Dataset directory '{dataset_dir}' not found!")
        print("Run: python alternative_dataset.py first")
        return
    
    # Count images in each class
    total_images = 0
    classes = []
    
    for class_dir in os.listdir(dataset_dir):
        class_path = os.path.join(dataset_dir, class_dir)
        if os.path.isdir(class_path):
            image_files = [f for f in os.listdir(class_path) 
                          if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            image_count = len(image_files)
            total_images += image_count
            classes.append((class_dir, image_count))
            print(f"📂 {class_dir}: {image_count} images")
    
    print(f"\\n📊 Total Images: {total_images}")
    print(f"🏷️ Classes: {len(classes)}")
    
    if total_images < 50:
        print("\\n⚠️ Warning: Less than 50 total images!")
        print("Recommended: 50+ images per class for good results")
        print("\\n💡 Add more images to training_dataset folders")
        return
    
    print("\\n🚀 Ready for training!")
    print("Run: python train_disease_model.py --data_dir training_dataset")

if __name__ == "__main__":
    main()
"""
    
    with open("check_dataset.py", 'w') as f:
        f.write(training_script)
    
    print("✅ Created check_dataset.py")

def main():
    """Main function"""
    print("🌱 Alternative Plant Disease Dataset Setup")
    print("="*50)
    print("No Kaggle API required - Creates local training structure")
    
    print("\n📋 Options:")
    print("1. Create comprehensive sample dataset structure")
    print("2. Download sample demonstration images")
    print("3. Create dataset checker script")
    print("4. All of the above")
    
    choice = input("\nSelect option (1-4): ").strip()
    
    if choice == "1" or choice == "4":
        dataset_path = create_comprehensive_sample_dataset()
        print(f"\n✅ Dataset structure created at: {dataset_path}")
    
    if choice == "2" or choice == "4":
        download_sample_images()
    
    if choice == "3" or choice == "4":
        create_training_script()
    
    if choice == "4":
        print("\n🎉 Complete Alternative Setup Done!")
        print("\n📝 Next Steps:")
        print("1. Add plant disease images to training_dataset folders")
        print("2. Run: python check_dataset.py (to verify images)")
        print("3. Run: python train_disease_model.py --data_dir training_dataset")
        print("4. Wait 1-3 hours for training completion")
        print("5. Copy trained model to backend folder")
        print("6. Restart ML server for real AI predictions!")
        
        print("\n💡 Image Sources:")
        print("- PlantNet: https://plantnet.org/")
        print("- Plant Pathology Databases")
        print("- Agricultural Research Websites")
        print("- Your own field photographs")
        
        print("\n🎯 Training Tips:")
        print("- 50+ images per disease class minimum")
        print("- Clear, well-lit images work best")
        print("- Diverse angles and conditions")
        print("- JPG/PNG formats supported")

if __name__ == "__main__":
    main()
