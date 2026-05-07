import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

app = FastAPI(title="eAson ML Recommendation API")

# Allow requests from Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to Node.js backend URL
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model into memory
model = {}
model_path = os.path.join(os.path.dirname(__file__), "model.json")

def load_model():
    global model
    try:
        if os.path.exists(model_path):
            with open(model_path, 'r') as f:
                model = json.load(f)
            print(f"Model loaded with {len(model)} products.")
        else:
            print("Warning: model.json not found. Run model_trainer.py first.")
    except Exception as e:
        print(f"Error loading model: {e}")

# Load model on startup
load_model()

@app.get("/")
def read_root():
    return {"status": "ML Service is running", "model_size": len(model)}

@app.post("/reload")
def reload_model():
    """Endpoint to trigger a model reload without restarting the server"""
    load_model()
    return {"status": "Model reloaded successfully", "model_size": len(model)}

@app.get("/recommend/{product_id}", response_model=List[str])
def get_recommendations(product_id: str, limit: int = 4):
    """
    Returns up to `limit` recommended product IDs that are frequently bought 
    together with the given `product_id`.
    """
    if not model:
        raise HTTPException(status_code=503, detail="Model is not loaded or trained yet")
        
    recommendations = model.get(product_id, [])
    
    # Return top N recommendations
    return recommendations[:limit]

# Run with: uvicorn main:app --reload --port 8000
