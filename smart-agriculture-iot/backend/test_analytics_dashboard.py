#!/usr/bin/env python3
"""
Real Analytics Performance Dashboard
Display comprehensive analytics from your Smart Agriculture system
"""
import requests
import json
from datetime import datetime

def display_analytics_dashboard():
    print("📊" + "="*70)
    print("   REAL ANALYTICS PERFORMANCE DASHBOARD - SMART AGRICULTURE")
    print("="*72)
    print()
    
    try:
        # 1. Historical Data Analysis
        print("📈 HISTORICAL DATA (Last 7 Days):")
        print("-" * 40)
        response = requests.get('http://localhost:5000/api/analytics/historical?days=7')
        historical = response.json()
        
        if historical['success']:
            data = historical['data']
            metadata = historical.get('metadata', {})
            
            print(f"📊 Total Days Analyzed: {len(data)}")
            print(f"🔍 Real Data Days: {metadata.get('realDataDays', 0)}")
            print(f"⚡ Data Collection: {'Active' if metadata.get('dataCollectionActive') else 'Inactive'}")
            print()
            
            # Show recent trends
            if len(data) >= 2:
                latest = data[-1]
                previous = data[-2]
                
                print("📊 Latest Performance Metrics:")
                print(f"  🌡️  Temperature: {latest['temperature']:.1f}°C")
                print(f"  💧 Humidity: {latest['humidity']:.1f}%")
                print(f"  🌱 Soil Moisture: {latest['soilMoisture']:.1f}%")
                print(f"  💡 Light Intensity: {latest['lightIntensity']:.0f} lux")
                print(f"  🌿 Plant Health: {latest['plantHealth']:.0f}/100")
                print(f"  💰 Yield Estimate: {latest['yield']:.0f}%")
                print(f"  💦 Water Usage: {latest['waterUsage']:.1f}L")
                print(f"  ⚡ Energy Consumption: {latest['energyConsumption']:.1f} kWh")
                
                # Trend indicators
                temp_trend = "📈" if latest['temperature'] > previous['temperature'] else "📉" if latest['temperature'] < previous['temperature'] else "➡️"
                health_trend = "📈" if latest['plantHealth'] > previous['plantHealth'] else "📉" if latest['plantHealth'] < previous['plantHealth'] else "➡️"
                
                print(f"\n📊 24h Trends:")
                print(f"  Temperature: {temp_trend} {latest['temperature'] - previous['temperature']:+.1f}°C")
                print(f"  Plant Health: {health_trend} {latest['plantHealth'] - previous['plantHealth']:+.0f} points")
        print()
        
        # 2. Predictions and Forecasts
        print("🔮 PREDICTIVE ANALYTICS:")
        print("-" * 40)
        response = requests.get('http://localhost:5000/api/analytics/predictions')
        predictions = response.json()
        
        if predictions['success']:
            pred_data = predictions['predictions']
            next_week = pred_data.get('nextWeek', {})
            
            print("📅 Next Week Predictions:")
            if 'temperature' in next_week:
                temp = next_week['temperature']
                print(f"  🌡️  Temperature: {temp['min']:.1f}°C - {temp['max']:.1f}°C ({temp['trend']})")
            
            if 'humidity' in next_week:
                humidity = next_week['humidity']
                print(f"  💧 Humidity: {humidity['average']:.1f}% ({humidity['trend']})")
            
            if 'soilMoisture' in next_week:
                soil = next_week['soilMoisture']
                print(f"  🌱 Soil Status: {soil['level']}")
                if 'days_until_watering' in soil:
                    print(f"  💦 Next Watering: {soil['days_until_watering']} days")
            
            if 'yield' in next_week:
                yield_data = next_week['yield']
                print(f"  💰 Yield Estimate: {yield_data['estimate']:.0f}% (confidence: {yield_data['confidence']}%)")
            
            # Alerts
            if 'alerts' in pred_data and pred_data['alerts']:
                print(f"\n🚨 Active Alerts:")
                for alert in pred_data['alerts']:
                    icon = "🔴" if alert['type'] == 'danger' else "⚠️" if alert['type'] == 'warning' else "ℹ️"
                    print(f"  {icon} {alert['message']} (Priority: {alert['priority']})")
            
            # Recommendations
            if 'recommendations' in pred_data and pred_data['recommendations']:
                print(f"\n💡 Smart Recommendations:")
                for rec in pred_data['recommendations']:
                    print(f"  • {rec}")
        print()
        
        # 3. Efficiency Metrics
        print("⚡ EFFICIENCY ANALYSIS:")
        print("-" * 40)
        response = requests.get('http://localhost:5000/api/analytics/efficiency')
        efficiency = response.json()
        
        if efficiency['success']:
            metrics = efficiency['metrics']
            eff_data = metrics.get('efficiency', {})
            improvements = metrics.get('improvements', {})
            
            print("📊 Current Efficiency Scores:")
            print(f"  💧 Water Efficiency: {eff_data.get('water_efficiency', 0):.2f} yield/L")
            print(f"  ⚡ Energy Efficiency: {eff_data.get('energy_efficiency', 0):.2f} yield/kWh")
            print(f"  🌱 Yield Efficiency: {eff_data.get('yield_efficiency', 0):.0f}%")
            print(f"  🏆 Overall Score: {eff_data.get('overall_score', 0):.0f}/100")
            
            print(f"\n📈 Recent Improvements:")
            water_savings = improvements.get('water_savings', 0)
            energy_savings = improvements.get('energy_savings', 0)
            yield_improvement = improvements.get('yield_improvement', 0)
            
            print(f"  💧 Water Savings: {water_savings:+.0f}%")
            print(f"  ⚡ Energy Savings: {energy_savings:+.0f}%")
            print(f"  🌱 Yield Improvement: {yield_improvement:+.0f}%")
        print()
        
        # 4. Comparative Analysis
        print("📊 COMPARATIVE ANALYSIS:")
        print("-" * 40)
        response = requests.get('http://localhost:5000/api/analytics/comparison')
        comparison = response.json()
        
        if comparison['success']:
            analysis = comparison['analysis']
            performance = analysis.get('performance_comparison', {})
            trends = analysis.get('trend_analysis', {})
            insights = analysis.get('insights', [])
            
            print("📈 Performance vs Previous Week:")
            if 'yield' in performance:
                yield_data = performance['yield']
                change_icon = "📈" if yield_data['change'] > 0 else "📉" if yield_data['change'] < 0 else "➡️"
                print(f"  🌱 Yield: {yield_data['current']:.0f}% {change_icon} {yield_data['change']:+.0f}%")
            
            if 'efficiency' in performance:
                eff_data = performance['efficiency']
                change_icon = "📈" if eff_data['change'] > 0 else "📉" if eff_data['change'] < 0 else "➡️"
                print(f"  ⚡ Efficiency: {eff_data['current']:.0f}/100 {change_icon} {eff_data['change']:+.0f}")
            
            if 'plantHealth' in performance:
                health_data = performance['plantHealth']
                change_icon = "📈" if health_data['change'] > 0 else "📉" if health_data['change'] < 0 else "➡️"
                print(f"  🌿 Plant Health: {health_data['current']:.0f}/100 {change_icon} {health_data['change']:+.0f}")
            
            print(f"\n🔍 Trend Analysis:")
            print(f"  🌱 Yield Trend: {trends.get('yield', 'unknown')}")
            print(f"  🌿 Health Trend: {trends.get('plant_health', 'unknown')}")
            print(f"  📊 Data Confidence: {trends.get('confidence', 0)*100:.0f}%")
            
            if insights:
                print(f"\n💡 Key Insights:")
                for insight in insights:
                    print(f"  • {insight}")
        
        print()
        print("✅ Real Analytics Dashboard fully operational!")
        print(f"🕐 Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Access your web dashboard: http://localhost:3000")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to analytics service. Make sure the backend is running.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    display_analytics_dashboard()
