#!/usr/bin/env python3
"""
Plant Disease Dataset Downloader
===============================
Downloads and prepares popular plant disease datasets for training.
"""

import os
import requests
import zipfile
import shutil
from pathlib import Path
import kaggle
from tqdm import tqdm

class DatasetDownloader:
    def __init__(self, base_dir="datasets"):
        """Initialize dataset downloader"""
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(exist_ok=True)
        print(f"📂 Dataset directory: {self.base_dir}")
    
    def download_plantvillage_dataset(self):
        """
        Download the famous PlantVillage dataset
        Contains 38 classes of plant diseases and healthy plants
        """
        print("\n🌱 Downloading PlantVillage Dataset...")
        print("📊 Dataset Info:")
        print("  - 38 disease classes")
        print("  - 54,000+ images")
        print("  - High quality leaf images")
        
        dataset_dir = self.base_dir / "plantvillage"
        
        try:
            # Download using Kaggle API
            print("📥 Downloading from Kaggle...")
            kaggle.api.dataset_download_files(
                'arjuntejaswi/plant-village',
                path=str(dataset_dir),
                unzip=True
            )
            print("✅ PlantVillage dataset downloaded!")
            
        except Exception as e:
            print(f"❌ Kaggle download failed: {e}")
            print("💡 Please download manually from:")
            print("   https://www.kaggle.com/datasets/arjuntejaswi/plant-village")
            return False
        
        return True
    
    def download_cassava_dataset(self):
        """Download Cassava Leaf Disease dataset"""
        print("\n🍠 Downloading Cassava Leaf Disease Dataset...")
        print("📊 Dataset Info:")
        print("  - 5 disease classes")
        print("  - 21,000+ images")
        print("  - Real field conditions")
        
        dataset_dir = self.base_dir / "cassava"
        
        try:
            kaggle.api.competition_download_files(
                'cassava-leaf-disease-classification',
                path=str(dataset_dir),
                unzip=True
            )
            print("✅ Cassava dataset downloaded!")
            return True
            
        except Exception as e:
            print(f"❌ Download failed: {e}")
            return False
    
    def download_crop_disease_dataset(self):
        """Download New Plant Diseases Dataset"""
        print("\n🌾 Downloading Crop Disease Dataset...")
        
        dataset_dir = self.base_dir / "crop_diseases"
        
        try:
            kaggle.api.dataset_download_files(
                'vipoooool/new-plant-diseases-dataset',
                path=str(dataset_dir),
                unzip=True
            )
            print("✅ Crop disease dataset downloaded!")
            return True
            
        except Exception as e:
            print(f"❌ Download failed: {e}")
            return False
    
    def create_sample_dataset(self):
        """Create a small sample dataset for testing"""
        print("\n🧪 Creating Sample Dataset...")
        
        sample_dir = self.base_dir / "sample_dataset"
        sample_dir.mkdir(exist_ok=True)
        
        # Create class directories
        classes = [
            "healthy",
            "bacterial_blight",
            "brown_spot", 
            "leaf_blast",
            "tungro"
        ]
        
        for class_name in classes:
            class_dir = sample_dir / class_name
            class_dir.mkdir(exist_ok=True)
            
            # Create placeholder info
            info_file = class_dir / "README.txt"
            with open(info_file, 'w') as f:
                f.write(f"Class: {class_name}\n")
                f.write("Add your plant images here\n")
                f.write("Supported formats: .jpg, .jpeg, .png\n")
        
        print("✅ Sample dataset structure created!")
        print(f"📁 Location: {sample_dir}")
        print("\n📋 Add your images to these folders:")
        for class_name in classes:
            print(f"  - {sample_dir}/{class_name}/")
        
        return str(sample_dir)
    
    def setup_kaggle_api(self):
        """Setup Kaggle API for dataset downloads"""
        print("\n🔧 Setting up Kaggle API...")
        
        kaggle_dir = Path.home() / ".kaggle"
        kaggle_file = kaggle_dir / "kaggle.json"
        
        if not kaggle_file.exists():
            print("❌ Kaggle API key not found!")
            print("\n📋 Setup Instructions:")
            print("1. Go to https://www.kaggle.com/account")
            print("2. Create new API token")
            print("3. Download kaggle.json")
            print(f"4. Place it at: {kaggle_file}")
            print("5. Run: chmod 600 ~/.kaggle/kaggle.json")
            return False
        
        try:
            import kaggle
            kaggle.api.authenticate()
            print("✅ Kaggle API authenticated!")
            return True
        except Exception as e:
            print(f"❌ Kaggle authentication failed: {e}")
            return False

def main():
    """Main function to download datasets"""
    print("🌱 Plant Disease Dataset Downloader")
    print("=" * 40)
    
    downloader = DatasetDownloader()
    
    print("\n📋 Available Datasets:")
    print("1. PlantVillage (38 classes, 54K+ images)")
    print("2. Cassava Leaf Disease (5 classes, 21K+ images)")
    print("3. Crop Diseases (Multiple classes)")
    print("4. Create Sample Dataset Structure")
    
    choice = input("\nSelect dataset (1-4): ").strip()
    
    if choice == "1":
        if downloader.setup_kaggle_api():
            downloader.download_plantvillage_dataset()
    elif choice == "2":
        if downloader.setup_kaggle_api():
            downloader.download_cassava_dataset()
    elif choice == "3":
        if downloader.setup_kaggle_api():
            downloader.download_crop_disease_dataset()
    elif choice == "4":
        sample_path = downloader.create_sample_dataset()
        print(f"\n🎯 Sample dataset created at: {sample_path}")
        print("\n📝 Next Steps:")
        print("1. Add your plant images to the class folders")
        print("2. Run the training script:")
        print(f"   python train_disease_model.py")
    else:
        print("❌ Invalid choice!")

if __name__ == "__main__":
    main()
