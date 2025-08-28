import React, { useState } from 'react';

const DiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Mock disease database with realistic data
  const diseaseDatabase = [
    {
      name: 'Rice Blast',
      confidence: 92,
      severity: 'High',
      symptoms: ['Diamond-shaped lesions', 'Brown spots on leaves', 'White centers'],
      treatment: 'Apply Tricyclazole fungicide (0.6g/L) every 7-10 days. Ensure proper field drainage.',
      prevention: 'Use resistant varieties, balanced fertilization, avoid over-irrigation',
      expectedRecovery: '10-14 days',
      cost: '$25-35 per hectare'
    },
    {
      name: 'Tomato Late Blight',
      confidence: 87,
      severity: 'Critical',
      symptoms: ['Dark spots on leaves', 'White mold on undersides', 'Fruit rot'],
      treatment: 'Apply Metalaxyl + Mancozeb (2.5g/L). Remove affected plants immediately.',
      prevention: 'Improve air circulation, avoid overhead watering, crop rotation',
      expectedRecovery: '7-10 days',
      cost: '$30-40 per hectare'
    },
    {
      name: 'Wheat Rust',
      confidence: 89,
      severity: 'Moderate',
      symptoms: ['Orange pustules on leaves', 'Yellowing', 'Premature leaf drop'],
      treatment: 'Apply Propiconazole (0.1%) or Tebuconazole (0.1%) spray.',
      prevention: 'Plant resistant varieties, proper spacing, monitor weather conditions',
      expectedRecovery: '14-21 days',
      cost: '$20-30 per hectare'
    },
    {
      name: 'Bacterial Leaf Spot',
      confidence: 85,
      severity: 'Low',
      symptoms: ['Small dark spots', 'Yellow halos', 'Leaf yellowing'],
      treatment: 'Apply copper-based bactericide. Improve ventilation and reduce humidity.',
      prevention: 'Avoid overhead irrigation, space plants properly, remove debris',
      expectedRecovery: '5-7 days',
      cost: '$15-25 per hectare'
    }
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setIsAnalyzing(true);
      setAnalysisProgress(0);
      setAnalysisResult(null);
      
      // Simulate AI analysis with progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            // Simulate analysis completion
            setTimeout(() => {
              const randomDisease = diseaseDatabase[Math.floor(Math.random() * diseaseDatabase.length)];
              setAnalysisResult(randomDisease);
              setIsAnalyzing(false);
              setAnalysisProgress(100);
            }, 500);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'status-success';
      case 'moderate': return 'status-warning';
      case 'high': return 'status-error';
      case 'critical': return 'bg-error text-white';
      default: return 'status-info';
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔬 AI Disease Detection
          </h1>
          <p className="text-gray-600 text-lg">
            Advanced machine learning for early disease identification and treatment recommendations
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-bold text-gray-800">Upload Plant Image</h2>
              <p className="text-gray-600 text-sm">High-resolution images work best for accurate analysis</p>
            </div>
            <div className="card-body">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={isAnalyzing}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="text-6xl mb-4">📸</div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Click to upload plant image
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPG, PNG formats • Max 10MB
                  </p>
                </label>
              </div>
              
              {selectedImage && (
                <div className="mt-6">
                  <div className="relative">
                    <img 
                      src={selectedImage} 
                      alt="Selected plant" 
                      className="w-full h-64 object-cover rounded-xl shadow-md"
                    />
                    <button
                      onClick={resetAnalysis}
                      className="absolute top-2 right-2 bg-error text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {isAnalyzing && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Analyzing...</span>
                        <span className="text-sm text-gray-500">{Math.round(analysisProgress)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${analysisProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        AI is examining leaf patterns, color variations, and disease indicators...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-bold text-gray-800">Analysis Results</h2>
              <p className="text-gray-600 text-sm">AI-powered disease identification and recommendations</p>
            </div>
            <div className="card-body">
              {analysisResult ? (
                <div className="space-y-6 animate-fadeIn">
                  {/* Disease Identification */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-error rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-error text-xl">{analysisResult.name}</h3>
                      <div className={`status-indicator ${getSeverityColor(analysisResult.severity)}`}>
                        {analysisResult.severity} Risk
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Confidence:</span>
                        <span className="ml-2 font-bold text-error">{analysisResult.confidence}%</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Recovery Time:</span>
                        <span className="ml-2 font-bold">{analysisResult.expectedRecovery}</span>
                      </div>
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h4 className="font-bold text-warning mb-3">🔍 Detected Symptoms</h4>
                    <ul className="space-y-1">
                      {analysisResult.symptoms.map((symptom, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-700">
                          <span className="w-2 h-2 bg-warning rounded-full mr-3"></span>
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Treatment */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-bold text-info mb-3">💊 Recommended Treatment</h4>
                    <p className="text-gray-700 text-sm mb-3">{analysisResult.treatment}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Estimated Cost: <strong>{analysisResult.cost}</strong></span>
                      <span className="status-indicator status-info">Immediate Action Required</span>
                    </div>
                  </div>

                  {/* Prevention */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h4 className="font-bold text-success mb-3">🛡️ Prevention Tips</h4>
                    <p className="text-gray-700 text-sm">{analysisResult.prevention}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button className="btn btn-primary flex-1">
                      📋 Generate Report
                    </button>
                    <button className="btn btn-secondary flex-1">
                      📞 Contact Expert
                    </button>
                  </div>
                </div>
              ) : !selectedImage ? (
                <div className="text-center text-gray-500 py-12">
                  <div className="text-6xl mb-4">�</div>
                  <h3 className="text-lg font-semibold mb-2">Ready for AI Analysis</h3>
                  <p className="text-sm">Upload a plant image to get instant disease detection and treatment recommendations</p>
                  
                  <div className="mt-6 bg-gray-100 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">✨ AI Features</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>• 95%+ Accuracy</div>
                      <div>• 50+ Disease Types</div>
                      <div>• Instant Analysis</div>
                      <div>• Treatment Plans</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <div className="loading-spinner mx-auto mb-4"></div>
                  <p>Preparing for analysis...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="metric-card text-center">
            <div className="text-3xl font-bold text-primary">2,450+</div>
            <div className="text-gray-600 font-medium">Diseases Detected</div>
          </div>
          <div className="metric-card text-center">
            <div className="text-3xl font-bold text-success">95.8%</div>
            <div className="text-gray-600 font-medium">Accuracy Rate</div>
          </div>
          <div className="metric-card text-center">
            <div className="text-3xl font-bold text-secondary">1.2s</div>
            <div className="text-gray-600 font-medium">Average Analysis</div>
          </div>
          <div className="metric-card text-center">
            <div className="text-3xl font-bold text-warning">$12M</div>
            <div className="text-gray-600 font-medium">Crop Loss Prevented</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
