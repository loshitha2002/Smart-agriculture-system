#!/usr/bin/env python3
"""
Smart Agriculture IoT System - Simplified Plant Disease Detection
Mock Classification for Demo Purposes

This module provides:
1. Mock disease classification for demonstration
2. Image preprocessing and validation
3. Disease information database
4. Treatment recommendations
5. Extensible structure for future ML integration

Note: This version uses mock predictions to demonstrate the system.
For production, integrate with trained CNN models or cloud ML APIs.
"""

import os
import numpy as np
from PIL import Image
import json
from datetime import datetime
import logging
import random
from typing import Dict, List, Tuple, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimplePlantDiseaseDetector:
    """Simplified plant disease detector with mock predictions."""
    
    def __init__(self):
        """Initialize the simplified detector."""
        self.class_names = [
            'Apple___Apple_scab',
            'Apple___Black_rot',
            'Apple___Cedar_apple_rust',
            'Apple___healthy',
            'Blueberry___healthy',
            'Cherry_(including_sour)___Powdery_mildew',
            'Cherry_(including_sour)___healthy',
            'Corn_(maize)___Cercospora_leaf_spot',
            'Corn_(maize)___Common_rust',
            'Corn_(maize)___Northern_Leaf_Blight',
            'Corn_(maize)___healthy',
            'Grape___Black_rot',
            'Grape___Esca_(Black_Measles)',
            'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
            'Grape___healthy',
            'Orange___Haunglongbing_(Citrus_greening)',
            'Peach___Bacterial_spot',
            'Peach___healthy',
            'Pepper,_bell___Bacterial_spot',
            'Pepper,_bell___healthy',
            'Potato___Early_blight',
            'Potato___Late_blight',
            'Potato___healthy',
            'Raspberry___healthy',
            'Soybean___healthy',
            'Squash___Powdery_mildew',
            'Strawberry___Leaf_scorch',
            'Strawberry___healthy',
            'Tomato___Bacterial_spot',
            'Tomato___Early_blight',
            'Tomato___Late_blight',
            'Tomato___Leaf_Mold',
            'Tomato___Septoria_leaf_spot',
            'Tomato___Spider_mites_Two-spotted_spider_mite',
            'Tomato___Target_Spot',
            'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
            'Tomato___Tomato_mosaic_virus',
            'Tomato___healthy'
        ]
        
        # Disease information database
        self.disease_info = {
            'Apple___Apple_scab': {
                'name': 'Apple Scab',
                'severity': 'High',
                'description': 'Fungal disease causing dark spots on leaves and fruit',
                'symptoms': ['Dark olive-green spots on leaves', 'Scab-like lesions on fruit', 'Premature leaf drop'],
                'treatment': ['Apply fungicides early in season', 'Remove infected leaves', 'Improve air circulation'],
                'prevention': ['Choose resistant varieties', 'Prune for good air flow', 'Clean up fallen leaves']
            },
            'Tomato___Early_blight': {
                'name': 'Tomato Early Blight',
                'severity': 'Medium',
                'description': 'Common fungal disease affecting tomato plants',
                'symptoms': ['Brown spots with concentric rings', 'Yellowing of lower leaves', 'Stem lesions'],
                'treatment': ['Apply copper-based fungicides', 'Remove affected leaves', 'Improve drainage'],
                'prevention': ['Crop rotation', 'Avoid overhead watering', 'Mulch around plants']
            },
            'Potato___Late_blight': {
                'name': 'Potato Late Blight',
                'severity': 'Critical',
                'description': 'Devastating disease that can destroy crops quickly',
                'symptoms': ['Water-soaked lesions', 'White fuzzy growth on leaf undersides', 'Brown patches'],
                'treatment': ['Immediate fungicide application', 'Remove infected plants', 'Harvest early if necessary'],
                'prevention': ['Use certified seed potatoes', 'Ensure good drainage', 'Monitor weather conditions']
            },
            'Corn_(maize)___Northern_Leaf_Blight': {
                'name': 'Northern Leaf Blight',
                'severity': 'Medium',
                'description': 'Fungal disease common in corn crops',
                'symptoms': ['Elliptical gray-green lesions', 'Lesions turn tan with dark borders', 'Reduced yield'],
                'treatment': ['Apply fungicides if severe', 'Remove crop residue', 'Use resistant hybrids'],
                'prevention': ['Crop rotation', 'Avoid prolonged leaf wetness', 'Plant resistant varieties']
            }
        }
        
        logger.info("✅ Simplified Plant Disease Detector initialized")

    def preprocess_image(self, image_data: bytes) -> np.ndarray:
        """Preprocess uploaded image for analysis."""
        try:
            # Open image from bytes
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize to standard size
            image = image.resize((224, 224))
            
            # Convert to numpy array
            img_array = np.array(image)
            
            # Normalize pixel values
            img_array = img_array.astype(np.float32) / 255.0
            
            # Add batch dimension
            img_array = np.expand_dims(img_array, axis=0)
            
            logger.info("✅ Image preprocessed successfully")
            return img_array
            
        except Exception as e:
            logger.error(f"❌ Error preprocessing image: {str(e)}")
            raise ValueError(f"Invalid image format: {str(e)}")

    def predict_disease(self, image_data: bytes) -> Dict:
        """
        Predict plant disease from image.
        Uses mock prediction for demonstration.
        """
        try:
            # Preprocess image
            processed_image = self.preprocess_image(image_data)
            
            # Mock prediction logic based on image characteristics
            # In a real implementation, this would use a trained ML model
            
            # Simulate analysis time
            import time
            time.sleep(0.5)
            
            # Generate mock prediction based on image properties
            image = Image.open(io.BytesIO(image_data))
            
            # Simple heuristics for demo (based on image colors/properties)
            img_array = np.array(image.resize((100, 100)))
            
            # Calculate some basic image statistics
            avg_green = np.mean(img_array[:, :, 1]) if len(img_array.shape) == 3 else 128
            avg_brown = np.mean(img_array) if len(img_array.shape) == 3 else 128
            
            # Mock disease detection logic
            if avg_green > 120:  # Healthy green color
                if random.random() > 0.3:  # 70% chance of healthy
                    predicted_class = random.choice([
                        'Apple___healthy', 'Tomato___healthy', 'Potato___healthy',
                        'Corn_(maize)___healthy', 'Cherry_(including_sour)___healthy'
                    ])
                    confidence = random.uniform(0.85, 0.98)
                else:
                    predicted_class = random.choice([
                        'Tomato___Early_blight', 'Apple___Apple_scab',
                        'Corn_(maize)___Northern_Leaf_Blight'
                    ])
                    confidence = random.uniform(0.65, 0.85)
            else:  # Potentially diseased
                predicted_class = random.choice([
                    'Tomato___Early_blight', 'Apple___Apple_scab',
                    'Potato___Late_blight', 'Corn_(maize)___Northern_Leaf_Blight',
                    'Tomato___Late_blight', 'Apple___Black_rot'
                ])
                confidence = random.uniform(0.70, 0.95)
            
            # Get disease information
            disease_details = self.get_disease_info(predicted_class)
            
            result = {
                'predicted_class': predicted_class,
                'confidence': round(confidence, 3),
                'disease_name': disease_details['name'],
                'severity': disease_details['severity'],
                'is_healthy': 'healthy' in predicted_class.lower(),
                'timestamp': datetime.now().isoformat(),
                'model_version': 'SimpleMock-v1.0',
                'analysis_type': 'mock_classification'
            }
            
            logger.info(f"✅ Disease prediction completed: {predicted_class} ({confidence:.3f})")
            return result
            
        except Exception as e:
            logger.error(f"❌ Error in disease prediction: {str(e)}")
            raise ValueError(f"Prediction failed: {str(e)}")

    def get_disease_info(self, disease_class: str) -> Dict:
        """Get detailed information about a disease."""
        # Extract disease name from class name
        disease_key = disease_class
        
        # Check if we have specific info for this disease
        if disease_key in self.disease_info:
            return self.disease_info[disease_key]
        
        # Check for partial matches
        for key in self.disease_info.keys():
            if any(part in disease_class.lower() for part in key.lower().split('_')):
                return self.disease_info[key]
        
        # Default healthy response
        if 'healthy' in disease_class.lower():
            return {
                'name': 'Healthy Plant',
                'severity': 'None',
                'description': 'Plant appears to be healthy with no visible diseases',
                'symptoms': ['Green, vibrant foliage', 'No visible spots or lesions', 'Normal growth pattern'],
                'treatment': ['Continue regular care', 'Monitor for changes', 'Maintain good growing conditions'],
                'prevention': ['Regular inspection', 'Proper watering', 'Good air circulation', 'Balanced nutrition']
            }
        
        # Generic disease response
        return {
            'name': disease_class.replace('_', ' ').title(),
            'severity': 'Unknown',
            'description': 'Disease detected but specific information not available',
            'symptoms': ['Visible lesions or spots', 'Discoloration of leaves', 'Abnormal growth patterns'],
            'treatment': ['Consult agricultural expert', 'Remove affected parts', 'Apply general fungicide'],
            'prevention': ['Regular monitoring', 'Good hygiene practices', 'Proper plant spacing']
        }

    def get_treatment_recommendations(self, disease_class: str) -> Dict:
        """Get treatment recommendations for a specific disease."""
        disease_info = self.get_disease_info(disease_class)
        
        # Determine urgency based on severity
        urgency_map = {
            'Critical': 'immediate',
            'High': 'urgent',
            'Medium': 'moderate',
            'Low': 'routine',
            'None': 'preventive'
        }
        
        urgency = urgency_map.get(disease_info['severity'], 'moderate')
        
        recommendations = {
            'disease': disease_info['name'],
            'urgency': urgency,
            'immediate_actions': disease_info.get('treatment', []),
            'prevention_measures': disease_info.get('prevention', []),
            'expected_timeline': self._get_treatment_timeline(disease_info['severity']),
            'monitoring_schedule': self._get_monitoring_schedule(urgency),
            'additional_resources': [
                'Consult local agricultural extension office',
                'Consider soil testing if problem persists',
                'Document progression with photos'
            ]
        }
        
        return recommendations

    def _get_treatment_timeline(self, severity: str) -> str:
        """Get expected treatment timeline based on severity."""
        timelines = {
            'Critical': '24-48 hours for initial treatment, 1-2 weeks for results',
            'High': '2-3 days for treatment, 1-3 weeks for improvement',
            'Medium': '1 week for treatment, 2-4 weeks for results',
            'Low': '1-2 weeks for treatment, 3-6 weeks for results',
            'None': 'Ongoing preventive care'
        }
        return timelines.get(severity, '1-2 weeks for treatment response')

    def _get_monitoring_schedule(self, urgency: str) -> str:
        """Get monitoring schedule based on urgency."""
        schedules = {
            'immediate': 'Check daily for first week, then every 2-3 days',
            'urgent': 'Check every 2-3 days for first two weeks',
            'moderate': 'Check weekly for first month',
            'routine': 'Check bi-weekly',
            'preventive': 'Monthly inspection recommended'
        }
        return schedules.get(urgency, 'Weekly monitoring recommended')

    def analyze_batch_images(self, image_paths: List[str]) -> List[Dict]:
        """Analyze multiple images for disease detection."""
        results = []
        
        for i, image_path in enumerate(image_paths):
            try:
                with open(image_path, 'rb') as f:
                    image_data = f.read()
                
                result = self.predict_disease(image_data)
                result['image_id'] = i
                result['image_path'] = image_path
                results.append(result)
                
            except Exception as e:
                logger.error(f"Error analyzing {image_path}: {str(e)}")
                results.append({
                    'image_id': i,
                    'image_path': image_path,
                    'error': str(e),
                    'timestamp': datetime.now().isoformat()
                })
        
        return results

# Global detector instance
detector = SimplePlantDiseaseDetector()

def predict_disease_from_image(image_data: bytes) -> Dict:
    """Main function for disease prediction."""
    return detector.predict_disease(image_data)

def get_disease_information(disease_name: str) -> Dict:
    """Get detailed disease information."""
    return detector.get_disease_info(disease_name)

def get_treatment_plan(disease_name: str) -> Dict:
    """Get treatment recommendations."""
    return detector.get_treatment_recommendations(disease_name)

if __name__ == "__main__":
    print("🌱 Simple Plant Disease Detector - Testing")
    
    # Test with a sample image if available
    test_image_path = "sample_plant.jpg"
    if os.path.exists(test_image_path):
        try:
            with open(test_image_path, 'rb') as f:
                image_data = f.read()
            
            result = predict_disease_from_image(image_data)
            print(f"✅ Test prediction: {result['predicted_class']} ({result['confidence']:.3f})")
            
        except Exception as e:
            print(f"❌ Test failed: {str(e)}")
    else:
        print("ℹ️ No test image found. Upload an image to test the system.")
    
    print("🎯 Simple detector ready for use!")
