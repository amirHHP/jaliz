import os
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from typing import List, Optional

try:
    from weather_agent import WeatherAgent
except ImportError:
    from .weather_agent import WeatherAgent
# pyrefly: ignore [missing-import]
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

class PlantAnalysisRequest(BaseModel):
    image: Optional[str] = None
    name: Optional[str] = None
    language: Optional[str] = "en"
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

@app.post("/api/analyze-plant")
def analyze_plant(request: PlantAnalysisRequest):
    import base64
    import json
    import re
    try:
        if not request.api_key:
            raise HTTPException(status_code=400, detail="API key is required")
        
        genai.configure(api_key=request.api_key)
        model_name = request.model_name or "gemini-1.5-pro"
        model = genai.GenerativeModel(model_name)
        
        language_name = "Persian (Farsi)" if request.language == "fa" else "English"
        
        prompt = f"""
        You are an expert botanist and plant care assistant.
        Identify the plant provided either by its image or its name: "{request.name if request.name else 'Unknown'}".
        Provide the following details in a JSON object exactly matching this structure, returning ONLY the JSON:
        {{
            "name": "Scientific or common name of the plant",
            "type": "e.g., Indoor Tropical, Outdoor Vegetable",
            "locationType": "Indoor" or "Outdoor",
            "lightExposure": "Low Light" or "Partial Shade" or "Bright Indirect" or "Full Sun",
            "potType": "Terracotta" or "Plastic" or "Ceramic" or "Metal" or "Other",
            "hasDrainage": true or false,
            "careTips": "Provide a detailed and comprehensive paragraph explaining the best general care practices for this plant. Must be written in {language_name}.",
            "wateringTips": "Provide a detailed and comprehensive paragraph explaining the specific watering schedule and techniques for this plant. Must be written in {language_name}."
        }}
        """
        
        contents = [prompt]
        
        if request.image:
            if "," in request.image:
                header, encoded = request.image.split(",", 1)
                mime_type = header.split(";")[0].split(":")[1]
            else:
                encoded = request.image
                mime_type = "image/jpeg"
                
            image_data = base64.b64decode(encoded)
            contents.append({
                "mime_type": mime_type,
                "data": image_data
            })
            
        response = model.generate_content(contents)
        
        text = response.text
        match = re.search(r'```(?:json)?\n?(.*?)\n?```', text, re.DOTALL)
        if match:
            json_str = match.group(1).strip()
        else:
            json_str = text.strip()
            
        result = json.loads(json_str)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
