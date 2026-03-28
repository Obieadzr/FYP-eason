// src/utils/categoryAttributes.js

export const CATEGORY_GROUPS = [
  { group: "Electronics & Office", emoji: "💻", color: "bg-blue-500", slugs: ["electronics-accessories", "stationery-office"] },
  { group: "Home & Kitchen", emoji: "🏠", color: "bg-orange-500", slugs: ["kitchen-appliances", "home-living", "cleaning-household"] },
  { group: "Fashion & Lifestyle", emoji: "👚", color: "bg-pink-500", slugs: ["clothing-apparel", "footwear", "bags-luggage", "beauty-cosmetics", "hair-care"] },
  { group: "Food & Daily Essentials", emoji: "🍎", color: "bg-green-500", slugs: ["grocery-food", "personal-hygiene"] },
  { group: "Kids, Sports & Hobbies", emoji: "⚽", color: "bg-yellow-500", slugs: ["baby-kids", "sports-fitness", "toys-games", "pet-supplies"] },
  { group: "Special & Seasonal", emoji: "🎉", color: "bg-purple-500", slugs: ["festive-seasonal", "hardware-tools", "agriscience-farming"] }
];

export const CATEGORY_UNIT_HINTS = {
  "electronics-accessories": ["Box", "Carton", "Pack", "Set", "Dozen"],
  "stationery-office": ["Box", "Carton", "Dozen", "Packet", "Set"],
  "kitchen-appliances": ["Box", "Carton", "Set"],
  "health-wellness": ["Box", "Bottle", "Jar", "Pack", "Tin"],
  "personal-hygiene": ["Box", "Packet", "Carton", "Bottle", "Pack"],
  "grocery-food": ["Carton", "Bag", "Packet", "Box", "Tin", "Jar", "Bottle"],
  "clothing-apparel": ["Dozen", "Carton", "Set", "Pack", "Bag"],
  "footwear": ["Carton", "Box", "Dozen"],
  "bags-luggage": ["Carton", "Bag", "Dozen"],
  "beauty-cosmetics": ["Box", "Carton", "Bottle", "Jar", "Set"],
  "hair-care": ["Box", "Carton", "Bottle", "Jar"],
  "home-living": ["Box", "Set", "Carton", "Pack", "Bag"],
  "cleaning-household": ["Carton", "Bottle", "Packet", "Box"],
  "baby-kids": ["Box", "Carton", "Set", "Pack"],
  "sports-fitness": ["Box", "Carton", "Set", "Bag", "Dozen"],
  "toys-games": ["Box", "Carton", "Set"],
  "hardware-tools": ["Box", "Carton", "Set", "Packet", "Tin"],
  "pet-supplies": ["Bag", "Carton", "Packet", "Box", "Tin"],
  "festive-seasonal": ["Box", "Packet", "Carton", "Set", "Bag"],
  "agriscience-farming": ["Bag", "Bottle", "Tin", "Packet", "Carton"]
};

// Common sections
const SEC_PHYSICAL = "Physical Details";
const SEC_TECH = "Technical Specifications";
const SEC_ATTRIBUTES = "Product Attributes";
const SEC_STOCK = "Pricing & Stock Info";
const SEC_COMPLIANCE = "Compliance & Safety";
const SEC_OTHER = "Additional Details";

