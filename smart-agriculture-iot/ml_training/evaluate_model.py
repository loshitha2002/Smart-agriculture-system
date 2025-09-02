#!/usr/bin/env python3
"""
Model Evaluation and Testing Script
=================================
Evaluate trained models and test on new images.
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
import matplotlib.pyplot as plt
from PIL import Image
import json
from pathlib import Path
import argparse

class ModelEvaluator:
    def __init__(self, model_path, classes_path=None):
        """Initialize model evaluator"""
        print(f"🔍 Loading model from: {model_path}")
        
        # Load model
        self.model = keras.models.load_model(model_path)
        
        # Load class names
        if classes_path and os.path.exists(classes_path):
            with open(classes_path, 'r') as f:
                self.classes = [line.strip() for line in f.readlines()]
        else:
            # Try to infer from model path
            base_path = model_path.replace('.h5', '_classes.txt')
            if os.path.exists(base_path):
                with open(base_path, 'r') as f:
                    self.classes = [line.strip() for line in f.readlines()]
            else:
                self.classes = [f"Class_{i}" for i in range(self.model.output_shape[-1])]
        
        print(f"✅ Model loaded with {len(self.classes)} classes")
        print(f"🏷️ Classes: {', '.join(self.classes)}")
    
    def predict_single_image(self, image_path, show_image=True):
        """Predict disease for a single image"""
        print(f"\n🔍 Analyzing: {image_path}")
        
        # Load and preprocess image
        img = keras.preprocessing.image.load_img(
            image_path, 
            target_size=(224, 224)
        )
        img_array = keras.preprocessing.image.img_to_array(img)
        img_array = tf.expand_dims(img_array, 0) / 255.0
        
        # Make prediction
        predictions = self.model.predict(img_array, verbose=0)
        
        # Get top 3 predictions
        top_indices = np.argsort(predictions[0])[::-1][:3]
        
        results = []
        for i, idx in enumerate(top_indices):
            results.append({
                'rank': i + 1,
                'class': self.classes[idx],
                'confidence': float(predictions[0][idx]),
                'percentage': f"{predictions[0][idx]*100:.1f}%"
            })
        
        # Display results
        print(f"\n📊 Prediction Results:")
        for result in results:
            print(f"  {result['rank']}. {result['class']}: {result['percentage']}")
        
        # Show image if requested
        if show_image:
            plt.figure(figsize=(10, 6))
            
            # Show image
            plt.subplot(1, 2, 1)
            plt.imshow(img)
            plt.title(f"Input Image\n{os.path.basename(image_path)}")
            plt.axis('off')
            
            # Show predictions
            plt.subplot(1, 2, 2)
            classes_display = [r['class'] for r in results]
            confidences = [r['confidence'] for r in results]
            
            bars = plt.barh(classes_display, confidences)
            plt.xlabel('Confidence')
            plt.title('Top 3 Predictions')
            plt.xlim(0, 1)
            
            # Color code bars
            bars[0].set_color('green')
            bars[1].set_color('orange') 
            bars[2].set_color('red')
            
            # Add percentage labels
            for i, (bar, result) in enumerate(zip(bars, results)):
                plt.text(bar.get_width() + 0.01, bar.get_y() + bar.get_height()/2, 
                        result['percentage'], va='center')
            
            plt.tight_layout()
            plt.show()
        
        return results
    
    def batch_predict(self, image_folder, output_file=None):
        """Predict diseases for all images in a folder"""
        print(f"\n📁 Batch processing: {image_folder}")
        
        image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
        image_files = []
        
        for ext in image_extensions:
            image_files.extend(Path(image_folder).glob(f"*{ext}"))
            image_files.extend(Path(image_folder).glob(f"*{ext.upper()}"))
        
        results = []
        
        print(f"🔍 Found {len(image_files)} images")
        
        for image_path in image_files:
            try:
                prediction_results = self.predict_single_image(str(image_path), show_image=False)
                
                result = {
                    'image': str(image_path),
                    'filename': image_path.name,
                    'predicted_class': prediction_results[0]['class'],
                    'confidence': prediction_results[0]['confidence'],
                    'top_3_predictions': prediction_results
                }
                
                results.append(result)
                print(f"✅ {image_path.name}: {result['predicted_class']} ({result['confidence']:.2%})")
                
            except Exception as e:
                print(f"❌ Error processing {image_path.name}: {e}")
        
        # Save results if requested
        if output_file:
            with open(output_file, 'w') as f:
                json.dump(results, f, indent=2)
            print(f"💾 Results saved to: {output_file}")
        
        return results
    
    def evaluate_test_set(self, test_folder):
        """Evaluate model on a test dataset with known labels"""
        print(f"\n📊 Evaluating on test set: {test_folder}")
        
        # Prepare test data generator
        test_datagen = keras.preprocessing.image.ImageDataGenerator(rescale=1./255)
        
        test_generator = test_datagen.flow_from_directory(
            test_folder,
            target_size=(224, 224),
            batch_size=32,
            class_mode='categorical',
            shuffle=False
        )
        
        # Evaluate model
        print("🔄 Running evaluation...")
        loss, accuracy, top3_accuracy = self.model.evaluate(test_generator, verbose=1)
        
        print(f"\n📈 Test Results:")
        print(f"  Loss: {loss:.4f}")
        print(f"  Accuracy: {accuracy:.2%}")
        print(f"  Top-3 Accuracy: {top3_accuracy:.2%}")
        
        return {
            'loss': loss,
            'accuracy': accuracy,
            'top3_accuracy': top3_accuracy
        }
    
    def get_model_info(self):
        """Get model architecture information"""
        print("\n🏗️ Model Information:")
        print(f"  Input Shape: {self.model.input_shape}")
        print(f"  Output Shape: {self.model.output_shape}")
        print(f"  Total Parameters: {self.model.count_params():,}")
        
        # Get model size
        self.model.save('temp_model.h5')
        model_size = os.path.getsize('temp_model.h5') / (1024 * 1024)  # MB
        os.remove('temp_model.h5')
        print(f"  Model Size: {model_size:.1f} MB")
        
        return {
            'input_shape': self.model.input_shape,
            'output_shape': self.model.output_shape,
            'total_parameters': self.model.count_params(),
            'model_size_mb': model_size
        }

def main():
    """Main evaluation function"""
    parser = argparse.ArgumentParser(description='Evaluate plant disease detection model')
    parser.add_argument('--model', required=True, help='Path to trained model (.h5)')
    parser.add_argument('--classes', help='Path to classes file (.txt)')
    parser.add_argument('--image', help='Single image to predict')
    parser.add_argument('--folder', help='Folder of images to predict')
    parser.add_argument('--test', help='Test dataset folder for evaluation')
    parser.add_argument('--output', help='Output file for batch results (.json)')
    
    args = parser.parse_args()
    
    # Initialize evaluator
    evaluator = ModelEvaluator(args.model, args.classes)
    
    # Get model info
    evaluator.get_model_info()
    
    # Single image prediction
    if args.image:
        evaluator.predict_single_image(args.image)
    
    # Batch prediction
    if args.folder:
        evaluator.batch_predict(args.folder, args.output)
    
    # Test set evaluation
    if args.test:
        evaluator.evaluate_test_set(args.test)

if __name__ == "__main__":
    # Example usage
    print("🌱 Plant Disease Model Evaluator")
    print("=" * 40)
    
    # If no arguments provided, show usage
    import sys
    if len(sys.argv) == 1:
        print("\n📋 Usage Examples:")
        print("python evaluate_model.py --model plant_disease_model.h5 --image test_leaf.jpg")
        print("python evaluate_model.py --model plant_disease_model.h5 --folder test_images/")
        print("python evaluate_model.py --model plant_disease_model.h5 --test test_dataset/")
        print("\n💡 Use --help for full options")
    else:
        main()
