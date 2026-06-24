export interface PlantToxicityRecord {
  plantName: string;
  scientificName: string;
  isToxic: boolean;
  clinicalSigns: string[];
  severity: "None" | "Mild" | "Moderate" | "Severe";
  actionRequired: string;
}

export const ASPCA_DATABASE: Record<string, PlantToxicityRecord> = {
  "lily": {
    plantName: "Lily (Easter Lily, Tiger Lily, Daylily)",
    scientificName: "Lilium spp.",
    isToxic: true,
    clinicalSigns: ["Vomiting", "Inappetence", "Lethargy", "Kidney failure", "Death"],
    severity: "Severe",
    actionRequired: "EMERGENCY: Seek veterinary attention immediately. All parts of the lily are extremely toxic to cats and can cause fatal kidney failure."
  },
  "peace lily": {
    plantName: "Peace Lily",
    scientificName: "Spathiphyllum spp.",
    isToxic: true,
    clinicalSigns: ["Oral irritation", "Intense burning and irritation of mouth, tongue and lips", "Excessive drooling", "Vomiting", "Difficulty swallowing"],
    severity: "Moderate",
    actionRequired: "Contact a vet. Ingestion releases calcium oxalate crystals causing intense mouth irritation. Flush mouth with fresh water."
  },
  "tulip": {
    plantName: "Tulip",
    scientificName: "Tulipa spp.",
    isToxic: true,
    clinicalSigns: ["Vomiting", "Depression", "Diarrhea", "Hypersalivation (drooling)", "Increased heart rate"],
    severity: "Moderate",
    actionRequired: "Contact a vet immediately. The bulb contains the highest concentration of toxins (tulipalin A and B)."
  },
  "sago palm": {
    plantName: "Sago Palm",
    scientificName: "Cycas revoluta",
    isToxic: true,
    clinicalSigns: ["Vomiting", "Melena (black stools)", "Icterus (yellowing skin/gums)", "Increased thirst", "Hemorrhagic gastroenteritis", "Bruising", "Liver damage", "Liver failure", "Death"],
    severity: "Severe",
    actionRequired: "EMERGENCY: Seek veterinary care immediately. Sago palms are extremely toxic, even consuming a single seed can lead to fatal liver failure."
  },
  "pothos": {
    plantName: "Pothos (Devil's Ivy)",
    scientificName: "Epipremnum aureum",
    isToxic: true,
    clinicalSigns: ["Oral irritation", "Burning of mouth, tongue and lips", "Excessive drooling", "Vomiting", "Difficulty swallowing"],
    severity: "Mild",
    actionRequired: "Wash the mouth. If symptoms of vomiting or severe drooling persist, contact a vet."
  },
  "aloe vera": {
    plantName: "Aloe Vera",
    scientificName: "Aloe vera",
    isToxic: true,
    clinicalSigns: ["Vomiting", "Lethargy", "Diarrhea", "Tremors", "Change in urine color"],
    severity: "Moderate",
    actionRequired: "Monitor carefully and contact a veterinarian if vomiting or diarrhea becomes persistent."
  },
  "jade plant": {
    plantName: "Jade Plant (Rubber Plant, Money Tree)",
    scientificName: "Crassula ovata",
    isToxic: true,
    clinicalSigns: ["Vomiting", "Depression", "Ataxia (incoordination)", "Slow heart rate (rare)"],
    severity: "Moderate",
    actionRequired: "Contact a veterinarian. Jade plant ingestion causes gastrointestinal upset and neurological symptoms."
  },
  "spider plant": {
    plantName: "Spider Plant",
    scientificName: "Chlorophytum comosum",
    isToxic: false,
    clinicalSigns: ["Mild stomach upset (if large quantities are eaten due to grass-like texture)"],
    severity: "None",
    actionRequired: "Safe for cats. Non-toxic, although cats may be attracted to the dangling plantlets which can cause mild self-limiting vomiting."
  },
  "boston fern": {
    plantName: "Boston Fern",
    scientificName: "Nephrolepis exalta",
    isToxic: false,
    clinicalSigns: [],
    severity: "None",
    actionRequired: "Safe for cats. Non-toxic."
  },
  "cat grass": {
    plantName: "Cat Grass (Oat or Wheat Grass)",
    scientificName: "Dactylis glomerata",
    isToxic: false,
    clinicalSigns: ["Occasional vomiting (normal physiological response to clear hairballs)"],
    severity: "None",
    actionRequired: "Completely safe. Provides fiber and vitamins for cats."
  },
  "rosemary": {
    plantName: "Rosemary",
    scientificName: "Rosmarinus officinalis",
    isToxic: false,
    clinicalSigns: [],
    severity: "None",
    actionRequired: "Safe for cats in normal culinary amounts."
  },
  "basil": {
    plantName: "Basil",
    scientificName: "Ocimum basilicum",
    isToxic: false,
    clinicalSigns: [],
    severity: "None",
    actionRequired: "Safe for cats."
  },
  "areca palm": {
    plantName: "Areca Palm (Butterfly Palm)",
    scientificName: "Dypsis lutescens",
    isToxic: false,
    clinicalSigns: [],
    severity: "None",
    actionRequired: "Safe for cats. Great safe alternative to toxic palms."
  },
  "calathea": {
    plantName: "Calathea (Prayer Plant)",
    scientificName: "Calathea spp.",
    isToxic: false,
    clinicalSigns: [],
    severity: "None",
    actionRequired: "Safe for cats."
  }
};

// Fuzzy search to find plant records
export function lookupPlantToxicity(query: string): PlantToxicityRecord | null {
  const cleanQuery = query.toLowerCase().trim();
  
  // Try exact match first
  if (ASPCA_DATABASE[cleanQuery]) {
    return ASPCA_DATABASE[cleanQuery];
  }

  // Try matching substring in common name or scientific name
  for (const key in ASPCA_DATABASE) {
    const record = ASPCA_DATABASE[key];
    if (
      record.plantName.toLowerCase().includes(cleanQuery) ||
      record.scientificName.toLowerCase().includes(cleanQuery) ||
      cleanQuery.includes(key)
    ) {
      return record;
    }
  }

  return null;
}
