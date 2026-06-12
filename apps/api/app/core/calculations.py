"""
Core calculation module for computing carbon equivalents (CO2e) based on various activity sectors.
Factors are based on international standards (DEFRA 2023 / US EPA 2023).
"""

from typing import Dict

# Emission Factors in kg CO2e per unit
EMISSION_FACTORS: Dict[str, Dict[str, float]] = {
    "transport": {
        "petrol_car_medium": 0.170,  # kg CO2e / km
        "diesel_car_medium": 0.165,  # kg CO2e / km
        "electric_car": 0.045,       # kg CO2e / km
        "bus": 0.096,                # kg CO2e / passenger-km
        "rail": 0.035,               # kg CO2e / passenger-km
        "flight_short_haul": 0.245,  # kg CO2e / passenger-km
        "flight_long_haul": 0.190,   # kg CO2e / passenger-km
    },
    "utility": {
        "electricity_us_avg": 0.370, # kg CO2e / kWh
        "electricity_eu_avg": 0.230, # kg CO2e / kWh
        "electricity_green": 0.015,  # kg CO2e / kWh (minimal biomass/maintenance)
        "natural_gas": 0.185,        # kg CO2e / kWh
        "heating_oil": 0.268,        # kg CO2e / kWh
    },
    "diet": {
        "meat_heavy": 7.20,          # kg CO2e / day (high beef/lamb consumption)
        "meat_medium": 5.40,         # kg CO2e / day (average diet)
        "vegetarian": 3.80,          # kg CO2e / day
        "vegan": 2.90,               # kg CO2e / day
    }
}

def calculate_transport_emissions(distance_km: float, vehicle_type: str) -> float:
    """
    Calculate carbon footprint for travel.
    Formula: emissions = distance * vehicle_factor
    """
    factors = EMISSION_FACTORS["transport"]
    if vehicle_type not in factors:
        raise ValueError(f"Unknown vehicle type: {vehicle_type}. Choose from {list(factors.keys())}")
    
    if distance_km < 0:
        raise ValueError("Distance cannot be negative")
        
    return round(distance_km * factors[vehicle_type], 3)


def calculate_utility_emissions(energy_kwh: float, fuel_type: str) -> float:
    """
    Calculate carbon footprint for home energy usage.
    Formula: emissions = energy * fuel_factor
    """
    factors = EMISSION_FACTORS["utility"]
    if fuel_type not in factors:
        raise ValueError(f"Unknown utility/fuel type: {fuel_type}. Choose from {list(factors.keys())}")
    
    if energy_kwh < 0:
        raise ValueError("Energy consumption cannot be negative")
        
    return round(energy_kwh * factors[fuel_type], 3)


def calculate_diet_emissions(days: int, diet_type: str) -> float:
    """
    Calculate carbon footprint for diet patterns over a specified duration.
    Formula: emissions = days * diet_type_factor
    """
    factors = EMISSION_FACTORS["diet"]
    if diet_type not in factors:
        raise ValueError(f"Unknown diet type: {diet_type}. Choose from {list(factors.keys())}")
    
    if days < 0:
        raise ValueError("Days cannot be negative")
        
    return round(days * factors[diet_type], 3)
