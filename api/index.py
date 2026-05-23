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
GAPGPT_BASE_URL = "https://api.gapgpt.app/v1"

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
    health: Optional[str] = None
    language: Optional[str] = "en"
    image: Optional[str] = None  # data URL (optional) for vision-based advice / health
    mode: Optional[str] = "full"  # "full" -> advice + health JSON; "health_only" -> {"health": ...}
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
    if request.provider in ("sotoon", "gapgpt"):
        base_url = GAPGPT_BASE_URL if request.provider == "gapgpt" else SOTOON_BASE_URL
        provider_label = "GapGPT" if request.provider == "gapgpt" else "Sotoon Intelligence"
        # OpenAI-compatible provider models
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
                f"{base_url}/models",
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
                raise HTTPException(status_code=resp.status_code, detail=f"Invalid API key for {provider_label}")
            else:
                # Other API errors, fall back to static list if needed but log it
                print(f"Sotoon API returned status {resp.status_code}: {resp.text}")
        except HTTPException:
            raise
        except Exception as e:
            print(f"Network error fetching {provider_label} models: {e}")

        # Fallback to static list only on network errors or unexpected responses
        return {"models": models}
    else:
        # Gemini models — try dynamic fetch first, fall back to static list
        try:
            genai.configure(api_key=request.api_key)
            models = []
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    models.append({
                        "name": m.name,
                        "inputTokenLimit": getattr(m, 'input_token_limit', 0),
                        "outputTokenLimit": getattr(m, 'output_token_limit', 0)
                    })
            if models:
                return {"models": models}
        except Exception as e:
            print(f"Failed to fetch Gemini models dynamically: {e}")

        # Fallback: modern static list (updated 2025)
        models = [
            {
                "name": "models/gemini-2.5-pro-preview-05-06",
                "inputTokenLimit": 1048576,
                "outputTokenLimit": 65536
            },
            {
                "name": "models/gemini-2.5-flash-preview-05-20",
                "inputTokenLimit": 1048576,
                "outputTokenLimit": 65536
            },
            {
                "name": "models/gemini-2.0-flash",
                "inputTokenLimit": 1048576,
                "outputTokenLimit": 8192
            },
            {
                "name": "models/gemini-2.0-flash-lite",
                "inputTokenLimit": 1048576,
                "outputTokenLimit": 8192
            },
            {
                "name": "models/gemini-1.5-pro",
                "inputTokenLimit": 2097152,
                "outputTokenLimit": 8192
            },
            {
                "name": "models/gemini-1.5-flash",
                "inputTokenLimit": 1048576,
                "outputTokenLimit": 8192
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
            "name": "Scientific or common name of the plant. IMPORTANT: If the user provided the name in a specific language (e.g., Persian), you MUST return the completed name in that EXACT same language.",
            "type": "e.g., Indoor Tropical, Outdoor Vegetable",
            "locationType": "Indoor" or "Outdoor",
            "lightExposure": "Low Light" or "Partial Shade" or "Bright Indirect" or "Full Sun",
            "potType": "Terracotta" or "Plastic" or "Ceramic" or "Metal" or "Other",
            "hasDrainage": true or false,
            "careTips": "Provide a detailed and comprehensive paragraph explaining the best general care practices for this plant. Must be written in {language_name}.",
            "wateringTips": "Provide a detailed and comprehensive paragraph explaining the specific watering schedule and techniques for this plant. Must be written in {language_name}."
        }}
        """

        if request.provider in ("sotoon", "gapgpt"):
            # Use OpenAI-compatible API
            import requests as req
            base_url = GAPGPT_BASE_URL if request.provider == "gapgpt" else SOTOON_BASE_URL
            provider_label = "GapGPT" if request.provider == "gapgpt" else "Sotoon"

            messages = [{"role": "user", "content": prompt}]

            if request.image and not request.image.startswith("data:"):
                pass  # Skip image for non-vision models
            elif request.image:
                messages = [{"role": "user", "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": request.image}}
                ]}]

            model_name = request.model_name or "gpt-4o"
            resp = req.post(
                f"{base_url}/chat/completions",
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
                    friendly_msg = f"{provider_label} API is currently having connectivity issues with this model. Please try a different model or try again later."
                    raise HTTPException(status_code=resp.status_code, detail=friendly_msg)
                raise HTTPException(status_code=resp.status_code, detail=f"{provider_label} API error: {err_text}")

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

def _parse_json_from_model_text(text: str) -> dict:
    import json
    import re
    match = re.search(r"```(?:json)?\n?(.*?)\n?```", text, re.DOTALL)
    if match:
        json_str = match.group(1).strip()
    else:
        json_str = text.strip()
    return json.loads(json_str)


def _normalize_status_health(raw: Optional[str]) -> str:
    allowed = {"Excellent", "Good", "Needs Attention"}
    h = (raw or "").strip()
    if h in allowed:
        return h
    lower = h.lower()
    if "excellent" in lower or "عالی" in h:
        return "Excellent"
    if "attention" in lower or "نیاز به توجه" in h or "critical" in lower:
        return "Needs Attention"
    if "good" in lower or "خوب" in h:
        return "Good"
    return "Good"


@app.post("/api/status-advice")
def get_status_advice(request: StatusAdviceRequest):
    import base64
    try:
        api_key = request.api_key or os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=400, detail="API key is required")

        language_name = "Persian (Farsi)" if request.language == "fa" else "English"
        mode = (request.mode or "full").strip().lower()
        health_hint = request.health if request.health else "not yet classified"

        if mode == "health_only":
            prompt = f"""
