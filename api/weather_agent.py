import os
import requests
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from typing import List, Dict

class WeatherAgent:
    def __init__(self):
        self.weather_api_key = os.getenv("OPENWEATHER_API_KEY")
        self.llm = ChatOpenAI(temperature=0.7, model="gpt-4o") # Assumes OPENAI_API_KEY is in env

    def fetch_weather(self, lat: float, lon: float) -> dict:
        """Fetches 48h weather forecast from OpenWeatherMap."""
        if not self.weather_api_key:
            return {"error": "Missing OpenWeather API Key"}
        
        url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={self.weather_api_key}&units=metric"
        response = requests.get(url)
        if response.status_code == 200:
            return response.json()
        return {"error": f"Failed to fetch weather: {response.text}"}

    def get_advice(self, lat: float, lon: float, plants: List[Dict]) -> str:
        """Analyzes weather and plant list to generate actionable advice."""
        weather_data = self.fetch_weather(lat, lon)
        
        if "error" in weather_data:
            weather_summary = "Weather data currently unavailable."
        else:
            # Extract basic forecast to keep prompt context concise
            # Just look at the next 48 hours (approx 16 3-hour periods)
            forecasts = weather_data.get('list', [])[:16]
            temps = [f['main']['temp'] for f in forecasts]
            min_temp = min(temps) if temps else "Unknown"
            max_temp = max(temps) if temps else "Unknown"
            weather_desc = forecasts[0]['weather'][0]['description'] if forecasts else "Unknown"
            
            weather_summary = f"Expect {weather_desc}. Temperatures will range from {min_temp}°C to {max_temp}°C over the next 48 hours."

        plant_list_str = ", ".join([f"{p['name']} ({p.get('type', 'Unknown type')})" for p in plants])
        
        prompt = PromptTemplate(
            input_variables=["weather", "plants"],
            template="""You are an expert, hyper-local gardening AI agent.
            
Weather Forecast (Next 48h): {weather}
User's Plants: {plants}

Based on the weather forecast, analyze potential risks to the user's specific plants (e.g., Frost, Heatwave, High Humidity, Heavy Rain). 
Provide a short, personalized 'Actionable Advice' card for the user. Be concise but highly specific to the plant types and weather conditions.
If the weather poses no immediate threat, provide a brief positive encouragement.

Actionable Advice:"""
        )
        
        chain = prompt | self.llm
        result = chain.invoke({"weather": weather_summary, "plants": plant_list_str})
        
        return result.content
