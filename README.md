# EcoSphere: Carbon Footprint Awareness Platform

EcoSphere is a professional-grade personal sustainability and carbon emission tracking platform. It allows users to track daily activities, calculate carbon emissions against global benchmarks, simulate reductions, and gamify their sustainability journey.

## Project Structure

```
carbon footprint\project/
├── apps/
│   ├── api/                  # Python FastAPI Backend
│   │   ├── app/
│   │   │   ├── core/         # Carbon calculations formulas
│   │   │   ├── tests/        # Pytest unit tests
│   │   │   └── main.py       # API router & middleware
│   │   └── requirements.txt  # Python requirements
│   └── web/                  # Static HTML SPA Frontend
│       └── index.html        # Client-side UI (vanilla JS + CSS)
├── docker-compose.yml        # Local development orchestrator
└── README.md                 # Project Documentation
```

## Setup & Local Run

### Prerequisites
*   Python 3.10+
*   A modern web browser (Chrome, Firefox, Edge)
*   Docker (Optional, for containers)

### Running the API (Backend)
1. Navigate to the API directory:
   ```bash
   cd apps/api
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the API server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   API docs will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### Running Frontend (Web Client)
1. Navigate to the Web directory:
    ```bash
    cd apps/web
    ```
2. Open `index.html` directly in any modern browser, or serve it with:
    ```bash
    python -m http.server 8080
    ```
    Then visit [http://localhost:8080](http://localhost:8080).

## Calculation Formulas
EcoSphere uses global coefficients to compute carbon equivalents (\(\text{CO}_2\text{e}\)):

### 1. Transport Emissions
\[\text{Emissions } (\text{kg CO}_2\text{e}) = d \times EF_{vehicle}\]
*   \(d\): distance in kilometers (km)
*   \(EF_{vehicle}\): Emission Factor (e.g., \(0.17\) for medium petrol car, \(0.04\) for electric car, \(0.03\) for rail transit)

### 2. Home Utility Emissions
\[\text{Emissions } (\text{kg CO}_2\text{e}) = E \times EF_{grid}\]
*   \(E\): energy in kilowatt-hours (kWh)
*   \(EF_{grid}\): region-specific grid factor (e.g., \(0.37\) for default US average grid)

### 3. Food Diet Emissions
\[\text{Emissions } (\text{kg CO}_2\text{e}) = \sum (w_i \times EF_{diet\_i})\]
*   \(w_i\): weight/servings consumed
*   \(EF_{diet}\): food type factor (e.g., \(27.0\) for beef, \(6.9\) for chicken, \(2.0\) for vegetarian)

## License
MIT License.
