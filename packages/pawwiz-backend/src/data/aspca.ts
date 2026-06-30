export interface PlantToxicityRecord {
  plantName: string;
  scientificName: string;
  isToxic: boolean;
  clinicalSigns: string[];
  severity: "None" | "Mild" | "Moderate" | "Severe";
  actionRequired: string;
  mediaUrl?: string | null;
}

export const ASPCA_DATABASE: Record<string, PlantToxicityRecord> = {
  "lily": {
    plantName: "Lily (Easter Lily, Tiger Lily, Daylily)",
    scientificName: "Lilium spp.",
    isToxic: true,
    clinicalSigns: ["Vomiting", "Inappetence", "Lethargy", "Kidney failure", "Death"],
    severity: "Severe",
    actionRequired: "EMERGENCY: Seek veterinary attention immediately. All parts of the lily are extremely toxic to cats and can cause fatal kidney failure.",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/3/30/Lilium_candidum_1.jpg"
  },
  "peace lily": {
    plantName: "Peace Lily",
    scientificName: "Spathiphyllum spp.",
    isToxic: true,
    clinicalSigns: ["Oral irritation", "Intense burning and irritation of mouth, tongue and lips", "Excessive drooling", "Vomiting", "Difficulty swallowing"],
    severity: "Moderate",
    actionRequired: "Contact a vet. Ingestion releases calcium oxalate crystals causing intense mouth irritation. Flush mouth with fresh water.",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Spathiphyllum_cochlearispathum_3.jpg"
  },
  "tulip": {
    plantName: "Tulip",
    scientificName: "Tulipa spp.",
    isToxic: true,
    clinicalSigns: ["Vomiting", "Depression", "Diarrhea", "Hypersalivation (drooling)", "Increased heart rate"],
    severity: "Moderate",
    actionRequired: "Contact a vet immediately. The bulb contains the highest concentration of toxins (tulipalin A and B).",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Tulipa_hybrid_red.jpg"
  },
  "sago palm": {
    plantName: "Sago Palm",
    scientificName: "Cycas revoluta",
    isToxic: true,
    clinicalSigns: ["Vomiting", "Melena (black stools)", "Icterus (yellowing skin/gums)", "Increased thirst", "Hemorrhagic gastroenteritis", "Bruising", "Liver damage", "Liver failure", "Death"],
    severity: "Severe",
    actionRequired: "EMERGENCY: Seek veterinary care immediately. Sago palms are extremely toxic, even consuming a single seed can lead to fatal liver failure.",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Cycas_revoluta_in_Kadavoor.jpg"
  },
  "pothos": {
    plantName: "Pothos (Devil's Ivy)",
    scientificName: "Epipremnum aureum",
    isToxic: true,
    clinicalSigns: ["Oral irritation", "Burning of mouth, tongue and lips", "Excessive drooling", "Vomiting", "Difficulty swallowing"],
    severity: "Mild",
    actionRequired: "Wash the mouth. If symptoms of vomiting or severe drooling persist, contact a vet.",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/d/de/Epipremnum_aureum_311009.jpg"
  },
  "aloe vera": {
    plantName: "Aloe Vera",
    scientificName: "Aloe vera",
    isToxic: true,
    clinicalSigns: ["Vomiting", "Lethargy", "Diarrhea", "Tremors", "Change in urine color"],
    severity: "Moderate",
    actionRequired: "Monitor carefully and contact a veterinarian if vomiting or diarrhea becomes persistent.",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Aloe_vera_flower_inset.png"
  },
  "jade plant": {
    plantName: "Jade Plant (Rubber Plant, Money Tree)",
    scientificName: "Crassula ovata",
    isToxic: true,
    clinicalSigns: ["Vomiting", "Depression", "Ataxia (incoordination)", "Slow heart rate (rare)"],
    severity: "Moderate",
    actionRequired: "Contact a veterinarian. Jade plant ingestion causes gastrointestinal upset and neurological symptoms.",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/8/87/Crassula_ovata.jpg"
  },
  "spider plant": {
    plantName: "Spider Plant",
    scientificName: "Chlorophytum comosum",
    isToxic: false,
    clinicalSigns: ["Mild stomach upset (if large quantities are eaten due to grass-like texture)"],
    severity: "None",
    actionRequired: "Safe for cats. Non-toxic, although cats may be attracted to the dangling plantlets which can cause mild self-limiting vomiting.",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chlorophytum_comosum_amsterdama.jpg"
  },
  "boston fern": {
    plantName: "Boston Fern",
    scientificName: "Nephrolepis exalta",
    isToxic: false,
    clinicalSigns: ["Mild stomach upset (if massive quantities are consumed)"],
    severity: "None",
    actionRequired: "Safe for cats. Non-toxic.",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Nephrolepis_exaltata_Bostoniensis_01.jpg"
  },
  "cat grass": {
    plantName: "Cat Grass (Oat or Wheat Grass)",
    scientificName: "Dactylis glomerata",
    isToxic: false,
    clinicalSigns: ["Occasional vomiting (normal physiological response to clear hairballs)"],
    severity: "None",
    actionRequired: "Completely safe. Provides fiber and vitamins for cats.",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Dactylis_glomerata_Flower_3.jpg"
  },
  "rosemary": {
    plantName: "Rosemary",
    scientificName: "Rosmarinus officinalis",
    isToxic: false,
    clinicalSigns: ["Mild stomach upset (if excessive quantities are eaten)"],
    severity: "None",
    actionRequired: "Safe for cats in normal culinary amounts.",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Kremp-rosmarin.jpg"
  },
  "basil": {
    plantName: "Basil",
    scientificName: "Ocimum basilicum",
    isToxic: false,
    clinicalSigns: ["Mild stomach upset (if excessive quantities are eaten)"],
    severity: "None",
    actionRequired: "Safe for cats.",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Ocimum_basilicum_001.JPG"
  },
  "areca palm": {
    plantName: "Areca Palm (Butterfly Palm)",
    scientificName: "Dypsis lutescens",
    isToxic: false,
    clinicalSigns: ["Mild stomach upset (if fibers block digestion)"],
    severity: "None",
    actionRequired: "Safe for cats. Great safe alternative to toxic palms.",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Dypsis_lutescens2.jpg"
  },
  "calathea": {
    plantName: "Calathea (Prayer Plant)",
    scientificName: "Calathea spp.",
    isToxic: false,
    clinicalSigns: ["Mild stomach upset (if large amount is digested)"],
    severity: "None",
    actionRequired: "Safe for cats.",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/d/de/Calathea_zebrina_1.jpg"
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
