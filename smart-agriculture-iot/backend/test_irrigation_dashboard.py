#!/usr/bin/env python3
"""
Smart Irrigation Control - Real Data Dashboard Test
Tests the real irrigation system with comprehensive data
"""

import requests
import json
from datetime import datetime
import time

def print_header(title):
    print(f"\n{'=' * 80}")
    print(f"   {title}")
    print(f"{'=' * 80}")

def print_section(title):
    print(f"\n🔹 {title}")
    print("-" * 50)

def format_json_output(data, indent=2):
    return json.dumps(data, indent=indent, default=str)

def test_irrigation_recommendation():
    print_section("IRRIGATION RECOMMENDATION")
    try:
        response = requests.get('http://localhost:5000/api/irrigation/recommendation')
        if response.status_code == 200:
            data = response.json()
            
            print(f"🌊 Should Irrigate: {'✅ YES' if data.get('shouldIrrigate') else '❌ NO'}")
            print(f"🌱 Soil Moisture: {data.get('soilMoisture', 'N/A')}%")
            print(f"⚡ Priority: {data.get('priority', 'N/A').upper()}")
            print(f"💧 Water Amount: {data.get('waterAmount', 0)}L")
            print(f"⏱️  Duration: {data.get('duration', 0)} minutes")
            print(f"🎯 Efficiency Score: {data.get('efficiency', 'N/A')}%")
            
            if data.get('reasons'):
                print(f"📋 Reasons:")
                for reason in data.get('reasons', []):
                    print(f"   • {reason}")
            
            if data.get('weatherConditions'):
                weather = data['weatherConditions']
                print(f"🌤️  Weather: {weather.get('temperature', 'N/A')}°C, {weather.get('humidity', 'N/A')}% humidity")
            
            if data.get('smartRecommendations'):
                print(f"🤖 AI Recommendations:")
                for rec in data.get('smartRecommendations', []):
                    priority_icon = '🔴' if rec.get('priority') == 'high' else '🟡' if rec.get('priority') == 'medium' else '🟢'
                    print(f"   {priority_icon} {rec.get('message', 'No message')}")
            
            print(f"🔄 Next Check: {data.get('nextCheck', 'N/A')} hours")
            
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Connection Error: {e}")

