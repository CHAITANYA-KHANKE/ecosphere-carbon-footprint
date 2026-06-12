from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Dict, Any
import os

from app.core.calculations import (
    calculate_transport_emissions,
    calculate_utility_emissions,
    calculate_diet_emissions
)

app = FastAPI(
    title="EcoSphere Carbon Calculation Engine",
    description="Microservice to calculate greenhouse gas equivalencies (CO2e) for personal activities.",
    version="1.0.0"
)

# CORS middleware to allow communication from React/Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this to frontend domain in production
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

@app.get("/")
def read_root() -> Dict[str, str]:
    return {"status": "healthy", "service": "EcoSphere Calculation Engine API"}

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
        transport_val = calculate_transport_emissions(data.transport.distance_km, data.transport.vehicle_type)
        utility_val = calculate_utility_emissions(data.utility.energy_kwh, data.utility.fuel_type)
        diet_val = calculate_diet_emissions(data.diet.days, data.diet.diet_type)
        
        total = round(transport_val + utility_val + diet_val, 3)
        return {
            "breakdown": {
                "transport_kg_co2e": transport_val,
                "utility_kg_co2e": utility_val,
                "diet_kg_co2e": diet_val
            },
            "total_emissions_kg_co2e": total,
            "unit": "kg CO2e"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/app")
def serve_frontend():
    frontend_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "web", "index.html")
    return FileResponse(frontend_path)
