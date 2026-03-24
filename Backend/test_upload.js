// backend/test_upload.js
import fs from 'fs';
import path from 'path';

async function testUpload() {
  try {
    // 1. Get a category
    const catRes = await fetch("http://localhost:5000/api/categories");
    const categories = await catRes.json();
    const catId = categories[0]?._id;

    // 2. Get a unit
    const unitRes = await fetch("http://localhost:5000/api/units");
    const units = await unitRes.json();
    const unitId = units[0]?._id;

    if (!catId || !unitId) {
      console.log("No categories or units found.");
      return;
    }

    // 3. Post to products
    const formData = new FormData();
    formData.append("name", "Test Product");
    formData.append("description", "A test product");
    formData.append("baseCost", "1000");
    formData.append("wholesalerPrice", "1500");
    formData.append("stock", "10");
    formData.append("category", catId);
    formData.append("unit", unitId);
    
    // Create a dummy text file to act as the image (Multer fileFilter might reject non-images)
    // Actually multer rejects non-images in upload.js: filetypes = /jpeg|jpg|png|webp/
    // We can just leave images empty since it's not required by backend
    
    console.log("Sending POST Request...");
    const res = await fetch("http://localhost:5000/api/products", {
      method: "POST",
      body: formData,
    });

    const bodyText = await res.text();
    console.log("STATUS:", res.status);
    try {
      console.log("JSON RESPONSE:", JSON.parse(bodyText));
    } catch {
      console.log("TEXT RESPONSE:", bodyText);
    }
  } catch (error) {
    console.error("ERROR:", error);
  }
}

testUpload();