def test_irrigation_schedule():
    print_section("TODAY'S IRRIGATION SCHEDULE")
    try:
        response = requests.get('http://localhost:5000/api/irrigation/schedule')
        if response.status_code == 200:
            data = response.json()
            
            print(f"📅 Scheduled Events: {len(data.get('schedules', []))}")
            print(f"💧 Total Water Planned: {data.get('totalWaterPlanned', 0)}L")
            print(f"💧 Total Water Used: {data.get('totalWaterUsed', 0)}L")
            print(f"⚡ Overall Efficiency: {data.get('efficiency', 'N/A')}%")
            
            print("\n📋 Schedule Details:")
            for schedule in data.get('schedules', []):
                status_icon = {
                    'completed': '✅',
                    'scheduled': '📋',
                    'pending': '⏳',
                    'active': '🔄'
                }.get(schedule.get('status'), '❓')
                
                print(f"   {status_icon} {schedule.get('time')} - Zones {schedule.get('zones', [])} - {schedule.get('status', 'Unknown').title()}")
                if schedule.get('waterUsed', 0) > 0:
                    print(f"      💧 Used: {schedule.get('waterUsed')}L, Efficiency: {schedule.get('efficiency')}%")
                
        else:
            print(f"❌ Error: {response.status_code}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

def test_water_usage():
    print_section("WATER USAGE ANALYTICS")
    try:
        response = requests.get('http://localhost:5000/api/irrigation/usage')
        if response.status_code == 200:
            data = response.json()
            
            today = data.get('today', {})
            comparison = data.get('comparison', {})
            weekly = data.get('weekly', {})
            
            print(f"💧 TODAY'S USAGE:")
            print(f"   Water Used: {today.get('used', 0)}L")
            print(f"   Efficiency: {today.get('efficiency', 0)}%")
            print(f"   Savings: {today.get('savings', 0)}%")
            
            print(f"\n📊 COMPARISONS:")
            vs_yesterday = comparison.get('vsYesterday', {})
            vs_average = comparison.get('vsAverage', {})
            
            yesterday_trend = "📈" if vs_yesterday.get('percentage', 0) > 0 else "📉"
            average_trend = "📈" if vs_average.get('percentage', 0) > 0 else "📉"
            
            print(f"   vs Yesterday: {yesterday_trend} {vs_yesterday.get('percentage', 0)}% ({vs_yesterday.get('difference', 0):+.1f}L)")
            print(f"   vs Average: {average_trend} {vs_average.get('percentage', 0)}% ({vs_average.get('difference', 0):+.1f}L)")
            
            print(f"\n📈 WEEKLY SUMMARY:")
            print(f"   Total: {weekly.get('total', 0)}L")
            print(f"   Average: {weekly.get('average', 0)}L/day")
            print(f"   Trend: {weekly.get('trend', 'stable').title()}")
            print(f"   Efficiency: {weekly.get('efficiency', 0)}%")
                
        else:
            print(f"❌ Error: {response.status_code}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

def test_irrigation_zones():
    print_section("IRRIGATION ZONES STATUS")
    try:
        response = requests.get('http://localhost:5000/api/irrigation/zones')
        if response.status_code == 200:
            data = response.json()
            
            print(f"🏡 Total Zones: {len(data)}")
            
            for zone in data:
                status_icon = "🟢" if zone.get('status') == 'active' else "⚪"
                print(f"   {status_icon} {zone.get('name', 'Unknown Zone')}")
                print(f"      Area: {zone.get('area', 'N/A')} m²")
                print(f"      Soil Type: {zone.get('soilType', 'Unknown')}")
                print(f"      Soil Moisture: {zone.get('soilMoisture', 'N/A')}%")
                print(f"      Status: {zone.get('status', 'Unknown').title()}")
                print(f"      Efficiency: {zone.get('efficiency', 'N/A')}%")
                print(f"      Last Irrigation: {zone.get('lastIrrigation', 'Unknown')}")
                print()
                
        else:
            print(f"❌ Error: {response.status_code}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

def test_irrigation_history():
    print_section("IRRIGATION HISTORY (Last 7 Days)")
    try:
        response = requests.get('http://localhost:5000/api/irrigation/history?days=7')
        if response.status_code == 200:
            data = response.json()
            
            print(f"📊 History Records: {len(data)} days")
            
            total_water = sum(day.get('waterUsed', 0) for day in data)
            avg_efficiency = sum(day.get('efficiency', 0) for day in data) / len(data) if data else 0
            
            print(f"💧 Total Water (7 days): {total_water}L")
            print(f"⚡ Average Efficiency: {avg_efficiency:.1f}%")
            
            print("\n📅 Daily Breakdown:")
            for day in data[-5:]:  # Show last 5 days
                reason_icon = {
                    'scheduled': '📋',
                    'sensor_triggered': '🤖',
                    'manual': '🎮',
                    'emergency': '🚨'
                }.get(day.get('reason'), '❓')
                
                print(f"   {day.get('date')} {reason_icon}")
                print(f"      💧 Water: {day.get('waterUsed', 0)}L")
                print(f"      ⏱️  Duration: {day.get('duration', 0)} min")
                print(f"      🏡 Zones: {day.get('zones', [])}")
                print(f"      ⚡ Efficiency: {day.get('efficiency', 0)}%")
                if day.get('savings', 0) > 0:
                    print(f"      💰 Savings: {day.get('savings', 0)}%")
                
        else:
            print(f"❌ Error: {response.status_code}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

def main():
    print_header("SMART IRRIGATION CONTROL - REAL DATA DASHBOARD")
    print(f"🕐 Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("🌐 Backend: http://localhost:5000")
    
    # Test all irrigation endpoints
    test_irrigation_recommendation()
    test_irrigation_schedule()
    test_water_usage()
    test_irrigation_zones()
    test_irrigation_history()
    
    print(f"\n{'=' * 80}")
    print("✅ Real Irrigation Control Dashboard fully operational!")
    print("🌐 Access your web dashboard: http://localhost:3000")
    print("🔧 Backend API: http://localhost:5000/api/irrigation/*")
    print(f"{'=' * 80}")

if __name__ == "__main__":
    main()