export const CATEGORY_ATTRIBUTES = {
  "electronics-accessories": [
    { key: "connectorType", label: "Connector Type", type: "select", options: ["USB-C", "Micro-USB", "Lightning", "USB-A", "3.5mm", "HDMI", "Wireless"], required: true, section: SEC_TECH },
    { key: "compatibility", label: "Compatibility", type: "multiselect", options: ["iPhone", "Samsung", "Xiaomi", "Realme", "OnePlus", "Universal", "All Android"], required: true, section: SEC_TECH },
    { key: "wattage", label: "Wattage", type: "number", unit: "W", required: false, section: SEC_TECH },
    { key: "cableLength", label: "Cable Length", type: "select", options: ["0.5m", "1m", "1.5m", "2m", "3m"], required: false, section: SEC_PHYSICAL, visibleWhen: { key: "connectorType", notValue: "Wireless" } },
    { key: "outputVoltage", label: "Output Voltage", type: "select", options: ["5V", "9V", "12V", "20V", "Multi"], required: false, section: SEC_TECH },
    { key: "fastCharge", label: "Fast Charge Support", type: "select", options: ["No", "Yes-PD", "Yes-QC3.0", "Yes-QC4.0", "Yes-65W+"], required: false, section: SEC_TECH },
    { key: "frequencyResponse", label: "Frequency Response", type: "text", placeholder: "e.g. 20Hz-20kHz", required: false, section: SEC_TECH },
    { key: "impedance", label: "Impedance", type: "text", placeholder: "e.g. 32 Ohm", required: false, section: SEC_TECH },
    { key: "color", label: "Color", type: "colorpicker", required: true, section: SEC_PHYSICAL },
    { key: "warranty", label: "Warranty", type: "select", options: ["No Warranty", "1 Month", "3 Months", "6 Months", "1 Year", "2 Years"], required: true, section: SEC_COMPLIANCE },
    { key: "certification", label: "Certification", type: "multiselect", options: ["BIS", "CE", "RoHS", "FCC", "ISI"], required: false, section: SEC_COMPLIANCE },
    { key: "unitsPerWholesaleBox", label: "Units Per Wholesale Box", type: "number", required: true, helpText: "How many retail units come in one wholesale box", section: SEC_STOCK }
  ],
  "stationery-office": [
    { key: "paperSize", label: "Paper Size", type: "select", options: ["A3", "A4", "A5", "B5", "Letter", "Legal", "Custom"], required: false, section: SEC_PHYSICAL },
    { key: "ruling", label: "Ruling Type", type: "select", options: ["Unlined", "Single Line", "Double Line", "Graph", "Dotted", "Spiral"], required: false, section: SEC_ATTRIBUTES },
    { key: "inkColor", label: "Ink Color", type: "colorpicker", required: false, section: SEC_ATTRIBUTES },
    { key: "tipSize", label: "Tip Size", type: "select", options: ["0.38mm", "0.5mm", "0.7mm", "1mm", "Ballpoint", "Gel", "Fountain", "Marker"], required: false, section: SEC_ATTRIBUTES },
    { key: "paperWeightGSM", label: "Paper Weight (GSM)", type: "number", required: false, unit: "GSM", section: SEC_PHYSICAL },
    { key: "pagesPerBook", label: "Pages Per Book", type: "number", required: false, section: SEC_PHYSICAL },
    { key: "bindingType", label: "Binding Type", type: "select", options: ["Staple", "Spiral", "Glue", "Hardcover", "Softcover"], required: false, section: SEC_PHYSICAL },
    { key: "material", label: "Material", type: "select", options: ["Plastic", "Metal", "Bamboo", "Wood", "Paper", "Cardboard"], required: false, section: SEC_PHYSICAL },
    { key: "piecesPerBox", label: "Pieces Per Box", type: "number", required: true, section: SEC_STOCK },
    { key: "brandTier", label: "Brand Tier", type: "select", options: ["Economy", "Standard", "Premium"], required: true, section: SEC_ATTRIBUTES }
  ],
  "kitchen-appliances": [
    { key: "voltage", label: "Voltage", type: "select", options: ["220V", "110V", "220-240V", "Dual"], required: true, section: SEC_TECH },
    { key: "wattage", label: "Wattage", type: "number", required: true, unit: "W", section: SEC_TECH },
    { key: "capacityLitres", label: "Capacity (Litres)", type: "number", required: false, unit: "L", section: SEC_PHYSICAL },
    { key: "material", label: "Material", type: "select", options: ["Stainless Steel", "Aluminium", "Cast Iron", "Non-stick", "Glass", "Plastic", "Copper"], required: true, section: SEC_PHYSICAL },
    { key: "speedSettings", label: "Speed Settings", type: "text", placeholder: "e.g. 3 speeds or 10 speeds", required: false, section: SEC_TECH },
    { key: "inductionCompatible", label: "Induction Compatible", type: "boolean", required: false, section: SEC_ATTRIBUTES },
    { key: "gasCompatible", label: "Gas Compatible", type: "boolean", required: false, section: SEC_ATTRIBUTES },
    { key: "dishwasherSafe", label: "Dishwasher Safe", type: "boolean", required: false, section: SEC_ATTRIBUTES },
    { key: "color", label: "Color", type: "colorpicker", required: true, section: SEC_PHYSICAL },
    { key: "warrantyYears", label: "Warranty Years", type: "number", required: true, unit: "years", section: SEC_COMPLIANCE },
    { key: "certification", label: "Certification", type: "multiselect", options: ["BIS", "ISI", "CE", "Energy Star"], required: false, section: SEC_COMPLIANCE },
    { key: "countryOfManufacture", label: "Country Of Manufacture", type: "select", options: ["India", "China", "Nepal", "Germany", "Japan", "South Korea"], required: true, section: SEC_COMPLIANCE },
    { key: "lidIncluded", label: "Lid Included", type: "boolean", required: false, section: SEC_PHYSICAL },
    { key: "handlesCount", label: "Handles Count", type: "number", required: false, section: SEC_PHYSICAL }
  ],
  "health-wellness": [
    { key: "form", label: "Form", type: "select", options: ["Tablet", "Capsule", "Softgel", "Syrup", "Powder", "Liquid", "Cream", "Gel", "Spray", "Patch", "Strip", "Sachet"], required: true, section: SEC_PHYSICAL },
    { key: "strengthDosage", label: "Strength/Dosage", type: "text", placeholder: "e.g. 500mg, 1000IU", required: false, section: SEC_TECH },
    { key: "servingCount", label: "Serving Count", type: "number", placeholder: "e.g. 60", required: true, section: SEC_STOCK },
    { key: "servingSize", label: "Serving Size", type: "text", placeholder: "e.g. 1 tablet, 5ml", required: false, section: SEC_TECH },
    { key: "targetGroup", label: "Target Group", type: "multiselect", options: ["Adults", "Children", "Elderly", "Pregnant Women", "Athletes", "Diabetic", "General"], required: true, section: SEC_ATTRIBUTES },
    { key: "keyIngredients", label: "Key Ingredients", type: "text", required: false, section: SEC_ATTRIBUTES },
    { key: "storage", label: "Storage Condition", type: "select", options: ["Room Temperature", "Refrigerate", "Cool Dry Place", "Away from Light"], required: true, section: SEC_COMPLIANCE },
    { key: "containsAlcohol", label: "Contains Alcohol", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "dietaryType", label: "Dietary Type", type: "select", options: ["Vegetarian", "Vegan", "Non-Vegetarian", "Not Applicable"], required: true, section: SEC_ATTRIBUTES },
    { key: "fssaiApproved", label: "FSSAI/FDA Approved", type: "boolean", required: true, section: SEC_COMPLIANCE },
    { key: "shelfLifeMonths", label: "Shelf Life", type: "select", options: ["6 months", "12 months", "18 months", "24 months", "36 months"], required: true, section: SEC_COMPLIANCE },
    { key: "countryOfOrigin", label: "Country of Origin", type: "text", required: true, section: SEC_COMPLIANCE }
  ],
  "personal-hygiene": [
    { key: "productType", label: "Product Type", type: "select", options: ["Sanitary Pads", "Panty Liners", "Tampons", "Toilet Paper", "Facial Tissue", "Wet Wipes", "Hand Wash", "Body Wash", "Soap Bar", "Sanitizer", "Toothbrush", "Toothpaste", "Mouthwash", "Deodorant", "Razor"], required: true, section: SEC_ATTRIBUTES },
    { key: "absorbency", label: "Absorbency", type: "select", options: ["Regular", "Heavy", "Overnight", "Ultra Thin"], required: false, section: SEC_ATTRIBUTES, visibleWhen: { key: "productType", values: ["Sanitary Pads", "Tampons"] } },
    { key: "sheets", label: "Sheets Count", type: "number", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Toilet Paper", "Facial Tissue"] } },
    { key: "alcoholPercentage", label: "Alcohol Percentage", type: "number", unit: "%", required: false, section: SEC_TECH, visibleWhen: { key: "productType", value: "Sanitizer" } },
    { key: "scent", label: "Scent", type: "select", options: ["Unscented", "Mild", "Fresh", "Floral", "Citrus", "Herbal", "Mint", "Charcoal"], required: false, section: SEC_ATTRIBUTES },
    { key: "skinType", label: "Skin Type", type: "multiselect", options: ["Normal", "Sensitive", "Dry", "Oily", "All Skin Types"], required: false, section: SEC_ATTRIBUTES },
    { key: "containsAlcohol", label: "Contains Alcohol", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "dermatologistTested", label: "Dermatologist Tested", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "crueltyfree", label: "Cruelty Free", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "biodegradable", label: "Biodegradable", type: "boolean", required: false, section: SEC_ATTRIBUTES },
    { key: "countPerPack", label: "Count Per Pack", type: "text", placeholder: "e.g. 8 pads, 200 tissues", required: true, section: SEC_STOCK },
    { key: "certification", label: "Certification", type: "multiselect", options: ["ISO", "Dermatologist Tested", "Hypoallergenic", "GMP Certified"], required: false, section: SEC_COMPLIANCE },
    { key: "shelfLifeMonths", label: "Shelf Life (Months)", type: "number", required: false, section: SEC_COMPLIANCE }
  ],
  "grocery-food": [
    { key: "subCategory", label: "Sub Category", type: "select", options: ["Tea & Coffee", "Biscuits & Snacks", "Noodles & Instant", "Dry Fruits & Nuts", "Spices & Masala", "Cooking Oil", "Pulses & Lentils", "Rice & Grains", "Dairy", "Condiments & Sauces", "Beverages", "Other"], required: true, section: SEC_ATTRIBUTES },
    { key: "brand", label: "Brand", type: "text", required: true, section: SEC_ATTRIBUTES },
    { key: "flavor", label: "Flavor/Variant", type: "multiselect", options: ["Plain", "Spicy", "Sweet", "Salty", "Sour", "Masala", "Chocolate", "Vanilla", "Mint", "Cardamom", "Ginger", "Original"], required: false, section: SEC_ATTRIBUTES },
    { key: "weightPerUnit", label: "Weight Per Unit", type: "text", placeholder: "e.g. 100g, 500g, 1kg", required: true, section: SEC_PHYSICAL },
    { key: "unitsPerCarton", label: "Units Per Carton", type: "number", required: true, section: SEC_STOCK },
    { key: "cartonWeightKg", label: "Carton Weight (kg)", type: "number", unit: "kg", required: false, section: SEC_PHYSICAL },
    { key: "dietaryTags", label: "Dietary Tags", type: "multiselect", options: ["Vegetarian", "Vegan", "Gluten Free", "Sugar Free", "No Preservatives", "Organic", "Halal", "No MSG", "Eggless"], required: false, section: SEC_COMPLIANCE },
    { key: "fssaiLicense", label: "DFTQC/FSSAI License", type: "text", required: false, section: SEC_COMPLIANCE },
    { key: "shelfLifeMonths", label: "Shelf Life (Months)", type: "number", required: true, section: SEC_COMPLIANCE },
    { key: "storageCondition", label: "Storage", type: "select", options: ["Room Temperature", "Refrigerate", "Freeze", "Cool Dry Place"], required: true, section: SEC_COMPLIANCE },
    { key: "countryOfOrigin", label: "Country of Origin", type: "select", options: ["India", "Nepal", "China", "Sri Lanka", "USA", "Brazil", "Other"], required: true, section: SEC_COMPLIANCE },
    { key: "organic", label: "Organic", type: "boolean", required: false, section: SEC_ATTRIBUTES }
  ],
  "clothing-apparel": [
    { key: "gender", label: "Gender", type: "select", options: ["Men", "Women", "Boys", "Girls", "Unisex", "Infant"], required: true, section: SEC_ATTRIBUTES },
    { key: "ageGroup", label: "Age Group", type: "select", options: ["Infant 0-2y", "Kids 3-12y", "Teens 13-17y", "Adults", "All Ages"], required: true, section: SEC_ATTRIBUTES },
    { key: "clothingType", label: "Clothing Type", type: "select", options: ["Shirt", "T-Shirt", "Trouser", "Jeans", "Jacket", "Sweater", "Saree", "Kurta", "Lehenga", "Dress", "Shorts", "Tracksuit", "Innerwear", "School Uniform", "Sportswear", "Ethnic", "Formal", "Casual"], required: true, section: SEC_ATTRIBUTES },
    { key: "sizes", label: "Sizes Available", type: "multiselect", options: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size", "Custom", "26", "28", "30", "32", "34", "36", "38", "40"], required: true, section: SEC_PHYSICAL },
    { key: "color", label: "Color", type: "colorpicker", required: true, section: SEC_PHYSICAL },
    { key: "fabric", label: "Fabric/Material", type: "select", options: ["Cotton", "Polyester", "Silk", "Wool", "Linen", "Denim", "Rayon", "Nylon", "Blended", "Khadi", "Fleece"], required: true, section: SEC_PHYSICAL },
    { key: "fit", label: "Fit Type", type: "select", options: ["Regular", "Slim", "Loose", "Oversized", "Tailored"], required: false, section: SEC_PHYSICAL },
    { key: "occasion", label: "Occasion", type: "multiselect", options: ["Casual", "Formal", "Party", "Ethnic", "Sports", "School", "Festival", "Wedding"], required: false, section: SEC_ATTRIBUTES },
    { key: "piecesPerSet", label: "Pieces Per Set", type: "number", required: false, section: SEC_STOCK, visibleWhen: { key: "clothingType", values: ["Set", "Tracksuit", "Uniform"] } },
    { key: "washCare", label: "Wash Care", type: "select", options: ["Machine Wash", "Hand Wash Only", "Dry Clean Only", "Do Not Bleach"], required: false, section: SEC_COMPLIANCE },
    { key: "countryOfManufacture", label: "Country Of Manufacture", type: "text", required: true, section: SEC_COMPLIANCE },
    { key: "minimumOrderQuantityPieces", label: "Min Order Quantity (Pieces)", type: "number", required: true, section: SEC_STOCK }
  ],
  "footwear": [
    { key: "gender", label: "Gender", type: "select", options: ["Men", "Women", "Boys", "Girls", "Unisex", "Infant"], required: true, section: SEC_ATTRIBUTES },
    { key: "footwearType", label: "Footwear Type", type: "select", options: ["Sports Shoes", "Casual Shoes", "Formal Shoes", "Sandals", "Slippers", "Flip Flops", "Boots", "School Shoes", "Heels", "Wedges", "Loafers", "Sneakers"], required: true, section: SEC_ATTRIBUTES },
    { key: "sizes", label: "Sizes Available", type: "multiselect", options: ["UK 1", "UK 2", "UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12", "EU 35", "EU 36", "EU 37", "EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"], required: true, section: SEC_PHYSICAL },
    { key: "color", label: "Color", type: "colorpicker", required: true, section: SEC_PHYSICAL },
    { key: "upperMaterial", label: "Upper Material", type: "select", options: ["Leather", "Synthetic", "Canvas", "Mesh", "Rubber", "Fabric", "PU", "Suede"], required: true, section: SEC_PHYSICAL },
    { key: "soleMaterial", label: "Sole Material", type: "select", options: ["Rubber", "EVA", "TPR", "PU", "Leather", "Foam"], required: true, section: SEC_PHYSICAL },
    { key: "closure", label: "Closure Type", type: "select", options: ["Lace-up", "Velcro", "Slip-on", "Buckle", "Zip", "Hook & Loop"], required: false, section: SEC_PHYSICAL },
    { key: "occasion", label: "Occasion", type: "multiselect", options: ["Casual", "Formal", "Sports", "School", "Party", "Beach", "Trekking"], required: false, section: SEC_ATTRIBUTES },
    { key: "pairsPerCarton", label: "Pairs Per Carton", type: "number", required: true, section: SEC_STOCK },
    { key: "countryOfManufacture", label: "Country of Manufacture", type: "text", required: true, section: SEC_COMPLIANCE }
  ],
  "bags-luggage": [
    { key: "bagType", label: "Bag Type", type: "select", options: ["School Bag", "Backpack", "Laptop Bag", "Travel Bag", "Trolley", "Handbag", "Tote", "Sling", "Clutch", "Gym Bag", "Waist Bag", "Duffle"], required: true, section: SEC_ATTRIBUTES },
    { key: "gender", label: "Gender", type: "select", options: ["Men", "Women", "Boys", "Girls", "Unisex"], required: false, section: SEC_ATTRIBUTES },
    { key: "material", label: "Material", type: "select", options: ["Polyester", "Nylon", "Canvas", "Leather", "PU Leather", "Jute", "Oxford Fabric", "Cordura"], required: true, section: SEC_PHYSICAL },
    { key: "capacityLitres", label: "Capacity (Litres)", type: "number", unit: "L", required: false, section: SEC_PHYSICAL },
    { key: "numberOfCompartments", label: "No. of Compartments", type: "number", required: false, section: SEC_PHYSICAL },
    { key: "laptopCompatible", label: "Laptop Compatible", type: "boolean", required: false, section: SEC_TECH },
    { key: "laptopSizeInch", label: "Laptop Size (Inch)", type: "select", options: ["13\"", "14\"", "15.6\"", "17\""], required: false, section: SEC_TECH, visibleWhen: { key: "laptopCompatible", value: true } },
    { key: "wheelType", label: "Wheel Type", type: "select", options: ["No Wheels", "2 Spinner Wheels", "4 Spinner Wheels", "Inline Skate"], required: false, section: SEC_PHYSICAL, visibleWhen: { key: "bagType", value: "Trolley" } },
    { key: "color", label: "Color", type: "colorpicker", required: true, section: SEC_PHYSICAL },
    { key: "dimensions", label: "Dimensions", type: "text", placeholder: "e.g. 45cm x 30cm x 20cm", required: false, section: SEC_PHYSICAL },
    { key: "weightKg", label: "Weight (kg)", type: "number", unit: "kg", required: false, section: SEC_PHYSICAL },
    { key: "waterResistant", label: "Water Resistant", type: "boolean", required: false, section: SEC_ATTRIBUTES },
    { key: "warranty", label: "Warranty", type: "select", options: ["No Warranty", "6 Months", "1 Year", "2 Years"], required: true, section: SEC_COMPLIANCE }
  ],
  "beauty-cosmetics": [
    { key: "productType", label: "Product Type", type: "select", options: ["Lipstick", "Lip Gloss", "Foundation", "Concealer", "Kajal", "Eyeliner", "Mascara", "Eyeshadow", "Blush", "Highlighter", "Face Cream", "Moisturizer", "Sunscreen", "Serum", "Face Wash", "Toner", "Nail Polish", "Perfume", "Deodorant", "BB Cream", "Primer", "Setting Spray"], required: true, section: SEC_ATTRIBUTES },
    { key: "shade", label: "Shade/Color", type: "colorpicker", required: false, section: SEC_PHYSICAL },
    { key: "finish", label: "Finish", type: "select", options: ["Matte", "Glossy", "Satin", "Dewy", "Natural", "Shimmer", "Metallic"], required: false, section: SEC_ATTRIBUTES },
    { key: "skinType", label: "Skin Type Suitability", type: "multiselect", options: ["Normal", "Oily", "Dry", "Combination", "Sensitive", "All Types"], required: false, section: SEC_ATTRIBUTES },
    { key: "spf", label: "SPF Level", type: "number", required: false, section: SEC_TECH, visibleWhen: { key: "productType", values: ["Sunscreen", "Foundation", "BB Cream"] } },
    { key: "volumeMl", label: "Volume (ml)", type: "number", unit: "ml", required: false, section: SEC_PHYSICAL },
    { key: "coverage", label: "Coverage", type: "select", options: ["Light", "Medium", "Full", "Buildable"], required: false, section: SEC_ATTRIBUTES, visibleWhen: { key: "productType", values: ["Foundation", "Concealer", "BB Cream"] } },
    { key: "longWearing", label: "Long Wearing", type: "boolean", required: false, section: SEC_ATTRIBUTES },
    { key: "waterproof", label: "Waterproof", type: "boolean", required: false, section: SEC_ATTRIBUTES },
    { key: "crueltyfree", label: "Cruelty Free", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "dermatologistTested", label: "Dermatologist Tested", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "shelfLifeMonths", label: "Shelf Life (Months)", type: "number", required: true, section: SEC_COMPLIANCE },
    { key: "countryOfOrigin", label: "Country Of Origin", type: "text", required: true, section: SEC_COMPLIANCE }
  ],
  "hair-care": [
    { key: "productType", label: "Product Type", type: "select", options: ["Shampoo", "Conditioner", "Hair Oil", "Serum", "Hair Mask", "Hair Dye", "Hair Spray", "Dry Shampoo", "Hair Wax", "Gel", "Comb", "Brush", "Hair Clip", "Hair Band", "Hair Extension", "Wig"], required: true, section: SEC_ATTRIBUTES },
    { key: "hairType", label: "Suitable Hair Type", type: "multiselect", options: ["Normal", "Oily", "Dry", "Damaged", "Colored", "Curly", "Straight", "Wavy", "Frizzy", "Thin", "Thick"], required: false, section: SEC_ATTRIBUTES },
    { key: "concern", label: "Hair Concern", type: "multiselect", options: ["Dandruff", "Hair Fall", "Growth", "Hydration", "Smoothing", "Volumizing", "Repair", "Color Protection"], required: false, section: SEC_ATTRIBUTES },
    { key: "dyeShade", label: "Dye Shade", type: "colorpicker", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Hair Dye", "Hair Color"] } },
    { key: "volumeMl", label: "Volume (ml)", type: "number", unit: "ml", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Shampoo", "Conditioner", "Hair Oil", "Serum", "Hair Mask", "Hair Spray"] } },
    { key: "scent", label: "Scent", type: "select", options: ["Unscented", "Floral", "Herbal", "Coconut", "Argan", "Keratin", "Mint", "Rose"], required: false, section: SEC_ATTRIBUTES },
    { key: "containsParaben", label: "Contains Paraben", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "sulfateFree", label: "Sulfate Free", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "siliconeFree", label: "Silicone Free", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "crueltyfree", label: "Cruelty Free", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "shelfLifeMonths", label: "Shelf Life (Months)", type: "number", required: true, section: SEC_COMPLIANCE }
  ],
  "home-living": [
    { key: "productType", label: "Product Type", type: "select", options: ["Bedsheet", "Pillow", "Pillowcase", "Blanket", "Quilt", "Curtain", "Towel", "Bath Mat", "Storage Box", "Hanger", "Door Mat", "Wall Decor", "Candle", "Photo Frame", "Clock", "Vase", "Table Runner", "Cushion Cover", "Laundry Basket"], required: true, section: SEC_ATTRIBUTES },
    { key: "material", label: "Material", type: "select", options: ["Cotton", "Polyester", "Microfiber", "Silk", "Wool", "Jute", "Bamboo", "Linen", "Velvet", "Plastic", "Wood", "Metal", "Ceramic", "Glass"], required: true, section: SEC_PHYSICAL },
    { key: "dimensions", label: "Dimensions", type: "text", placeholder: "e.g. 90x200cm, 45x45cm", required: false, section: SEC_PHYSICAL },
    { key: "threadCount", label: "Thread Count (TC)", type: "number", required: false, section: SEC_TECH, visibleWhen: { key: "productType", values: ["Bedsheet", "Pillowcase", "Towel"] } },
    { key: "setCount", label: "Items Per Set", type: "number", placeholder: "e.g. 1, 2, 6", required: false, section: SEC_STOCK },
    { key: "color", label: "Color", type: "colorpicker", required: true, section: SEC_PHYSICAL },
    { key: "pattern", label: "Pattern", type: "select", options: ["Solid", "Striped", "Floral", "Geometric", "Abstract", "Printed", "Embroidered", "Plain"], required: false, section: SEC_PHYSICAL },
    { key: "occasion", label: "Occasion", type: "multiselect", options: ["Daily Use", "Wedding", "Festival", "Gift", "Luxury"], required: false, section: SEC_ATTRIBUTES },
    { key: "washCare", label: "Wash Care", type: "select", options: ["Machine Wash", "Hand Wash", "Dry Clean"], required: false, section: SEC_COMPLIANCE },
    { key: "piecesPerCarton", label: "Sets/Pieces Per Carton", type: "number", required: true, section: SEC_STOCK }
  ],
  "cleaning-household": [
    { key: "productType", label: "Product Type", type: "select", options: ["Detergent Powder", "Detergent Liquid", "Fabric Softener", "Dishwash Liquid", "Dishwash Bar", "Floor Cleaner", "Toilet Cleaner", "Glass Cleaner", "Multi-surface Cleaner", "Broom", "Mop", "Scrubber", "Sponge", "Garbage Bag", "Air Freshener", "Disinfectant Spray", "Drain Cleaner", "Shoe Polish"], required: true, section: SEC_ATTRIBUTES },
    { key: "scent", label: "Scent/Fragrance", type: "select", options: ["Unscented", "Lemon", "Lavender", "Pine", "Rose", "Ocean", "Fresh", "Original"], required: false, section: SEC_ATTRIBUTES },
    { key: "volumeMl", label: "Volume (ml)", type: "number", unit: "ml", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Detergent Liquid", "Fabric Softener", "Dishwash Liquid", "Floor Cleaner", "Toilet Cleaner", "Glass Cleaner", "Multi-surface Cleaner"] } },
    { key: "weightGrams", label: "Weight (g)", type: "number", unit: "g", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Detergent Powder", "Dishwash Bar"] } },
    { key: "unitsPerCarton", label: "Units Per Carton", type: "number", required: true, section: SEC_STOCK },
    { key: "concentrate", label: "Is Concentrate?", type: "boolean", helpText: "Is this a concentrate that needs dilution?", required: false, section: SEC_TECH },
    { key: "dilutionRatio", label: "Dilution Ratio", type: "text", placeholder: "e.g. 1:10 with water", required: false, section: SEC_TECH, visibleWhen: { key: "concentrate", value: true } },
    { key: "antibacterial", label: "Antibacterial", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "ecoFriendly", label: "Eco-Friendly", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "childSafe", label: "Child Safe", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "shelfLifeMonths", label: "Shelf Life (Months)", type: "number", required: false, section: SEC_COMPLIANCE }
  ],
  "baby-kids": [
    { key: "ageGroup", label: "Age Group", type: "select", options: ["0-3 Months", "3-6 Months", "6-12 Months", "1-2 Years", "2-3 Years", "3-5 Years", "5-8 Years", "8-12 Years", "All Ages"], required: true, section: SEC_ATTRIBUTES },
    { key: "productType", label: "Product Type", type: "select", options: ["Diaper", "Baby Wipes", "Baby Lotion", "Baby Oil", "Baby Shampoo", "Baby Powder", "Feeding Bottle", "Sippy Cup", "Pacifier", "Baby Food", "Baby Clothing", "Kids Toy", "Kids Stationery", "Kids Shoe", "Baby Monitor", "Stroller Accessory"], required: true, section: SEC_ATTRIBUTES },
    { key: "size", label: "Size", type: "text", placeholder: "e.g. NB/S/M/L or UK 2", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Diaper", "Baby Clothing", "Kids Shoe"] } },
    { key: "count", label: "Count Per Pack", type: "number", required: false, section: SEC_STOCK, visibleWhen: { key: "productType", values: ["Diaper", "Baby Wipes"] } },
    { key: "volumeMl", label: "Volume (ml)", type: "number", unit: "ml", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Baby Lotion", "Baby Oil", "Baby Shampoo", "Baby Powder"] } },
    { key: "material", label: "Material", type: "text", placeholder: "e.g. 100% cotton, BPA-free plastic", required: false, section: SEC_PHYSICAL },
    { key: "hypoallergenic", label: "Hypoallergenic", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "pediatricianApproved", label: "Pediatrician Approved", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "bpaFree", label: "BPA Free", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "phthalateFree", label: "Phthalate Free", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "color", label: "Color", type: "colorpicker", required: false, section: SEC_PHYSICAL },
    { key: "safetyCertification", label: "Safety Certification", type: "multiselect", options: ["BIS", "CE", "ASTM", "EN71", "ISO"], required: false, section: SEC_COMPLIANCE },
    { key: "shelfLifeMonths", label: "Shelf Life (Months)", type: "number", required: false, section: SEC_COMPLIANCE, visibleWhen: { key: "productType", values: ["Baby Food", "Baby Lotion", "Baby Wipes"] } }
  ],
  "sports-fitness": [
    { key: "sportType", label: "Sport Category", type: "select", options: ["Cricket", "Football", "Badminton", "Tennis", "Basketball", "Volleyball", "Swimming", "Yoga", "Gym", "Cycling", "Running", "Boxing", "Martial Arts", "Table Tennis", "General Fitness"], required: true, section: SEC_ATTRIBUTES },
    { key: "productType", label: "Product Type", type: "select", options: ["Ball", "Bat", "Racket", "Net", "Mat", "Dumbbell", "Barbell", "Resistance Band", "Gloves", "Shoes", "Clothing", "Water Bottle", "Bag", "Helmet", "Knee Guard", "Elbow Guard", "Jump Rope", "Skipping Rope", "Treadmill", "Cycle"], required: true, section: SEC_ATTRIBUTES },
    { key: "material", label: "Material", type: "text", placeholder: "e.g. Leather, Rubber, Aluminium, Foam", required: true, section: SEC_PHYSICAL },
    { key: "weight", label: "Weight (kg)", type: "number", unit: "kg", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Dumbbell", "Barbell"] } },
    { key: "dimensions", label: "Dimensions/Size", type: "text", placeholder: "e.g. 68cm circumference for football", required: false, section: SEC_PHYSICAL },
    { key: "color", label: "Color", type: "colorpicker", required: false, section: SEC_PHYSICAL },
    { key: "warranty", label: "Warranty", type: "select", options: ["No Warranty", "3 Months", "6 Months", "1 Year", "2 Years"], required: true, section: SEC_COMPLIANCE },
    { key: "certification", label: "Certification", type: "multiselect", options: ["BIS", "ISI", "FIFA Approved", "BWF Approved", "ITF Approved", "FIBA Approved"], required: false, section: SEC_COMPLIANCE },
    { key: "unitsPerCarton", label: "Units Per Carton", type: "number", required: true, section: SEC_STOCK }
  ],
  "toys-games": [
    { key: "ageGroup", label: "Age Group", type: "select", options: ["0-2 Years", "3-5 Years", "6-8 Years", "9-12 Years", "13+ Years", "All Ages"], required: true, section: SEC_ATTRIBUTES },
    { key: "toyType", label: "Toy Type", type: "select", options: ["Action Figure", "Doll", "Vehicle", "Building Blocks", "Puzzle", "Board Game", "Card Game", "Educational Toy", "Remote Control", "Stuffed Animal", "Musical Toy", "Outdoor Toy", "Art & Craft", "Science Kit", "Role Play"], required: true, section: SEC_ATTRIBUTES },
    { key: "material", label: "Material", type: "select", options: ["Plastic", "Wood", "Fabric", "Metal", "Foam", "Rubber", "Cardboard"], required: true, section: SEC_PHYSICAL },
    { key: "playerCount", label: "Player Count", type: "text", placeholder: "e.g. 2-4 players", required: false, section: SEC_ATTRIBUTES },
    { key: "piecesCount", label: "Number of Pieces", type: "number", required: false, section: SEC_PHYSICAL },
    { key: "batteryRequired", label: "Battery Required", type: "boolean", required: false, section: SEC_TECH },
    { key: "batteryType", label: "Battery Type", type: "text", placeholder: "e.g. AA x 3", required: false, section: SEC_TECH, visibleWhen: { key: "batteryRequired", value: true } },
    { key: "color", label: "Color", type: "colorpicker", required: false, section: SEC_PHYSICAL },
    { key: "safetyCertification", label: "Safety Certification", type: "multiselect", options: ["BIS", "CE", "ASTM", "EN71", "ISO 8124"], required: false, section: SEC_COMPLIANCE },
    { key: "minimumAge", label: "Minimum Age (Years)", type: "number", required: true, section: SEC_COMPLIANCE },
    { key: "chokingHazardWarning", label: "Choking Hazard Warning", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "unitsPerCarton", label: "Units Per Carton", type: "number", required: true, section: SEC_STOCK }
  ],
  "hardware-tools": [
    { key: "toolType", label: "Tool Type", type: "select", options: ["Hand Tool", "Power Tool", "Measuring Tool", "Cutting Tool", "Fastener", "Electrical Fitting", "Plumbing", "Paint & Brush", "Lock & Security", "Safety Equipment"], required: true, section: SEC_ATTRIBUTES },
    { key: "material", label: "Material", type: "select", options: ["Steel", "Stainless Steel", "Aluminium", "Plastic", "Wood", "Rubber", "Composite"], required: true, section: SEC_PHYSICAL },
    { key: "powerSource", label: "Power Source", type: "select", options: ["Manual", "Electric-Corded", "Electric-Cordless", "Battery", "Pneumatic"], required: false, section: SEC_TECH, visibleWhen: { key: "toolType", value: "Power Tool" } },
    { key: "voltage", label: "Voltage", type: "select", options: ["110V", "220V", "12V", "18V", "20V"], required: false, section: SEC_TECH, visibleWhen: { key: "powerSource", values: ["Electric-Corded", "Electric-Cordless", "Battery"] } },
    { key: "wattage", label: "Wattage (W)", type: "number", unit: "W", required: false, section: SEC_TECH, visibleWhen: { key: "powerSource", values: ["Electric-Corded", "Electric-Cordless"] } },
    { key: "dimensions", label: "Dimensions", type: "text", placeholder: "e.g. 25cm length, 6mm drill bit", required: false, section: SEC_PHYSICAL },
    { key: "weight", label: "Weight (kg)", type: "number", unit: "kg", required: false, section: SEC_PHYSICAL },
    { key: "color", label: "Color", type: "colorpicker", required: false, section: SEC_PHYSICAL },
    { key: "warranty", label: "Warranty", type: "select", options: ["No Warranty", "3 Months", "6 Months", "1 Year", "2 Years", "5 Years"], required: true, section: SEC_COMPLIANCE },
    { key: "certification", label: "Certification", type: "multiselect", options: ["BIS", "ISI", "CE", "ISO"], required: false, section: SEC_COMPLIANCE },
    { key: "unitsPerBox", label: "Units Per Box/Carton", type: "number", required: true, section: SEC_STOCK },
    { key: "setContents", label: "Set Contents", type: "text", placeholder: "e.g. 10-piece screwdriver set contents", required: false, section: SEC_OTHER }
  ],
  "pet-supplies": [
    { key: "petType", label: "Target Pet", type: "select", options: ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", "Reptile", "General"], required: true, section: SEC_ATTRIBUTES },
    { key: "productType", label: "Product Type", type: "select", options: ["Dry Food", "Wet Food", "Treats", "Supplement", "Collar", "Leash", "Harness", "Bed", "Cage", "Aquarium", "Bowl", "Grooming", "Shampoo", "Litter", "Toy", "Clothing"], required: true, section: SEC_ATTRIBUTES },
    { key: "breed", label: "Suitable Breed", type: "text", placeholder: "e.g. All breeds, Small breeds, Large breeds", required: false, section: SEC_ATTRIBUTES },
    { key: "ageGroup", label: "Age Group", type: "select", options: ["Puppy", "Kitten", "Junior", "Adult", "Senior", "All Ages"], required: true, section: SEC_ATTRIBUTES },
    { key: "flavorOrVariant", label: "Flavor/Variant", type: "text", placeholder: "e.g. Chicken, Salmon, Beef", required: false, section: SEC_ATTRIBUTES },
    { key: "weightKg", label: "Weight (kg)", type: "number", unit: "kg", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Dry Food", "Wet Food", "Treats", "Litter"] } },
    { key: "volumeMl", label: "Volume (ml)", type: "number", unit: "ml", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Shampoo", "Supplement", "Grooming"] } },
    { key: "material", label: "Material", type: "text", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Collar", "Leash", "Bed", "Toy", "Clothing", "Cage", "Bowl"] } },
    { key: "size", label: "Size", type: "select", options: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"], required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Collar", "Harness", "Clothing", "Bed"] } },
    { key: "veterinarianApproved", label: "Veterinarian Approved", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "naturalOrganic", label: "Natural/Organic", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "grainFree", label: "Grain Free", type: "boolean", required: false, section: SEC_ATTRIBUTES, visibleWhen: { key: "productType", values: ["Dry Food", "Wet Food", "Treats"] } },
    { key: "unitsPerCarton", label: "Units Per Carton", type: "number", required: true, section: SEC_STOCK }
  ],
  "festive-seasonal": [
    { key: "festival", label: "Festival/Occasion", type: "select", options: ["Dashain", "Tihar", "Chhath", "Holi", "Christmas", "Eid", "New Year", "Wedding", "General"], required: true, section: SEC_ATTRIBUTES },
    { key: "productType", label: "Product Type", type: "select", options: ["Decoration", "Puja Item", "Candle", "Diyo", "Gift Box", "Greeting Card", "Rangoli", "Garland", "Toran", "Kalash", "Sindoor", "Tika", "Marigold Mala", "Firework", "Party Supply", "Wrapping"], required: true, section: SEC_ATTRIBUTES },
    { key: "material", label: "Material", type: "text", placeholder: "e.g. Clay, Metal, Paper, Fabric", required: true, section: SEC_PHYSICAL },
    { key: "color", label: "Color Theme", type: "colorpicker", required: false, section: SEC_PHYSICAL },
    { key: "dimensions", label: "Dimensions", type: "text", placeholder: "e.g. 15cm height, A4 size", required: false, section: SEC_PHYSICAL },
    { key: "setCount", label: "Items in Set", type: "number", required: false, section: SEC_STOCK },
    { key: "handmade", label: "Handmade", type: "boolean", required: false, section: SEC_ATTRIBUTES },
    { key: "ecoFriendly", label: "Eco-Friendly", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "unitsPerCarton", label: "Units Per Wholesale Carton", type: "number", required: true, section: SEC_STOCK },
    { key: "seasonalAvailability", label: "Seasonal Availability", type: "select", options: ["Year Round", "Dashain Season", "Tihar Season", "Winter", "Spring", "Festival Specific"], required: true, section: SEC_STOCK }
  ],
  "agriscience-farming": [
    { key: "productType", label: "Product Type", type: "select", options: ["Seed", "Fertilizer", "Pesticide", "Herbicide", "Fungicide", "Farming Tool", "Irrigation", "Animal Feed", "Poultry Supply", "Soil Amendment", "Plant Growth Regulator", "Greenhouse Supply"], required: true, section: SEC_ATTRIBUTES },
    { key: "cropType", label: "Target Crop/Plant", type: "multiselect", options: ["Rice", "Wheat", "Maize", "Potato", "Tomato", "Vegetable", "Fruit", "Flower", "Tea", "Coffee", "General"], required: true, section: SEC_ATTRIBUTES },
    { key: "formulation", label: "Formulation", type: "select", options: ["Granule", "Powder", "Liquid", "Soluble", "Emulsion", "Wettable Powder", "Seed Treatment"], required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Fertilizer", "Pesticide", "Herbicide", "Fungicide"] } },
    { key: "weightKg", label: "Weight (kg)", type: "number", unit: "kg", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Seed", "Fertilizer", "Pesticide", "Animal Feed", "Soil Amendment"] } },
    { key: "volumeLitre", label: "Volume (Litre)", type: "number", unit: "L", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "formulation", values: ["Liquid", "Emulsion"] } },
    { key: "applicationMethod", label: "Application Method", type: "text", placeholder: "e.g. Foliar spray, Soil drench, Broadcasting", required: false, section: SEC_TECH },
    { key: "activeIngredient", label: "Active Ingredient", type: "text", placeholder: "e.g. Urea 46%, Chlorpyrifos 20%", required: false, section: SEC_TECH },
    { key: "registrationNumber", label: "Registration No.", type: "text", placeholder: "Nepal Pesticide Registration No.", required: false, section: SEC_COMPLIANCE },
    { key: "organicCertified", label: "Organic Certified", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "governmentApproved", label: "Government Approved", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "shelfLifeMonths", label: "Shelf Life (Months)", type: "number", required: false, section: SEC_COMPLIANCE },
    { key: "storageCondition", label: "Storage Condition", type: "select", options: ["Cool Dry Place", "Room Temperature", "Refrigerate", "Away from Direct Sunlight"], required: true, section: SEC_COMPLIANCE }
  ]
};

// Helper: Get attributes by exact or fuzzy slug
export const getAttributesForCategory = (categorySlug) => {
  if (!categorySlug) return [];
  // Try exact match
  if (CATEGORY_ATTRIBUTES[categorySlug]) {
    return CATEGORY_ATTRIBUTES[categorySlug];
  }
  // Try finding by slug component
  const search = categorySlug.toLowerCase();
  for (const [slug, attrs] of Object.entries(CATEGORY_ATTRIBUTES)) {
    if (slug.includes(search) || search.includes(slug)) {
      return attrs;
    }
  }
  return [];
};

// Helper: Sort units pushing recommended ones to the top
export const getRecommendedUnits = (categorySlug, allUnitsFromDB) => {
  if (!allUnitsFromDB || allUnitsFromDB.length === 0) return [];
  
  const hints = CATEGORY_UNIT_HINTS[categorySlug] || [];
  
  // Create a deep copy
  const sorted = [...allUnitsFromDB];
  
  sorted.sort((a, b) => {
    const aName = typeof a === 'string' ? a : a.name;
    const bName = typeof b === 'string' ? b : b.name;
    
    const aHintIdx = hints.indexOf(aName);
    const bHintIdx = hints.indexOf(bName);
    
    // Both are explicitly hints
    if (aHintIdx !== -1 && bHintIdx !== -1) {
      return aHintIdx - bHintIdx;
    }
    
    // a is hint, b is not
    if (aHintIdx !== -1) return -1;
    // b is hint, a is not
    if (bHintIdx !== -1) return 1;
    
    // Neither are hints, sort alphabetically
    return aName.localeCompare(bName);
  });
  
  return sorted;
};
