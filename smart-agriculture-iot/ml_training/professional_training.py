#!/usr/bin/env python3
"""
Professional Plant Disease Image Collector
==========================================
Helps collect high-quality training images for professional AI model training.
"""

import os
import requests
import json
from pathlib import Path
import time
import random

class ProfessionalImageCollector:
    def __init__(self, dataset_dir="training_dataset"):
        self.dataset_dir = Path(dataset_dir)
        self.diseases = {
            'healthy': {
                'search_terms': ['healthy rice plant', 'healthy wheat plant', 'healthy corn plant', 'green healthy leaves'],
                'target_count': 100,
                'description': 'Healthy plants with vibrant green leaves, no disease symptoms'
            },
            'bacterial_blight': {
                'search_terms': ['bacterial blight rice', 'bacterial leaf blight', 'rice bacterial disease'],
                'target_count': 80,
                'description': 'Water-soaked lesions, yellowing, wilting symptoms'
            },
            'brown_spot': {
                'search_terms': ['brown spot disease rice', 'fungal brown spots leaves', 'rice brown spot'],
                'target_count': 80,
                'description': 'Circular brown spots with yellow halos on leaves'
            },
            'leaf_blast': {
                'search_terms': ['rice blast disease', 'leaf blast fungus', 'rice pyricularia'],
                'target_count': 80,
                'description': 'Diamond-shaped lesions, gray centers, brown borders'
            },
            'tungro_virus': {
                'search_terms': ['rice tungro virus', 'yellow dwarf rice', 'tungro disease'],
                'target_count': 60,
                'description': 'Yellow-orange discoloration, stunted growth'
            },
            'bacterial_leaf_streak': {
                'search_terms': ['bacterial leaf streak rice', 'rice bacterial streak', 'xanthomonas oryzae'],
                'target_count': 60,
                'description': 'Yellow to brown streaks along leaf veins'
            },
            'sheath_blight': {
                'search_terms': ['rice sheath blight', 'rhizoctonia solani rice', 'sheath rot disease'],
                'target_count': 60,
                'description': 'Oval lesions on leaf sheaths, grayish-white centers'
            },
            'anthracnose': {
                'search_terms': ['anthracnose disease plant', 'colletotrichum leaf spot', 'anthracnose symptoms'],
                'target_count': 60,
                'description': 'Dark sunken spots, pink spore masses in humid conditions'
            }
        }
    
    def create_collection_guide(self):
        """Create comprehensive guide for professional image collection"""
        guide_content = """# Professional Plant Disease Image Collection Guide

## 🎯 Quality Standards for Medical-Grade AI Training

### Image Requirements:
- **Resolution**: Minimum 800x600 pixels (preferably 1024x768 or higher)
- **Format**: JPG or PNG
- **Lighting**: Natural daylight preferred, avoid flash
- **Focus**: Sharp, clear images with good detail
- **Background**: Minimal background clutter
- **Angle**: Various angles - top view, side view, close-ups

### Professional Sources:

#### 1. Academic Databases:
- **PlantNet Database**: https://plantnet.org/
- **USDA Plant Disease Database**: https://www.ars.usda.gov/
- **University Extension Services**: Local agricultural universities
- **Research Papers**: Google Scholar + "plant disease images"

#### 2. Agricultural Organizations:
- **FAO Plant Health**: http://www.fao.org/plant-health/
- **CABI Crop Protection**: https://www.cabi.org/
- **IRRI Rice Knowledge Bank**: http://www.knowledgebank.irri.org/
- **Agricultural Research Stations**: Regional centers

#### 3. Professional Photography:
- **Field Surveys**: Take your own high-quality photos
- **Farmer Partnerships**: Work with local farmers
- **Agricultural Consultants**: Professional disease scouts
- **Research Collaborations**: University plant pathology labs

## 📊 Target Image Counts (Professional Grade):

"""
        
        for disease, info in self.diseases.items():
            guide_content += f"### {disease.replace('_', ' ').title()}:\n"
            guide_content += f"- **Target**: {info['target_count']} images\n"
            guide_content += f"- **Description**: {info['description']}\n"
            guide_content += f"- **Search Terms**: {', '.join(info['search_terms'])}\n\n"
        
        guide_content += """
## 🔬 Image Quality Checklist:

### For Each Disease Class:
- [ ] Clear disease symptoms visible
- [ ] Multiple plant varieties (rice, wheat, corn, etc.)
- [ ] Different stages of disease progression
- [ ] Various lighting conditions
- [ ] Different camera angles
- [ ] Multiple backgrounds (field, lab, greenhouse)

### Technical Standards:
- [ ] Images > 800x600 resolution
- [ ] Good contrast and brightness
- [ ] Sharp focus on disease symptoms
- [ ] No watermarks or text overlays
- [ ] Consistent file naming convention

## 📁 Folder Organization:

```
training_dataset/
├── healthy/          (100 images target)
├── bacterial_blight/ (80 images target)
├── brown_spot/       (80 images target)
├── leaf_blast/       (80 images target)
├── tungro_virus/     (60 images target)
├── bacterial_leaf_streak/ (60 images target)
├── sheath_blight/    (60 images target)
└── anthracnose/      (60 images target)
```

## ⏱️ Collection Timeline:

### Week 1: Research and Planning
- Identify local agricultural resources
- Contact university extension services
- Setup data collection protocols

### Week 2: Image Collection
- Download from academic databases
- Field photography sessions
- Quality control and sorting

### Week 3: Training and Validation
- Run professional training
- Model validation and testing
- Performance optimization

## 🎯 Expected Results:

With this professional approach:
- **Training Accuracy**: 95-98%
- **Validation Accuracy**: 90-95%
- **Real-world Performance**: Medical-grade
- **Confidence Scores**: Highly reliable
- **Deployment Ready**: Yes

## 📞 Professional Resources:

### Contact Information:
- **Local Extension Office**: [Your area agricultural extension]
- **University Plant Pathology**: [Nearest agricultural university]
- **Agricultural Research Stations**: [Regional research centers]
- **Plant Disease Societies**: Professional organizations

### Online Resources:
- **PlantNet**: https://plantnet.org/
- **iNaturalist**: https://www.inaturalist.org/
- **GBIF**: https://www.gbif.org/
- **EOL**: https://eol.org/

Remember: Quality over quantity! 50 high-quality, diverse images per class 
will outperform 200 low-quality, similar images.
"""
        
        with open(self.dataset_dir / "PROFESSIONAL_COLLECTION_GUIDE.md", 'w', encoding='utf-8') as f:
            f.write(guide_content)
        
        print("✅ Professional collection guide created!")
        print(f"📖 See: {self.dataset_dir}/PROFESSIONAL_COLLECTION_GUIDE.md")
    
    def check_collection_progress(self):
        """Check current collection progress"""
        print("\n📊 Professional Training Progress:")
        print("="*50)
        
        total_images = 0
        total_target = 0
        
        for disease, info in self.diseases.items():
            disease_dir = self.dataset_dir / disease
            if disease_dir.exists():
                current_count = len([f for f in disease_dir.iterdir() 
                                   if f.suffix.lower() in ['.jpg', '.jpeg', '.png']])
            else:
                current_count = 0
            
            target_count = info['target_count']
            progress = (current_count / target_count) * 100
            total_images += current_count
            total_target += target_count
            
            status = "✅" if current_count >= target_count else "⏳"
            print(f"{status} {disease.ljust(20)}: {current_count:3d}/{target_count:3d} ({progress:5.1f}%)")
        
        overall_progress = (total_images / total_target) * 100
        print("-"*50)
        print(f"📈 Overall Progress: {total_images}/{total_target} ({overall_progress:.1f}%)")
        
        if overall_progress >= 80:
            print("\n🎉 Ready for professional training!")
        elif overall_progress >= 50:
            print("\n⚠️ Partial dataset - can start initial training")
        else:
            print("\n📝 Need more images for professional results")
        
        return total_images, total_target
    
    def create_training_checklist(self):
        """Create professional training checklist"""
        checklist = """# Professional Training Checklist

## Pre-Training Validation:
- [ ] All disease classes have 50+ images
- [ ] Images are high resolution (800x600+)
- [ ] Clear disease symptoms visible
- [ ] Multiple plant varieties included
- [ ] Good lighting and focus quality
- [ ] No duplicate or near-duplicate images

## Training Configuration:
- [ ] Use EfficientNetB3 or ResNet50V2 architecture
- [ ] Set epochs to 50-100 for professional results
- [ ] Enable data augmentation
- [ ] Use validation split (20%)
- [ ] Configure early stopping
- [ ] Save best model weights

## Training Commands:
```bash
# Professional training (2-3 hours)
python train_disease_model.py --data_dir training_dataset --epochs 75 --model EfficientNetB3 --batch_size 16

# Alternative faster training (1 hour)
python train_disease_model.py --data_dir training_dataset --epochs 50 --model ResNet50V2 --batch_size 32
```

## Post-Training Validation:
- [ ] Training accuracy > 95%
- [ ] Validation accuracy > 90%
- [ ] No significant overfitting
- [ ] Test on new images
- [ ] Validate confidence scores
- [ ] Check confusion matrix

## Deployment:
- [ ] Copy trained model to backend
- [ ] Update class names file
- [ ] Restart ML server
- [ ] Test disease detection in web app
- [ ] Validate with real field images

## Expected Performance:
- Medical-grade accuracy (90%+ validation)
- Reliable confidence scores
- Professional disease recommendations
- Suitable for agricultural guidance
"""
        
        with open(self.dataset_dir / "TRAINING_CHECKLIST.md", 'w', encoding='utf-8') as f:
            f.write(checklist)
        
        print("✅ Professional training checklist created!")

