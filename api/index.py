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
import requests

app = FastAPI()

weather_agent = WeatherAgent()

SOTOON_BASE_URL = "https://api.intelligence.sotoon.ir/inference/v1"

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
    userLocation: Optional[str] = None
    language: Optional[str] = "en"
    plants: List[PlantInfo]
    api_key: Optional[str] = None
    model_name: Optional[str] = None
    provider: Optional[str] = "gemini"

class PlantAnalysisRequest(BaseModel):
    image: Optional[str] = None
    name: Optional[str] = None
    language: Optional[str] = "en"
    api_key: Optional[str] = None
    model_name: Optional[str] = None
    provider: Optional[str] = "gemini"

class StatusAdviceRequest(BaseModel):
    plant_name: str
    plant_type: Optional[str] = None
    status: str
    health: str
    language: Optional[str] = "en"
    api_key: Optional[str] = None
    model_name: Optional[str] = None
    provider: Optional[str] = "gemini"

class ModelsRequest(BaseModel):
    api_key: str
    provider: Optional[str] = "gemini"

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "FastAPI is running on Vercel"}

@app.post("/api/models")
def list_models(request: ModelsRequest):
    if request.provider == "sotoon":
        # Sotoon Intelligence API models (OpenAI-compatible)
        models = [
            {
                "name": "ibm-granite/granite-4.0-h-micro",
                "inputTokenLimit": 128000,
                "outputTokenLimit": 4096
            },
            {
                "name": "gpt-4o",
                "inputTokenLimit": 128000,
                "outputTokenLimit": 16384
            },
            {
                "name": "gpt-4o-mini",
                "inputTokenLimit": 128000,
                "outputTokenLimit": 16384
            },
            {
                "name": "gpt-4-turbo",
                "inputTokenLimit": 128000,
                "outputTokenLimit": 4096
            },
            {
                "name": "gpt-3.5-turbo",
                "inputTokenLimit": 16385,
                "outputTokenLimit": 4096
            }
        ]
        
        # Try to fetch actual models from the Sotoon API
        try:
            resp = requests.get(
                f"{SOTOON_BASE_URL}/models",
                headers={"Authorization": f"Bearer {request.api_key}"},
                timeout=10
            )
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, dict) and "data" in data:
                    fetched = []
                    for m in data["data"]:
                        model_id = m.get("id", "")
                        if model_id:
                            fetched.append({
                                "name": model_id,
                                "inputTokenLimit": m.get("context_length", 128000),
                                "outputTokenLimit": m.get("max_output", 16384)
                            })
                    if fetched:
                        return {"models": fetched}
            elif resp.status_code in [401, 403]:
                raise HTTPException(status_code=resp.status_code, detail="Invalid API key for Sotoon Intelligence")
            else:
                # Other API errors, fall back to static list if needed but log it
                print(f"Sotoon API returned status {resp.status_code}: {resp.text}")
        except HTTPException:
            raise
        except Exception as e:
            print(f"Network error fetching Sotoon models: {e}")
        
        # Fallback to static list only on network errors or unexpected responses
        return {"models": models}
    else:
        # Gemini models (static list to avoid network issues in restricted regions)
        models = [
            {
                "name": "models/gemini-1.5-pro",
                "inputTokenLimit": 2097152,
                "outputTokenLimit": 8192
            },
            {
                "name": "models/gemini-1.5-flash",
                "inputTokenLimit": 1048576,
                "outputTokenLimit": 8192
            },
            {
                "name": "models/gemini-1.5-flash-8b",
                "inputTokenLimit": 1048576,
                "outputTokenLimit": 8192
            },
            {
                "name": "models/gemini-1.0-pro",
                "inputTokenLimit": 30720,
                "outputTokenLimit": 2048
            }
        ]
        return {"models": models}

@app.post("/api/advice")
def get_weather_advice(request: WeatherAdviceRequest):
    try:
        advice = weather_agent.get_advice(
            lat=request.latitude,
            lon=request.longitude,
            userLocation=request.userLocation,
            language=request.language,
            plants=[p.dict() for p in request.plants],
            api_key=request.api_key,
            model_name=request.model_name,
            provider=request.provider
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
        api_key = request.api_key or os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=400, detail="API key is required")
        
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
        
        if request.provider == "sotoon":
            # Use OpenAI-compatible API (Sotoon)
            import requests as req
            
            messages = [{"role": "user", "content": prompt}]
            
            # Note: Sotoon API may not support image input for all models
            if request.image and not request.image.startswith("data:"):
                pass  # Skip image for non-vision models
            elif request.image:
                messages = [{"role": "user", "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": request.image}}
                ]}]
            
            model_name = request.model_name or "gpt-4o"
            resp = req.post(
                f"{SOTOON_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model_name,
                    "messages": messages,
                    "temperature": 0.3
                },
                timeout=60
            )
            
            if resp.status_code != 200:
                err_text = resp.text
                if "egress-proxy" in err_text or "OpenrouterException" in err_text:
                    friendly_msg = "Sotoon API is currently having connectivity issues with this model. Please try a different model (e.g., ibm-granite or gpt-4o) or try again later."
                    raise HTTPException(status_code=resp.status_code, detail=friendly_msg)
                raise HTTPException(status_code=resp.status_code, detail=f"Sotoon API error: {err_text}")
            
            result_data = resp.json()
            text = result_data["choices"][0]["message"]["content"]
        else:
            # Use Gemini
            genai.configure(api_key=api_key)
            model_name = request.model_name or "gemini-1.5-pro"
            model = genai.GenerativeModel(model_name)
            
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

@app.post("/api/status-advice")
def get_status_advice(request: StatusAdviceRequest):
    try:
        api_key = request.api_key or os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=400, detail="API key is required")
        
        language_name = "Persian (Farsi)" if request.language == "fa" else "English"
        
        prompt = f"""
        You are an expert botanist and plant care assistant.
        A user has reported a status change for their plant:
        Plant Name: {request.plant_name}
        Plant Type: {request.plant_type if request.plant_type else 'Unknown'}
        New Status: {request.status}
        Current Health: {request.health}
        
        Based on this information, provide specific advice and recommendations for the user in {language_name}.
        Keep the advice concise but very practical. Focus on what they should do next.
        Return ONLY the advice text without any markdown or JSON.
        """
        
        if request.provider == "sotoon":
            import requests as req
            messages = [{"role": "user", "content": prompt}]
            model_name = request.model_name or "gpt-4o"
            resp = req.post(
                f"{SOTOON_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model_name,
                    "messages": messages,
                    "temperature": 0.5
                },
                timeout=60
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail=f"Sotoon API error: {resp.text}")
            result_data = resp.json()
            advice = result_data["choices"][0]["message"]["content"]
        else:
            genai.configure(api_key=api_key)
            model_name = request.model_name or "gemini-1.5-pro"
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            advice = response.text
            
        return {"advice": advice.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
