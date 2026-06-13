import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "EcoSphere Calculation Engine API",
        "version": "2.1.0"
    }

def test_security_headers():
    response = client.get("/")
    assert response.status_code == 200
    # Verify strict security headers exist
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "default-src 'self'" in response.headers.get("Content-Security-Policy", "")

def test_calculate_transport_endpoint_valid():
    payload = {
        "distance_km": 150.0,
        "vehicle_type": "petrol_car_medium"
    }
    response = client.post("/calculate/transport", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["distance_km"] == 150.0
    assert data["vehicle_type"] == "petrol_car_medium"
    assert data["emissions_kg_co2e"] == 25.5  # 150 * 0.170

def test_calculate_transport_endpoint_invalid():
    # Negative distance check
    payload = {
        "distance_km": -10.0,
        "vehicle_type": "electric_car"
    }
    response = client.post("/calculate/transport", json=payload)
    assert response.status_code == 422  # Pydantic validation error (ge=0)

def test_calculate_summary_endpoint():
    payload = {
        "transport": {
            "distance_km": 100.0,
            "vehicle_type": "electric_car"
        },
        "utility": {
            "energy_kwh": 300.0,
            "fuel_type": "electricity_us_avg"
        },
        "diet": {
            "days": 30,
            "diet_type": "vegan"
        }
    }
    response = client.post("/calculate/summary", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["unit"] == "kg CO2e"
    
    # Assert breakdown elements
    breakdown = data["breakdown"]
    assert breakdown["transport_kg_co2e"] == 4.5    # 100 * 0.045
    assert breakdown["utility_kg_co2e"] == 111.0    # 300 * 0.370
    assert breakdown["diet_kg_co2e"] == 87.0       # 30 * 2.90
    assert data["total_emissions_kg_co2e"] == 202.5 # 4.5 + 111.0 + 87.0

def test_calculate_summary_caching():
    payload = {
        "transport": {
            "distance_km": 50.0,
            "vehicle_type": "bus"
        },
        "utility": {
            "energy_kwh": 100.0,
            "fuel_type": "electricity_eu_avg"
        },
        "diet": {
            "days": 10,
            "diet_type": "vegetarian"
        }
    }
    # First request calculates
    response1 = client.post("/calculate/summary", json=payload)
    assert response1.status_code == 200
    
    # Second request hits LRU cache (returns identical data instantly)
    response2 = client.post("/calculate/summary", json=payload)
    assert response2.status_code == 200
    assert response1.json() == response2.json()
