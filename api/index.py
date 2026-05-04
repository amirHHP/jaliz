import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from .weather_agent import WeatherAgent

app = FastAPI()

# Optionally load .env if running locally
# from dotenv import load_dotenv
# load_dotenv()

weather_agent = WeatherAgent()

class PlantInfo(BaseModel):
    name: str
    type: Optional[str] = None

class WeatherAdviceRequest(BaseModel):
    latitude: float
    longitude: float
    plants: List[PlantInfo]

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "FastAPI is running on Vercel"}

@app.post("/api/advice")
def get_weather_advice(request: WeatherAdviceRequest):
    try:
        advice = weather_agent.get_advice(
            lat=request.latitude,
            lon=request.longitude,
            plants=[p.dict() for p in request.plants]
        )
        return {"advice": advice}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
