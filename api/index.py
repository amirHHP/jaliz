import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

try:
    from weather_agent import WeatherAgent
except ImportError:
    from .weather_agent import WeatherAgent
import google.generativeai as genai

app = FastAPI()

weather_agent = WeatherAgent()

class PlantInfo(BaseModel):
    name: str
    type: Optional[str] = None
    locationType: Optional[str] = "Indoor"
    lightExposure: Optional[str] = "Bright Indirect"
    potType: Optional[str] = "Plastic"
    hasDrainage: Optional[bool] = True
    recentlyReplanted: Optional[bool] = False

class WeatherAdviceRequest(BaseModel):
    latitude: float
    longitude: float
    language: Optional[str] = "en"
    plants: List[PlantInfo]
    api_key: Optional[str] = None
    model_name: Optional[str] = None

class ModelsRequest(BaseModel):
    api_key: str

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "FastAPI is running on Vercel"}

@app.post("/api/models")
def list_models(request: ModelsRequest):
    try:
        genai.configure(api_key=request.api_key)
        models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                models.append({
                    "name": m.name,
                    "inputTokenLimit": m.input_token_limit,
                    "outputTokenLimit": m.output_token_limit
                })
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/advice")
def get_weather_advice(request: WeatherAdviceRequest):
    try:
        advice = weather_agent.get_advice(
            lat=request.latitude,
            lon=request.longitude,
            language=request.language,
            plants=[p.dict() for p in request.plants],
            api_key=request.api_key,
            model_name=request.model_name
        )
        return {"advice": advice}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