def main():
    """Main function"""
    print("🏥 Professional Plant Disease AI Training Setup")
    print("="*50)
    
    collector = ProfessionalImageCollector()
    
    print("\n📋 Professional Training Options:")
    print("1. Create comprehensive collection guide")
    print("2. Check current collection progress") 
    print("3. Create professional training checklist")
    print("4. All of the above")
    
    choice = input("\nSelect option (1-4): ").strip()
    
    if choice == "1" or choice == "4":
        collector.create_collection_guide()
    
    if choice == "2" or choice == "4":
        collector.check_collection_progress()
    
    if choice == "3" or choice == "4":
        collector.create_training_checklist()
    
    if choice == "4":
        print("\n🎉 Professional Training Setup Complete!")
        print("\n📝 Next Steps:")
        print("1. Follow PROFESSIONAL_COLLECTION_GUIDE.md")
        print("2. Collect 50+ high-quality images per disease class")
        print("3. Use TRAINING_CHECKLIST.md for quality control")
        print("4. Run professional training (2-3 hours)")
        print("5. Achieve medical-grade accuracy (90%+)")
        
        print("\n⏱️ Professional Timeline:")
        print("• Image Collection: 3-7 days")
        print("• Training: 2-3 hours")
        print("• Validation: 1 hour")
        print("• Total: 1-2 weeks for production-ready AI")

if __name__ == "__main__":
    main()
