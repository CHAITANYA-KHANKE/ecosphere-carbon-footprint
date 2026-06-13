"""
Core calculation module for computing carbon equivalents (CO2e) based on various activity sectors.
Factors are based on international standards (DEFRA 2023 / US EPA 2023).
"""

from functools import lru_cache
from typing import Dict

# Emission Factors in kg CO2e per unit
EMISSION_FACTORS = {
    "transport": {
        "petrol_car_medium": 0.170,
        "diesel_car_medium": 0.165,
        "electric_car": 0.045,
        "bus": 0.096,
        "rail": 0.035,
        "flight_short_haul": 0.245,
        "flight_long_haul": 0.190,
    },
    "utility": {
        "electricity_us_avg": 0.370,
        "electricity_eu_avg": 0.230,
        "electricity_green": 0.015,
        "natural_gas": 0.185,
        "heating_oil": 0.268,
    },
    "diet": {
        "meat_heavy": 7.20,
        "meat_medium": 5.40,
        "vegetarian": 3.80,
        "vegan": 2.90,
    },
}


@lru_cache(maxsize=1024)
def _get_factor(category: str, key: str) -> float:
    """Cached factor lookup to avoid repeated dict traversal."""
    return EMISSION_FACTORS[category][key]


def calculate_transport_emissions(distance_km: float, vehicle_type: str) -> float:
    """Calculate carbon footprint for travel.

    Formula: emissions = distance * vehicle_factor
    """
    if vehicle_type not in EMISSION_FACTORS["transport"]:
        raise ValueError(f"Unknown vehicle type: {vehicle_type}. Choose from {list(EMISSION_FACTORS['transport'].keys())}")

    if distance_km < 0:
        raise ValueError("Distance cannot be negative")

    return round(distance_km * _get_factor("transport", vehicle_type), 3)


def calculate_utility_emissions(energy_kwh: float, fuel_type: str) -> float:
    """Calculate carbon footprint for home energy usage.

    Formula: emissions = energy * fuel_factor
    """
    if fuel_type not in EMISSION_FACTORS["utility"]:
        raise ValueError(f"Unknown utility/fuel type: {fuel_type}. Choose from {list(EMISSION_FACTORS['utility'].keys())}")

    if energy_kwh < 0:
        raise ValueError("Energy consumption cannot be negative")

    return round(energy_kwh * _get_factor("utility", fuel_type), 3)


def calculate_diet_emissions(days: int, diet_type: str) -> float:
    """Calculate carbon footprint for diet patterns over a specified duration.

    Formula: emissions = days * diet_type_factor
    """
    if diet_type not in EMISSION_FACTORS["diet"]:
        raise ValueError(f"Unknown diet type: {diet_type}. Choose from {list(EMISSION_FACTORS['diet'].keys())}")

    if days < 0:
        raise ValueError("Days cannot be negative")

    return round(days * _get_factor("diet", diet_type), 3)
