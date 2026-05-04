import os
import requests
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from typing import List, Dict

class WeatherAgent:
    def __init__(self):
        self.weather_api_key = os.getenv("OPENWEATHER_API_KEY")

    def fetch_weather(self, lat: float, lon: float) -> dict:
        """Fetches 48h weather forecast from OpenWeatherMap."""
        if not self.weather_api_key or self.weather_api_key == "your_openweather_api_key_here":
            # Return mock weather data if key is missing
            return {
                "list": [
                    {"main": {"temp": 15.5}, "weather": [{"description": "partly cloudy"}]},
                    {"main": {"temp": 12.0}, "weather": [{"description": "clear sky"}]},
                    {"main": {"temp": 8.5}, "weather": [{"description": "clear sky"}]},
                ]
            }
        
        url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={self.weather_api_key}&units=metric"
        response = requests.get(url)
        if response.status_code == 200:
            return response.json()
        return {"error": f"Failed to fetch weather: {response.text}"}

    def get_advice(self, lat: float, lon: float, language: str = "en", plants: List[Dict] = [], api_key: str = None, model_name: str = None) -> str:
        """Analyzes weather and plant list to generate actionable advice."""
        if not api_key:
            if language == "fa":
                return "🌱 توجه: لطفاً کلید API جمینای خود را در تنظیمات وارد کنید تا مشاوره تخصصی دریافت کنید."
            return "🌱 Note: Please enter your Gemini API key in Settings to get expert advice."

        # Initialize the Gemini model
        llm = ChatGoogleGenerativeAI(
            model=model_name or "gemini-1.5-flash",
            google_api_key=api_key,
            temperature=0.7
        )

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

        plant_details = []
        for p in plants:
            details = [f"{p.get('name')} ({p.get('type', 'Unknown type')})"]
            details.append(f"Location: {p.get('locationType', 'Indoor')}")
            details.append(f"Light: {p.get('lightExposure', 'Unknown')}")
            details.append(f"Pot: {p.get('potType', 'Unknown')}")
            drainage = "Yes" if p.get('hasDrainage', True) else "No"
            details.append(f"Drainage: {drainage}")
            if p.get('recentlyReplanted', False):
                details.append("WARNING: Recently Replanted (High Stress Risk)")
            plant_details.append(" - " + ", ".join(details))
            
        plant_list_str = "\n".join(plant_details)
        
        lang_instruction = "IMPORTANT: You must write the final advice entirely in Persian (Farsi)." if language == "fa" else "Write the advice in English."

        prompt = PromptTemplate(
            input_variables=["weather", "plants", "lang_instruction"],
            template="""You are an expert, hyper-local gardening AI agent.
            
Weather Forecast (Next 48h): {weather}

User's Plants:
{plants}

Based on the weather forecast and the specific plant characteristics, provide a short, personalized 'Actionable Advice' card.
Follow these rules strictly:
1. Location: Only apply outdoor weather risks (like frost/rain) heavily to "Outdoor" plants.
2. Light Exposure: Warn about UV/heatwaves if a plant is in "Full Sun" or "Bright Indirect".
3. Pot Type: Mention evaporation rates based on the pot (Terracotta dries fast, Plastic retains water).
4. Drainage: If 'hasDrainage' is No and heavy rain is expected, warn about root rot for Outdoor plants.
5. Recently Replanted: If this is True, trigger a "Stress Warning" and advise against exposing the plant to sudden temperature changes or harsh conditions.

Keep the advice concise and highly specific.
If the weather poses no threat, provide brief positive encouragement.

{lang_instruction}

Actionable Advice:"""
        )
        
        chain = prompt | llm
        result = chain.invoke({"weather": weather_summary, "plants": plant_list_str, "lang_instruction": lang_instruction})
        
        return result.content
