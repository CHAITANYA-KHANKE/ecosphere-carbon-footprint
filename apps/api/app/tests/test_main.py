import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)

# Register a temporary endpoint to test middleware exception safety
@app.get("/test-exception-safety")
def trigger_unhandled_exception():
    raise RuntimeError("Simulated unhandled exception for security check")

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "EcoSphere Calculation Engine API",
        "version": "2.2.0"
    }

def test_security_headers():
    response = client.get("/")
    assert response.status_code == 200
    # Verify strict security headers exist
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert response.headers.get("Strict-Transport-Security") == "max-age=63072000; includeSubDomains; preload"
    assert "default-src 'self'" in response.headers.get("Content-Security-Policy", "")
    assert "Server" not in response.headers

def test_middleware_exception_handling():
    # Trigger unhandled error, middleware should intercept and return clean 500 JSON
    response = client.get("/test-exception-safety")
    assert response.status_code == 500
    data = response.json()
    assert data["detail"] == "An internal server error occurred."

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

def test_calculate_transport_endpoint_invalid_negative():
    payload = {
        "distance_km": -10.0,
        "vehicle_type": "electric_car"
    }
    response = client.post("/calculate/transport", json=payload)
    assert response.status_code == 422  # Pydantic validation error (ge=0)

def test_calculate_transport_endpoint_invalid_type():
    payload = {
        "distance_km": 100.0,
        "vehicle_type": "spaceshuttle"
    }
    response = client.post("/calculate/transport", json=payload)
    assert response.status_code == 400
    assert "Unknown vehicle type" in response.json()["detail"]

def test_calculate_utility_endpoint_valid():
    payload = {
        "energy_kwh": 500.0,
        "fuel_type": "electricity_us_avg"
    }
    response = client.post("/calculate/utility", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["energy_kwh"] == 500.0
    assert data["fuel_type"] == "electricity_us_avg"
    assert data["emissions_kg_co2e"] == 185.0  # 500 * 0.370

def test_calculate_utility_endpoint_invalid_negative():
    payload = {
        "energy_kwh": -20.0,
        "fuel_type": "natural_gas"
    }
    response = client.post("/calculate/utility", json=payload)
    assert response.status_code == 422

def test_calculate_utility_endpoint_invalid_type():
    payload = {
        "energy_kwh": 100.0,
        "fuel_type": "fusion_reactor"
    }
    response = client.post("/calculate/utility", json=payload)
    assert response.status_code == 400
    assert "Unknown utility/fuel type" in response.json()["detail"]

def test_calculate_diet_endpoint_valid():
    payload = {
        "days": 30,
        "diet_type": "vegan"
    }
    response = client.post("/calculate/diet", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["days"] == 30
    assert data["diet_type"] == "vegan"
    assert data["emissions_kg_co2e"] == 87.0  # 30 * 2.90

def test_calculate_diet_endpoint_invalid_negative():
    payload = {
        "days": 0,
        "diet_type": "vegetarian"
    }
    response = client.post("/calculate/diet", json=payload)
    assert response.status_code == 422

def test_calculate_diet_endpoint_invalid_type():
    payload = {
        "days": 5,
        "diet_type": "junk_food"
    }
    response = client.post("/calculate/diet", json=payload)
    assert response.status_code == 400
    assert "Unknown diet type" in response.json()["detail"]

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
    assert data["unit"] == "kg CO2e"
    
    breakdown = data["breakdown"]
    assert breakdown["transport_kg_co2e"] == 4.5
    assert breakdown["utility_kg_co2e"] == 111.0
    assert breakdown["diet_kg_co2e"] == 87.0
    assert data["total_emissions_kg_co2e"] == 202.5

def test_calculate_summary_endpoint_invalid_values():
    payload = {
        "transport": {
            "distance_km": -100.0,
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
    assert response.status_code == 422

def test_calculate_summary_endpoint_invalid_type():
    payload = {
        "transport": {
            "distance_km": 50.0,
            "vehicle_type": "spaceshuttle"
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
    response = client.post("/calculate/summary", json=payload)
    assert response.status_code == 400
    assert "Unknown vehicle type" in response.json()["detail"]

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
    response1 = client.post("/calculate/summary", json=payload)
    assert response1.status_code == 200
    
    response2 = client.post("/calculate/summary", json=payload)
    assert response2.status_code == 200
    assert response1.json() == response2.json()

def test_serve_frontend_app():
    response = client.get("/app")
    assert response.status_code == 200
    assert "EcoSphere" in response.text

def test_serve_frontend_missing_file():
    with patch("pathlib.Path.exists", return_value=False):
        response = client.get("/app")
        assert response.status_code == 500
        assert "Frontend not found" in response.json()["detail"]["error"]

def test_serve_static_script():
    response = client.get("/web/script.js")
    assert response.status_code == 200
    assert "LOCAL_FACTORS" in response.text
