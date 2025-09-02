#!/usr/bin/env python3
import os
import sys

def main():
    print("Plant Disease Training - Simple Version")
    print("="*50)
    
    dataset_dir = "training_dataset"
    
    if not os.path.exists(dataset_dir):
        print(f"Dataset directory '{dataset_dir}' not found!")
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
            print(f"Class {class_dir}: {image_count} images")
    
    print(f"\nTotal Images: {total_images}")
    print(f"Classes: {len(classes)}")
    
    if total_images < 50:
        print("\nWarning: Less than 50 total images!")
        print("Recommended: 50+ images per class for good results")
        print("\nAdd more images to training_dataset folders")
        return
    
    print("\nReady for training!")
    print("Run: python train_disease_model.py --data_dir training_dataset")

if __name__ == "__main__":
    main()
