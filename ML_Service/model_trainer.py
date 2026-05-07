import os
import json
from collections import defaultdict
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from the Backend directory
load_dotenv(dotenv_path="../Backend/.env")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/eason")

def train_model():
    print("Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    
    orders_collection = db["orders"]
    
    print("Extracting order data...")
    # Get all orders that have at least some items
    orders = list(orders_collection.find({}, {"items.product": 1}))
    
    # Co-occurrence matrix: matrix[item_a][item_b] = count
    co_occurrence = defaultdict(lambda: defaultdict(int))
    
    print(f"Processing {len(orders)} orders...")
    for order in orders:
        if 'items' not in order:
            continue
            
        # Get list of unique product IDs in this order (as strings)
        item_ids = list(set([str(item['product']) for item in order['items']]))
        
        # Increment co-occurrence for every pair in the order
        for i in range(len(item_ids)):
            for j in range(len(item_ids)):
                if i != j:
                    item_a = item_ids[i]
                    item_b = item_ids[j]
                    co_occurrence[item_a][item_b] += 1
                    
    # Convert to regular dict and sort recommendations for faster lookup
    model = {}
    for item_a, related_items in co_occurrence.items():
        # Sort related items by count descending
        sorted_related = sorted(related_items.items(), key=lambda x: x[1], reverse=True)
        # Store just the item IDs in order of recommendation strength
        model[item_a] = [item_id for item_id, count in sorted_related]

    print(f"Model trained. Built recommendations for {len(model)} unique products.")
    
    # Save the model to a JSON file
    model_path = os.path.join(os.path.dirname(__file__), "model.json")
    with open(model_path, 'w') as f:
        json.dump(model, f, indent=2)
        
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_model()