You are an expert botanist. A user described their plant's current situation (and may have attached a photo).

Plant name: {request.plant_name}
Plant type: {request.plant_type or "Unknown"}
User's status note: {request.status}
Previous health label (hint only, may be wrong): {health_hint}

Classify overall plant health as EXACTLY one of these English strings:
- "Excellent" — thriving, no serious issues mentioned
- "Good" — minor issues or uncertainty, generally OK
- "Needs Attention" — clear stress, pests, severe yellowing, rot, worsening after treatment, etc.

Use the photo if provided to spot pests, leaf color, wilting, etc.

Return ONLY valid JSON with this exact shape (no markdown):
{{"health": "Excellent"}}
The value for "health" must be exactly one of: Excellent, Good, Needs Attention.
"""
        else:
            prompt = f"""
You are an expert botanist and plant care assistant.
The user reported a status update for their plant (optional photo may show current leaf/soil/pests).

Plant Name: {request.plant_name}
Plant Type: {request.plant_type or "Unknown"}
Status description: {request.status}
Previous health label (hint only): {health_hint}

Tasks:
1) Infer the correct health level as EXACTLY one of: Excellent, Good, Needs Attention (English).
2) Write concise, practical next-step advice for the user in {language_name}.
   If a photo is included, incorporate visible cues (color, spots, pests, soil wetness) together with the text.

Return ONLY valid JSON (no markdown fences) with this exact shape:
{{"health": "Good", "advice": "..."}}
"""

        def gemini_contents():
            contents: list = [prompt]
            if request.image:
                if "," in request.image:
                    header, encoded = request.image.split(",", 1)
                    mime_type = header.split(";")[0].split(":")[1]
                else:
                    encoded = request.image
                    mime_type = "image/jpeg"
                image_data = base64.b64decode(encoded)
                contents.append({"mime_type": mime_type, "data": image_data})
            return contents

        if request.provider in ("sotoon", "gapgpt"):
            import requests as req
            base_url = GAPGPT_BASE_URL if request.provider == "gapgpt" else SOTOON_BASE_URL

            messages: list = []
            if request.image and request.image.startswith("data:"):
                messages = [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": request.image}},
                        ],
                    }
                ]
            else:
                messages = [{"role": "user", "content": prompt}]

            model_name = request.model_name or "gpt-4o"
            resp = req.post(
                f"{base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model_name,
                    "messages": messages,
                    "temperature": 0.35,
                },
                timeout=90,
            )
            if resp.status_code != 200:
                provider_label = "GapGPT" if request.provider == "gapgpt" else "Sotoon"
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=f"{provider_label} API error: {resp.text}",
                )
            result_data = resp.json()
            text = result_data["choices"][0]["message"]["content"]
        else:
            genai.configure(api_key=api_key)
            model_name = request.model_name or "gemini-1.5-pro"
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(gemini_contents())
            text = response.text

        try:
            data = _parse_json_from_model_text(text)
        except Exception:
            if mode == "health_only":
                return {"health": "Good"}
            return {"health": "Good", "advice": text.strip()}

        health = _normalize_status_health(data.get("health"))

        if mode == "health_only":
            return {"health": health}

        advice = (data.get("advice") or "").strip()
        if not advice:
            advice = text.strip()
        return {"health": health, "advice": advice}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
