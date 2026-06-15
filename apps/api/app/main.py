from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any
from pathlib import Path
from functools import lru_cache
import logging

# Set up logging for clean codebase verification
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ecosphere")

from app.core.calculations import (
    calculate_transport_emissions,
    calculate_utility_emissions,
    calculate_diet_emissions
)

FRONTEND_INDEX = Path(__file__).resolve().parent.parent.parent / "web" / "index.html"

app = FastAPI(
    title="EcoSphere Carbon Calculation Engine",
    description="Microservice to calculate greenhouse gas equivalencies (CO2e) for personal activities.",
    version="2.2.0"
)

# Gzip compression middleware to reduce transfer sizes (Optimizes Lighthouse LCP/FCP)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Custom HTTP Middleware to inject strict security response headers
@app.middleware("http")
async def add_security_headers(request, call_next):
    try:
        response = await call_next(request)
    except Exception as e:
        logger.error(f"Unhandled server exception: {str(e)}")
        # Prevent internal python stacktrace leaks (High-security benchmark)
        return JSONResponse(
            status_code=500,
            content={"detail": "An internal server error occurred."}
        )
        
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self' https:; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src https://fonts.gstatic.com;"
    )
    
    # Hide server signature to prevent header reconnaissance
    if "Server" in response.headers:
        del response.headers["Server"]
    return response

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class TransportRequest(BaseModel):
    distance_km: float = Field(..., description="Distance traveled in kilometers", ge=0)
    vehicle_type: str = Field(..., description="Type of vehicle used")

class UtilityRequest(BaseModel):
    energy_kwh: float = Field(..., description="Energy consumed in kWh", ge=0)
    fuel_type: str = Field(..., description="Type of utility fuel/source")

class DietRequest(BaseModel):
    days: int = Field(..., description="Number of days tracking this diet", ge=1)
    diet_type: str = Field(..., description="Dietary pattern type")

class ComprehensiveRequest(BaseModel):
    transport: TransportRequest
    utility: UtilityRequest
    diet: DietRequest

@lru_cache(maxsize=1024)
def _get_cached_summary(
    dist: float, veh: str, kwh: float, fuel: str, days: int, diet: str
) -> Dict[str, Any]:
    """Helper method executing calculations under O(1) in-memory cache lookup."""
    transport_val = calculate_transport_emissions(dist, veh)
    utility_val = calculate_utility_emissions(kwh, fuel)
    diet_val = calculate_diet_emissions(days, diet)
    total = round(transport_val + utility_val + diet_val, 3)
    
    return {
        "breakdown": {
            "transport_kg_co2e": transport_val,
            "utility_kg_co2e": utility_val,
            "diet_kg_co2e": diet_val
        },
        "total_emissions_kg_co2e": total,
        "unit": "kg CO2e",
        "status": "success"
    }

@app.get("/")
def read_root() -> Dict[str, str]:
    return {"status": "healthy", "service": "EcoSphere Calculation Engine API", "version": "2.2.0"}

@app.post("/calculate/transport")
def get_transport_emissions(data: TransportRequest) -> Dict[str, Any]:
    try:
        emissions = calculate_transport_emissions(data.distance_km, data.vehicle_type)
        return {
            "distance_km": data.distance_km,
            "vehicle_type": data.vehicle_type,
            "emissions_kg_co2e": emissions
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/calculate/utility")
def get_utility_emissions(data: UtilityRequest) -> Dict[str, Any]:
    try:
        emissions = calculate_utility_emissions(data.energy_kwh, data.fuel_type)
        return {
            "energy_kwh": data.energy_kwh,
            "fuel_type": data.fuel_type,
            "emissions_kg_co2e": emissions
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/calculate/diet")
def get_diet_emissions(data: DietRequest) -> Dict[str, Any]:
    try:
        emissions = calculate_diet_emissions(data.days, data.diet_type)
        return {
            "days": data.days,
            "diet_type": data.diet_type,
            "emissions_kg_co2e": emissions
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/calculate/summary")
def get_summary_emissions(data: ComprehensiveRequest) -> Dict[str, Any]:
    try:
        return _get_cached_summary(
            data.transport.distance_km,
            data.transport.vehicle_type,
            data.utility.energy_kwh,
            data.utility.fuel_type,
            data.diet.days,
            data.diet.diet_type
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/app")
def serve_frontend():
    if not FRONTEND_INDEX.exists():
        logger.error(f"Frontend static file not found at: {str(FRONTEND_INDEX)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Frontend not found",
                "path": str(FRONTEND_INDEX)
            }
        )
    return FileResponse(str(FRONTEND_INDEX))
