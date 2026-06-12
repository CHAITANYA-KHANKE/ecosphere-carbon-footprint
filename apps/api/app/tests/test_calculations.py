import pytest
from app.core.calculations import (
    calculate_transport_emissions,
    calculate_utility_emissions,
    calculate_diet_emissions
)

def test_calculate_transport_emissions_valid():
    # Test transport emissions for petrol_car_medium: 100km * 0.170 = 17.0
    emissions = calculate_transport_emissions(100.0, "petrol_car_medium")
    assert emissions == 17.0

    # Test electric car emissions: 200km * 0.045 = 9.0
    emissions = calculate_transport_emissions(200.0, "electric_car")
    assert emissions == 9.0

def test_calculate_transport_emissions_negative():
    with pytest.raises(ValueError, match="Distance cannot be negative"):
        calculate_transport_emissions(-10.0, "electric_car")

def test_calculate_transport_emissions_invalid_type():
    with pytest.raises(ValueError, match="Unknown vehicle type"):
        calculate_transport_emissions(50.0, "spaceshuttle")

def test_calculate_utility_emissions_valid():
    # Test utility electricity (US average): 500 kWh * 0.370 = 185.0
    emissions = calculate_utility_emissions(500.0, "electricity_us_avg")
    assert emissions == 185.0

    # Test green electricity: 1000 kWh * 0.015 = 15.0
    emissions = calculate_utility_emissions(1000.0, "electricity_green")
    assert emissions == 15.0

def test_calculate_utility_emissions_negative():
    with pytest.raises(ValueError, match="Energy consumption cannot be negative"):
        calculate_utility_emissions(-100.0, "electricity_us_avg")

def test_calculate_utility_emissions_invalid_type():
    with pytest.raises(ValueError, match="Unknown utility/fuel type"):
        calculate_utility_emissions(100.0, "fusion_energy")

def test_calculate_diet_emissions_valid():
    # Test vegan diet: 30 days * 2.90 = 87.0
    emissions = calculate_diet_emissions(30, "vegan")
    assert emissions == 87.0

    # Test heavy meat diet: 7 days * 7.20 = 50.4
    emissions = calculate_diet_emissions(7, "meat_heavy")
    assert emissions == 50.4

def test_calculate_diet_emissions_negative():
    with pytest.raises(ValueError, match="Days cannot be negative"):
        calculate_diet_emissions(-5, "vegetarian")

def test_calculate_diet_emissions_invalid_type():
    with pytest.raises(ValueError, match="Unknown diet type"):
        calculate_diet_emissions(5, "junk_food")
