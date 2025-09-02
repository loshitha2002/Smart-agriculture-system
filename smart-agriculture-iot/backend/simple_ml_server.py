#!/usr/bin/env python3
"""
Smart Agriculture IoT System
Simplified Flask API Server for Plant Disease Detection

This server provides REST API endpoints for plant disease detection
using simplified mock classification for demonstration.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import logging
from datetime import datetime
import json
from PIL import Image
import io

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

try:
    from ml.simplePlantDetector import (
        predict_disease_from_image,
        get_disease_information,
        get_treatment_plan,
        detector
    )
    DETECTOR_AVAILABLE = True
    print("✅ Simplified plant detector loaded successfully")
except ImportError as e:
    print(f"⚠️ Detector not available: {e}")
    DETECTOR_AVAILABLE = False

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Maximum file size (16MB)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}

def allowed_file(filename):
    """Check if uploaded file has allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'Plant Disease Detection API',
        'version': '1.0.0',
        'detector_available': DETECTOR_AVAILABLE,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/detect', methods=['POST'])
def detect_disease():
    """
    Detect plant disease from uploaded image.
    
    Expects: multipart/form-data with 'image' file
    Returns: JSON with disease prediction and details
    """
    try:
        # Check if image file is present
        if 'image' not in request.files:
            return jsonify({
                'error': 'No image file provided',
                'message': 'Please upload an image file'
            }), 400
        
        file = request.files['image']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({
                'error': 'No file selected',
                'message': 'Please select an image file'
            }), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({
                'error': 'Invalid file type',
                'message': f'Allowed types: {", ".join(ALLOWED_EXTENSIONS)}',
                'received': file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'unknown'
            }), 400
        
        # Read image data
        image_data = file.read()
        
        # Validate image can be opened
        try:
            img = Image.open(io.BytesIO(image_data))
            img.verify()  # Verify it's a valid image
        except Exception as e:
            return jsonify({
                'error': 'Invalid image file',
                'message': f'Could not process image: {str(e)}'
            }), 400
        
        # Perform disease detection
        if DETECTOR_AVAILABLE:
            result = predict_disease_from_image(image_data)
            
            # Get additional disease information
            disease_info = get_disease_information(result['predicted_class'])
            treatment_plan = get_treatment_plan(result['predicted_class'])
            
            # Combine all information
            response = {
                'success': True,
                'prediction': result,
                'disease_info': disease_info,
                'treatment': treatment_plan,
                'api_version': '1.0.0',
                'processing_time': datetime.now().isoformat()
            }
            
            logger.info(f"Disease detected: {result['predicted_class']} (confidence: {result['confidence']})")
            return jsonify(response)
        
        else:
            # Fallback mock response
            mock_result = {
                'predicted_class': 'Tomato___Early_blight',
                'confidence': 0.85,
                'disease_name': 'Early Blight',
                'severity': 'Medium',
                'is_healthy': False,
                'timestamp': datetime.now().isoformat(),
                'model_version': 'Mock-v1.0'
            }
            
            return jsonify({
                'success': True,
                'prediction': mock_result,
                'message': 'Using mock detection - install ML dependencies for real analysis',
                'api_version': '1.0.0'
            })
    
    except Exception as e:
        logger.error(f"Error in disease detection: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/disease/info/<disease_name>', methods=['GET'])
def get_disease_info(disease_name):
    """Get detailed information about a specific disease."""
    try:
        if DETECTOR_AVAILABLE:
            disease_info = get_disease_information(disease_name)
            return jsonify({
                'success': True,
                'disease': disease_name,
                'info': disease_info,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'error': 'Detector not available',
                'message': 'Install ML dependencies to access disease information'
            }), 503
    
    except Exception as e:
        logger.error(f"Error getting disease info: {str(e)}")
        return jsonify({
            'error': 'Error retrieving disease information',
            'message': str(e)
        }), 500

@app.route('/api/diseases/list', methods=['GET'])
def list_diseases():
    """Get list of all detectable diseases."""
    try:
        if DETECTOR_AVAILABLE:
            diseases = detector.class_names
            return jsonify({
                'success': True,
                'diseases': diseases,
                'count': len(diseases),
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'error': 'Detector not available',
                'message': 'Install ML dependencies to access disease list'
            }), 503
    
    except Exception as e:
        logger.error(f"Error listing diseases: {str(e)}")
        return jsonify({
            'error': 'Error retrieving disease list',
            'message': str(e)
        }), 500

@app.route('/api/treatment/<disease_name>', methods=['GET'])
def get_treatment_recommendations(disease_name):
    """Get treatment recommendations for a specific disease."""
    try:
        if DETECTOR_AVAILABLE:
            treatment_plan = get_treatment_plan(disease_name)
            return jsonify({
                'success': True,
                'disease': disease_name,
                'treatment': treatment_plan,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'error': 'Detector not available',
                'message': 'Install ML dependencies to access treatment recommendations'
            }), 503
    
    except Exception as e:
        logger.error(f"Error getting treatment info: {str(e)}")
        return jsonify({
            'error': 'Error retrieving treatment information',
            'message': str(e)
        }), 500

@app.route('/api/analyze/batch', methods=['POST'])
def analyze_batch():
    """Analyze multiple images for disease detection."""
    try:
        if 'images' not in request.files:
            return jsonify({
                'error': 'No images provided',
                'message': 'Please upload one or more image files'
            }), 400
        
        files = request.files.getlist('images')
        
        if not files or all(f.filename == '' for f in files):
            return jsonify({
                'error': 'No files selected',
                'message': 'Please select image files to analyze'
            }), 400
        
        results = []
        
        for i, file in enumerate(files):
            try:
                if file and allowed_file(file.filename):
                    image_data = file.read()
                    
                    if DETECTOR_AVAILABLE:
                        result = predict_disease_from_image(image_data)
                        result['image_id'] = i
                        result['filename'] = file.filename
                        results.append(result)
                    else:
                        # Mock result for each image
                        mock_result = {
                            'image_id': i,
                            'filename': file.filename,
                            'predicted_class': 'Mock_Detection',
                            'confidence': 0.75,
                            'message': 'Mock analysis - install ML dependencies'
                        }
                        results.append(mock_result)
                        
            except Exception as e:
                logger.error(f"Error analyzing image {i}: {str(e)}")
                results.append({
                    'image_id': i,
                    'filename': file.filename if file else 'unknown',
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'results': results,
            'total_images': len(files),
            'processed_images': len(results),
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error in batch analysis: {str(e)}")
        return jsonify({
            'error': 'Batch analysis failed',
            'message': str(e)
        }), 500

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error."""
    return jsonify({
        'error': 'File too large',
        'message': 'Maximum file size is 16MB'
    }), 413

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors."""
    return jsonify({
        'error': 'Endpoint not found',
        'message': 'The requested API endpoint does not exist'
    }), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle internal server errors."""
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500

if __name__ == '__main__':
    print("🚀 Starting Smart Agriculture ML Server...")
    print("📡 Available endpoints:")
    print("   GET  /health - Health check")
    print("   POST /api/detect - Disease detection")
    print("   GET  /api/disease/info/<name> - Disease information")
    print("   GET  /api/diseases/list - List all diseases")
    print("   GET  /api/treatment/<name> - Treatment recommendations")
    print("   POST /api/analyze/batch - Batch analysis")
    print()
    
    # Run the Flask development server
    app.run(
        host='0.0.0.0',  # Allow external connections
        port=5001,       # Different port from Node.js backend
        debug=True,      # Enable debug mode for development
        threaded=True    # Enable threading for concurrent requests
    )
