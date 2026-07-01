/**
 * ASPCA Toxic Plants for Cats — reformatted from toxic-plants-cats.csv
 *
 * Source: ASPCA Animal Poison Control Center
 * 194 unique records, deduplicated by scientific name.
 */

import { type PlantToxicityRecord } from '../types/shared.js';

export const ASPCA_CSV_PLANTS: Record<string, PlantToxicityRecord> = {
  "adam-and-eve": {
    plantName: 'Adam-and-Eve',
    scientificName: 'Arum maculatum',
    isToxic: true,
    clinicalSigns: ["Oral irritation", "Drooling", "Vomiting", "Difficulty swallowing"],
    severity: 'Mild',
    actionRequired: 'Adam-and-Eve is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe8epZvdN3I-yXgREBZMm8L2DBP416F4hHXXPSKOurj4M1nmH8-CZ3BVxHLjpZDOCcCBT-WFPGHWXr0INWDSG_jurbgjULCLYKE4KR8cBW&s=10"
  },
  "african wonder tree": {
    plantName: 'African Wonder Tree',
    scientificName: 'Ricinus communis',
    isToxic: true,
    clinicalSigns: ["Severe vomiting and diarrhea (often bloody)", "Burning in the mouth and throat", "Weakness", "Difficulty breathing", "Drooling"],
    severity: 'Severe',
    actionRequired: 'African Wonder Tree is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEUhPOgz-29oWQpqbR_NUwoU36-C_E_EzrEOzlUjMeaHxSCU1AjO6fmu6sR7PLmWb34SMzeu0tKAnoMsjBm9wVw_lRK_85AdUED9yf0zRUSQ&s=10"
  },
  "alocasia": {
    plantName: 'Alocasia',
    scientificName: 'Alocasia spp.',
    isToxic: true,
    clinicalSigns: ["Excessive drooling", "Vomiting", "Difficulty Swallowing", "Oral pain or irritation"],
    severity: 'Mild',
    actionRequired: 'Alocasia is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://www.aspca.org/sites/default/files/styles/medium_image_300x200/public/field/image/plants/alocasia-r.jpg?itok=5QWkDXGp"
  },
  "aloe": {
    plantName: 'Aloe',
    scientificName: 'Aloe vera',
    isToxic: true,
    clinicalSigns: ["Vomiting and diarrhea", "Lethargy and depression", "Loss of appetite"],
    severity: 'Mild',
    actionRequired: 'Aloe is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://media.post.rvohealth.io/wp-content/uploads/sites/3/2025/04/aloe-vera-GettyImages-1473547826-Header-1024x575.jpg"
  },
  "amaryllis": {
    plantName: 'Amaryllis',
    scientificName: 'Amaryllis spp.',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Drooling", "Depression"],
    severity: 'Mild',
    actionRequired: 'Amaryllis is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "data:image/jpeg;base64,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"
  },
  "ambrosia mexicana": {
    plantName: 'Ambrosia Mexicana',
    scientificName: 'Chenopodium botrys',
    isToxic: true,
    clinicalSigns: ["Vomiting and diarrhea", "Excessive drooling or salivation", "Loss of appetite", "Tremors"],
    severity: 'Mild',
    actionRequired: 'Ambrosia Mexicana is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOgsghPWQsfAtniVOx-rkn_Ac0P0ky8atGBf7It6u4ZGUhXo-tk9T4Pe0&s=10"
  },
  "american bittersweet": {
    plantName: 'American Bittersweet',
    scientificName: 'Celastrus scandens',
    isToxic: true,
    clinicalSigns: ["Severe vomiting and diarrhea", "Excessive drooling or salivation", "Loss of appetite", "Diarrhea", "Tremors", "Lethargy"],
    severity: 'Severe',
    actionRequired: 'American Bittersweet is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfoVAakaUQs2r74Inxbxi_YQSjNKyk9JJeTwgNSA3MIUVEKNX8NQB6OEq0A641MKkkphnb224NcoRLXxhqh38L_PMrU_d60tFddRxJcUI&s=10"
  },
  "american holly": {
    plantName: 'American Holly',
    scientificName: 'Ilex opaca',
    isToxic: true,
    clinicalSigns: ["Vomiting and diarrhea", "Excessive drooling or salivation", "Loss of appetite"],
    severity: 'Mild',
    actionRequired: 'American Holly is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://www.gardenia.net/wp-content/uploads/2023/05/ilex-opaca-780x520.webp"
  },
  "american mandrake": {
    plantName: 'American Mandrake',
    scientificName: 'Podophyllum peltatum',
    isToxic: true,
    clinicalSigns: ["Vomiting and diarrhea", "Excessive drooling or salivation", "Loss of appetite"],
    severity: 'Mild',
    actionRequired: 'American Mandrake is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQYc4KPATUtiT_nhT7XAUVlNhabEc5ENTqgFnIo6m2PR4FPts4z"
  },
  "american yew": {
    plantName: 'American Yew',
    scientificName: 'Taxus canadensus',
    isToxic: true,
    clinicalSigns: ["Severe vomiting and diarrhea", "Excessive drooling or salivation", "Loss of appetite", "Diarrhea", "Tremors", "Lethargy"],
    severity: 'Severe',
    actionRequired: 'American Yew is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQADuFgeUUspPp6RoqejUKjVHBqhN9OjTs6LQbQEHMD9NIV5lmQpcvEkT7cdy1ycE20kewFjrz1Iony45y4zuEDRKsaBZjm_yEa2saBrg&s=10"
  },
  "andromeda japonica": {
    plantName: 'Andromeda Japonica',
    scientificName: 'Pieris japonica',
    isToxic: true,
    clinicalSigns: ["Severe vomiting and diarrhea", "Excessive drooling or salivation", "Loss of appetite", "Diarrhea", "Tremors", "Lethargy"],
    severity: 'Severe',
    actionRequired: 'Andromeda Japonica is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Pieris_japonica_10.jpg"
  },
  "angelica tree": {
    plantName: 'Angelica Tree',
    scientificName: 'Aralia spinosa',
    isToxic: true,
    clinicalSigns: ["Hypersalivation", "Pawing at the mounth", "Vomiting", "Diarrhea", "Difficulty breathing"],
    severity: 'Mild',
    actionRequired: 'Angelica Tree is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRV0WZRC86xR0FJshHUZOoBwdfkV2B1u0BF9q0A8itxKQ&s=10"
  },
  "apple": {
    plantName: 'Apple',
    scientificName: 'Malus sylvestrus',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Difficulty breathing"],
    severity: 'Mild',
    actionRequired: 'Apple is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8HmonKi-ljRZep8bKkqP0tMyBeV1BVP9Koz7AVaE6czqv7x33iA7x9gS0IRiFktX-Egdf4JhE4vfJyse_swahcRkDqR45LqcUDcAOm0XyyQ&s=10"
  },
  "apricot": {
    plantName: 'Apricot',
    scientificName: 'Prunus armeniaca',
    isToxic: true,
    clinicalSigns: ["Difficulty Breathing", "Bright Red Gums", "Dilated Pupils", "Vomiting", "Shock"],
    severity: 'Severe',
    actionRequired: 'Apricot is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0Fc-h_T-0qzZdP_1tgE06GTG-FVifmGAMEzmlYwPatcU16Sj9zmj83x2eVhp1zdH7Gfrcf_f0uFZvbJSmG037o3dBohFFsQMKFjoqwkHi&s=10"
  },
  "arrow-head vine": {
    plantName: 'Arrow-Head Vine',
    scientificName: 'Syngonium podophyllum',
    isToxic: true,
    clinicalSigns: ["Intense irritation of the mouth, tongue and lips", "Excessive drooling", "Vomiting", "Difficulty swallowing"],
    severity: 'Mild',
    actionRequired: 'Arrow-Head Vine is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF6ABsZpeC5cEkEtunx-D8wc4iFYp0oqHHRHfIDrsTVbURYzxRgaXuMEXqA0nN54FHzKvHhdAQS7y9qfQfMyIr877VpGx9id75BfE_Me4&s=10"
  },
  "arum lily": {
    plantName: 'Arum Lily',
    scientificName: 'Zantedeschia aethiopica',
    isToxic: true,
    clinicalSigns: ["Oral irritation", "Intense burning of mouth, lips, and tongue", "Excessive drooling", "Vomiting", "Difficulty swallowing"],
    severity: 'Mild',
    actionRequired: 'Arum Lily is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdD6eDbAj94jwxqqHTWEkduNfRRyl4-AaNENw4SFi43-ScL0loQc5-2Js4fX9n7yBklWnJD6SZ1zqpgoq0XAtfFPSIytEmRjacoBNE1FY&s=10"
  },
  "asian lily": {
    plantName: 'Asian Lily',
    scientificName: 'Lilium asiatica',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Loss of appetite", "Lethargy", "Kidney failure"],
    severity: 'Severe',
    actionRequired: 'Asian Lily is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQ8ssvhKu5fn9WxSwprqZcfmedO9DjxqviYR5Q2OnN7ODusDobE"
  },
  "asparagus fern": {
    plantName: 'Asparagus Fern',
    scientificName: 'Asparagus densiflorus cv sprengeri',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Abdominal pain", "Loss of appetite", "Lethargy"],
    severity: 'Mild',
    actionRequired: 'Asparagus Fern is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7H0ZLQlbIbUBjTE0077Z4PUw4tSaPreXXABvx0GUsNG-Ptntc0hb3VvY&s=10"
  },
  "australian ivy palm": {
    plantName: 'Australian Ivy Palm',
    scientificName: 'Brassaia actinophylla',
    isToxic: true,
    clinicalSigns: ["Oral irritation", "Vomiting", "Diarrhea", "Difficulty swallowing", "Drooling"],
    severity: 'Mild',
    actionRequired: 'Australian Ivy Palm is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXfK_MW6YbTRJn1vg2gVUaA9YwqR1FpvSCnBY0btUzh5ScrFok1p7v1nGU&s=10"
  },
  "autumn crocus": {
    plantName: 'Autumn Crocus',
    scientificName: 'Colchicum autumnale',
    isToxic: true,
    clinicalSigns: ["Oral irritation", "Vomiting", "Diarrhea", "Depression", "Seizures", "Damage to the liver", "Kidneys", "Gastrointestinal tract", "Respiratory system", "Central nervous system", "Cardiovascular system"],
    severity: 'Mild',
    actionRequired: 'Autumn Crocus is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQESxW33rar84BccC6AFdnyTb8eo-jV2bCSOEPbbD3vVRexzlCLTs7ZyZi8yNp79VwxGQGuAeNfbLAX2g1n9k-Xa-F2-eFWtYeFvfBBFWw&s=10"
  },
  "azalea": {
    plantName: 'Azalea',
    scientificName: 'Rhododendron spp',
    isToxic: true,
    clinicalSigns: ["Cardiovascular collapse", "Coma", "Diarrhea", "Hypotension", "Hyperglycemia", "Vomiting"],
    severity: 'Severe',
    actionRequired: 'Azalea is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8QqNQGNDLOqzyR4BMo0vyRoasmC3xhAzaGvyjMHa-SGRxHeInMV1_z7rr&s=10"
  },
  "baby doll ti plant": {
    plantName: 'Baby Doll Ti Plant',
    scientificName: 'Cordyline terminalis',
    isToxic: true,
    clinicalSigns: ["Severe Vomiting", "Depression", "Anorexia", "Drooling", "Ataxia", "Stomatitis", "Salivation"],
    severity: 'Mild',
    actionRequired: 'Baby Doll Ti Plant is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5p2Q8rIqZPw2Lsk38JCUgQGRGXsCX7s3O_Fnz5zxceuR0rRtfoaz8G_YtiSEUGphNZsT4v7Y-G7jCIIr5im5fsy3etG8TUOOanwXMoUg&s=10"
  },
  "barbados aloe": {
    plantName: 'Barbados Aloe',
    scientificName: 'Aloe barbadensis',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Lethargy", "Depression", "Loss of Appetite", "Tremors"],
    severity: 'Mild',
    actionRequired: 'Barbados Aloe is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcS8pEUOxutYkfdshfSjSFu6AS5iGoJ5M0fesDYOHLcHtIsjnMr-"
  },
  "barbados lily": {
    plantName: 'Barbados Lily',
    scientificName: 'Hippeastrum spp.',
    isToxic: true,
    clinicalSigns: ["Drooling", "Vomiting", "Diarrhea", "Depression", "Tremors"],
    severity: 'Mild',
    actionRequired: 'Barbados Lily is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4E2EmcqpMTNikfJGr9eLbXGX34Wbz6SYNIRFw_IMFDQ&s"
  },
  "barbados pride": {
    plantName: 'Barbados Pride',
    scientificName: 'Caesalpinia pulcherrima',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Barbados Pride is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkKasN0MMyLbtX1huAEnHaVKszTB-Sn2iSYJIEkgF3lxTJisd8fEPRgLak&s=10"
  },
  "barbados pride 2": {
    plantName: 'Barbados Pride 2',
    scientificName: 'Poinciana gilliesii',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Drooling", "Stomach pain", "Oral Irritation"],
    severity: 'Mild',
    actionRequired: 'Barbados Pride 2 is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnXmHuJHIpBuXotk1YmSl22SALbqpEhMz6N03YeFXNmowYwe3mh9Byu7Y&s=10"
  },
  "bay laurel": {
    plantName: 'Bay Laurel',
    scientificName: 'Laurus nobilis',
    isToxic: true,
    clinicalSigns: ["Oral Irritation", "Vomiting", "Diarrhea", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Bay Laurel is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQi9XDzBxmuRYaJdqr59LYGSUQpuToRrMeO6FCOhBRjNgyCw4IHQyghT5OT5GkVrgkDtzqSe4HF5lXTj606KsbbBFmK5XfCdqtTqTrvzu4&s=10"
  },
  "bead tree": {
    plantName: 'Bead Tree',
    scientificName: 'Melia azedarach',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Drooling", "Stomach pain", "CNS depression", "Respiratory depression", "Kidney failure", "Liver failure", "Liver damage", "Death"],
    severity: 'Severe',
    actionRequired: 'Bead Tree is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUrEKxo_mu2jV0wqAsLMkFyf7zNblzrgkEJcRKPcr1MvIEESlg1F6XWHSMHW_uwPxrf-FSr0t_9A0QVancuPUSoGIS5SERdKpe3coTkvQ&s=10"
  },
  "begonia": {
    plantName: 'Begonia',
    scientificName: 'Begonia spp.',
    isToxic: true,
    clinicalSigns: ["Oral irritation", "Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Begonia is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTNTgujGnagjLQxbQAYHUbEPcuQipRwbhZ9mwxA75Lnka9fuoUo"
  },
  "bergamot orange": {
    plantName: 'Bergamot Orange',
    scientificName: 'Citrus Aurantium',
    isToxic: true,
    clinicalSigns: ["Oral irritation", "Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Bergamot Orange is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjUZaczDkrLOkDX0N3F1I5BX20hL4K2WbVdRAaSjaVJyXLAIdNQ_LR06vLaI9qa-J6aQr4QvU8kP9SNHkuF3KFYMAYffYNYQ3292RmRes&s=10"
  },
  "bird of paradise": {
    plantName: 'Bird of Paradise',
    scientificName: 'Caesalpinia gilliesii',
    isToxic: true,
    clinicalSigns: ["Oral irritation", "Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Bird of Paradise is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSabfSPetYCfpae0WiFfxePPVhVJM_OdZ5EyeHN1L5Czt-TT9J4t_VEtx4Ysi3opnZRIwwfJsIw69P6soKOA-2hJXsSWIy3OplhrM-rYQ&s=10"
  },
  "bitter root": {
    plantName: 'Bitter Root',
    scientificName: 'Apocynum androsaemifolium',
    isToxic: true,
    clinicalSigns: ["Oral irritation", "Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Bitter Root is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNzm5HPsObDG91z8jogmRvzrgmYLIlOPY-7_7X6ELdM4ZFJiALSSnxnolmiXA__rJN2b88vZhZfnvE674ifSgEHKrbxgs5Cn-YzslvwCY&s=10"
  },
  "black calla": {
    plantName: 'Black Calla',
    scientificName: 'Arum palestinum',
    isToxic: true,
    clinicalSigns: ["Oral irritation", "Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Black Calla is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToq7mGmAcyfC-4cRm9TwjWGW9xG0Ae59tjjGFidl8jqnnlzmcuy5akMOiy693_Ss_OV51w7ceqmtAUtP9Y1uEZTtiirDYRVTOlwVW2Ag&s=10"
  },
  "black cherry": {
    plantName: 'Black Cherry',
    scientificName: 'Prunus serotina',
    isToxic: true,
    clinicalSigns: ["Gastrointestinal upset", "Tremors", "Loss of Coordination", "Sudden Collapse"],
    severity: 'Mild',
    actionRequired: 'Black Cherry is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmmW5RcMb8j4eJ76XuEcvHbt9XvlPefAGvSZGQPk6x3GyXnpr3Kh9eBNfiCSeI-QdbpSTMVpd1dEtfqpvAjraOY_PcGLWZmnIXl7VKpg&s=10"
  },
  "black laurel": {
    plantName: 'Black Laurel',
    scientificName: 'Leucothoe spp.',
    isToxic: true,
    clinicalSigns: ["Oral irritation", "Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Black Laurel is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRMpUNVsS38Ld1kEXcedjy9Uuz-PDOp8Z9oE10x9UxTLAEYz4sG"
  },
  "black nightshade": {
    plantName: 'Black Nightshade',
    scientificName: 'Solanum nigrum',
    isToxic: true,
    clinicalSigns: ["Severe Vomiting", "Diarreha", "Loss of Appetite", "Extreme Lethargy"],
    severity: 'Severe',
    actionRequired: 'Black Nightshade is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4TKKHWj0oS0UWeaS6AUbo9AaHn01mXxb-J6XSzicmArDRCKrw7dpLb-w-bc_CqdCbWvEce9K-KX16mBCfSGX1WRAg1Ajp0HBhialONRE&s=10"
  },
  "bog laurel": {
    plantName: 'Bog Laurel',
    scientificName: 'Kalmia poliifolia',
    isToxic: true,
    clinicalSigns: ["Oral Irritation", "Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Bog Laurel is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7CCnxBeJAVbyXfCVeDH0iINjRoUCB0YR5QJ6393PqYNr1ITc7b89P7qF-4mzdXAV7PUDv7Lz0mgyfZkEoXO6TdrZGKxsh8bBjr9mEVKA&s=10"
  },
  "borage": {
    plantName: 'Borage',
    scientificName: 'Borage officinalis',
    isToxic: true,
    clinicalSigns: ["Oral Irritation", "Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Borage is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnpXR9zJhXi9KxFUBzPFwOPAJpnAqHsq0EkBPKYC-M761hi1Nr9YgX42JTBaJXXAuQ2NdzJL8VTm5sPykN-75KLaK_mXZNK-FIt2YMBA&s=10"
  },
  "boxwood": {
    plantName: 'Boxwood',
    scientificName: 'Buxus spp.',
    isToxic: true,
    clinicalSigns: ["Oral Irritation", "Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Boxwood is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRKlUyrGBYj_aZnP3PELUX7R3tdK3nHE9M64yExKjwWeqS15Nrg"
  },
  "brunfelsia": {
    plantName: 'Brunfelsia',
    scientificName: 'Brunfelsia species',
    isToxic: true,
    clinicalSigns: ["Oral Irritation", "Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Brunfelsia is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRXmV81ARdrW6QjycfqDC3ZZv0uRfkoVG_ZAYMWRFzXRi3x5t7a"
  },
  "buckeye": {
    plantName: 'Buckeye',
    scientificName: 'Aesculus spp',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Dilated Pupils"],
    severity: 'Severe',
    actionRequired: 'Buckeye is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRFl0qrMrD3qYHj0Gxx9Ar8VEtub_X1AiUgBP55oNdXXBvRlyIR"
  },
  "buddhist pine": {
    plantName: 'Buddhist Pine',
    scientificName: 'Podocarpus macrophylla',
    isToxic: true,
    clinicalSigns: ["Lethargy", "Vomiting", "Diarrhea", "Loss of Appetite"],
    severity: 'Mild',
    actionRequired: 'Buddhist Pine is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl9WqXKUhr_shY1VsMaoRfxo3Tmp3alRimgwR10fBj3j_kyjUc3wOko-tZqHM1edGzLgopYMU6_JQyimpZdB-IJN4g9IIP0ltFMnYbUbo&s=10"
  },
  "burning bush": {
    plantName: 'Burning Bush',
    scientificName: 'Euonymus atropurpurea',
    isToxic: true,
    clinicalSigns: ["Oral Irritation", "Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Burning Bush is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgIMsEAXZT2jxhHOwtcF_9muKo9LluTpRWXCikVclqOw0vHKjg"
  },
  "buttercup": {
    plantName: 'Buttercup',
    scientificName: 'Ranunculus spp.',
    isToxic: true,
    clinicalSigns: ["Oral Irritation", "Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Buttercup is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsHXa5hqZ4Y1IthOsrey-OCA8-CpewVsYXXMKJzETFN8LoMZDPG8p6ERvU&s=10"
  },
  "caladium": {
    plantName: 'Caladium',
    scientificName: 'Caladium hortulanum',
    isToxic: true,
    clinicalSigns: ["Oral Irritation", "Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Caladium is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTM4a9eHXnhnH7DI_oxEDJLzynX5LkiqglWQ7YRdIbITnNj4mfI"
  },
  "calamondin orange": {
    plantName: 'Calamondin Orange',
    scientificName: 'Citrus mitis',
    isToxic: true,
    clinicalSigns: ["Oral Irritation", "Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Calamondin Orange is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQi48MfEkk0sLwFMCzrtTe_MRsvBpdqRhkSbRHuugr-qMUKVDNznwRf2qz476RkQCIuv4CDPwKfoG7DDXwKnpdE6-byKTRdFK0RVALFGng&s=10"
  },
  "cape jasmine": {
    plantName: 'Cape Jasmine',
    scientificName: 'Gardenia jasminoides',
    isToxic: true,
    clinicalSigns: ["Oral Irritation", "Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Cape Jasmine is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4c_e3njVJgJxsq3YItejJypY2CKc6iGln1H7TnllTyVhd9_gExBms2H__RnB_G6PimKZrPOEDGAzeNq_l8zulZuaDTO5t92aPzjXdiQ&s=10"
  },
  "caraway": {
    plantName: 'Caraway',
    scientificName: 'Carum carvi',
    isToxic: true,
    clinicalSigns: ["Mild Vomiting", "Drooling", "Digestive upset"],
    severity: 'Mild',
    actionRequired: 'Caraway is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbQzkE0gqokk0bP13hOC5jzBU2C8iMtdAckY4EBDOUKUTUumOmK0YUuzg&s=10"
  },
  "cardboard cycad": {
    plantName: 'Cardboard Cycad',
    scientificName: 'Zamia furfuracea',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Cardboard Cycad is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReD4XRPtOykMRz_3DPVQcBpkqn0m-EcNtpA1jne_4vUb57KjqaBLyWqk0kKvbJilHEPU4LTGe1IzL9M1fLKdwW5MxLA-gow5eOKwRWaQ&s=10"
  },
  "cardboard palm": {
    plantName: 'Cardboard Palm',
    scientificName: 'Zamia spp.',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Cardboard Palm is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToUokGpYILGZNVpD1djTA7U3mAEvDiB192iwqzu4MgRA&s"
  },
  "cardinal flower": {
    plantName: 'Cardinal Flower',
    scientificName: 'Lobelia cardinalis',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Cardinal Flower is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzYYij75vSWMdC_6Q8RQIXGCwJvGXQszksUWB6RAKKkg9lcm4D-4QDBei73mf27_6Hwgzpo4RXbRYOzDheY_x-0n11Le7boHKFAJTWlg&s=10"
  },
  "carnation": {
    plantName: 'Carnation',
    scientificName: 'Dianthus caryophyllus',
    isToxic: true,
    clinicalSigns: ["Mild dermatitis", "Vomiting", "Diarrhea"],
    severity: 'Mild',
    actionRequired: 'Carnation is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTMkwG5i7It9V2ReqYKs3okfLhHaTJGrEXw-jupz8aALdC6oL9sl_MhM0B1CERN4NheN8s3VjBVfpWp-YGKY9wmamVYyUdTsB6qFnMUg&s=10"
  },
  "catnip": {
    plantName: 'Catnip',
    scientificName: 'Nepeta cataria',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Catnip is listed as toxic to cats by the ASPCA if too much. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLQmMk8su1uLVH0aHvLMq0iq81eBcK50vfG-dLGoRVKf453R85zhSxB3R0bgpxVV-AX738DLrvKExIC7XdPIESh-dGfzy1bN0hYz1zj54&s=10"
  },
  "ceriman": {
    plantName: 'Ceriman',
    scientificName: 'Monstera deliciosa',
    isToxic: true,
    clinicalSigns: ["Oral Irritation", "Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Ceriman is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ82-_rhfp802qBpoAd1aK9lGhC_Jmagb8rJs4gvfyBz1Lj5rvLpXEPZhnZZZ1t1MXtN9rGVrplNDK3m4RJsVTIjqBu5UKyQkmGlAx_Ohs&s=10"
  },
  "chamomile": {
    plantName: 'Chamomile',
    scientificName: 'Anthemis nobilis',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Chamomile is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpkkSxH-0d8wmamItnY4cEJsFkqV3Z4bXlG2XSNFxaTvFJtW766ZX9BoqqrZMdlb-7IXAAMqSM8mXYWap36ORhtSKYSHIKxftjW2i8M6c&s=10"
  },
  "chandelier plant": {
    plantName: 'Chandelier Plant',
    scientificName: 'Kalanchoe tubiflora',
    isToxic: true,
    clinicalSigns: ["Drooling", "Lethargy", "Rapid or irregular heart rate", "Weakness or incoordination"],
    severity: 'Severe',
    actionRequired: 'Chandelier Plant is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZvxeHhxnF51JzZlvFGuPDundyCog-lNwD34zrhTFuD2e-mIZsPXSB18Ngj1IsCA2bMsTq0LYYRb8SUZu9fUrxQ7EZLUqDMBJeNPCjYg&s=10"
  },
  "cherry": {
    plantName: 'Cherry',
    scientificName: 'Prunus spp.',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Drooling", "Stomach pain", "Dilated pupils", "Difficulty breathing"],
    severity: 'Severe',
    actionRequired: 'Cherry is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSuxOGHaYcebXRFH2UiN0Q8cVE9lmXB4wGiEgKu0E0jKYCSAcJU"
  },
  "chinese evergreen": {
    plantName: 'Chinese Evergreen',
    scientificName: 'Aglaonema modestum',
    isToxic: true,
    clinicalSigns: ["Oral Irritation", "Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Chinese Evergreen is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGyF8iXDZrd-B7siw18cU-o-1SfuvLqbRIeEVH4fxuAV8YpCvvt9s46Dp8puY1zZjWpuX7FwtLN9ZcnmWNjc-JtP8dQyPWfLVDivAUFQ&s=10"
  },
  "chinese jade": {
    plantName: 'Chinese Jade',
    scientificName: 'Crassula arborescens',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Chinese Jade is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5XvZKarIzYSFnp_bW6eX8gU4j6i_jxvWGZJpBY68VRHgJKUpFcjiHbV-YbNBy13OS9b1RCWekucbRtsET5z9uhRb4hlRLzvNCpBNdCEU&s=10"
  },
  "chives": {
    plantName: 'Chives',
    scientificName: 'Allium schoenoprasum',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Chives is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4YGYiWpqiPgEGRC8vHIAzuerWqu1gSxTJxTdlLL8YxQRMV8zgo3W0vzKiCn5Rdyu9QPU8JnXu8FA5VilasXs9yABm-KsMD3Y8nSuLtpQ&s=10"
  },
  "christmas rose": {
    plantName: 'Christmas Rose',
    scientificName: 'Helleborus niger',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Christmas Rose is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1yEkIDsuMpY8WkMXYCgT_0MY8QXNVFuyqshCUFL-UewAkVZa4NcGLteysWSjpqz-5_f14AG2E4qpbRXLrMEDw2FvPOkszTw6ZlyMw8NyyXA&s=10"
  },
  "chrysanthemum": {
    plantName: 'Chrysanthemum',
    scientificName: 'Chrysanthemum spp.',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Drooling", "Stomach pain"],
    severity: 'Mild',
    actionRequired: 'Chrysanthemum is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "data:image/jpeg;base64,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"
  },
  "clematis": {
    plantName: 'Clematis',
    scientificName: 'Clematis spp.',
    isToxic: true,
    clinicalSigns: ["Drooling", "Pawing at the mouth", "Tongue Swelling", "Vomiting", "Diarrhea"],
    severity: 'Mild',
    actionRequired: 'Clematis is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYE41N01Zcd9bXj2jOBDCzRVCWAd6oQsWAdrsbvn6Lxg&s"
  },
  "climbing lily": {
    plantName: 'Climbing Lily',
    scientificName: 'Gloriosa superba',
    isToxic: true,
    clinicalSigns: ["Oral irritation", "Excessive drooling", "Vomiting", "Diarrhea", "Lethargy", "Loss of appetite", "Seizures", "Organ damage"],
    severity: 'Severe',
    actionRequired: 'Climbing Lily is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSir5wEmm7BYT_Ha_lg29KYF9KddNL42GTQRL_Tk2u5BQ&s=10"
  },
  "climbing nightshade": {
    plantName: 'Climbing Nightshade',
    scientificName: 'Solanum dulcamara',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Excessive Drooling"],
    severity: 'Mild',
    actionRequired: 'Climbing Nightshade is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUgd8RZvyhoG1WEK8cRFm-K2Ts-2vOHLJgr-O-7k_L3g&s=10"
  },
  "clivia lily": {
    plantName: 'Clivia Lily',
    scientificName: 'Clivia spp.',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Abdominal Pain", "Drooling", "Depression"],
    severity: 'Mild',
    actionRequired: 'Clivia Lily is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQzot5Dz8sxWVqsc16n83erZp0F_LRfek2veWwdS7Tx722smIl12-65vDN&s=10"
  },
  "clusia rosea": {
    plantName: 'Clusia Rosea',
    scientificName: 'Clusia major',
    isToxic: true,
    clinicalSigns: ["Oral irritation", "Vomiting", "Diarrhea", "Skin irritation"],
    severity: 'Mild',
    actionRequired: 'Clusia Rosea is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJPG8qW4OPCtf2CueqPDl2vp9Z6BHIXD2J0_a9E1ueLEhVR_JA9vZfeCf3_cswvo16LcGZYc6R9Del9GBzNOBvhap07m24nrh5EZkAuw&s=10"
  },
  "coffee tree": {
    plantName: 'Coffee Tree',
    scientificName: 'Polyscias guilfoylei',
    isToxic: true,
    clinicalSigns: ["Swelling", "Contact Dermatitis", "Nausea", "Vomiting"],
    severity: 'Mild',
    actionRequired: 'Coffee Tree is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHOP8_G7Cd-L_u2f9c6_NqGrMWCHBPNjaYOTtnDvppaTYPc6siwOZOXyfeowOsHIqwfVjUrKATYMOjgEBfWN-eRJjJq4qiPTXe9zTClw&s=10"
  },
  "coleus": {
    plantName: 'Coleus',
    scientificName: 'Coleus ampoinicus',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Loss of Appetite", "Lethargy", "Drooling"],
    severity: 'Mild',
    actionRequired: 'Coleus is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScjqtTAvzFQ53O0XSM0ImzFXhRJbGZ2zMoItPN3iQqQBy0bpsXIfYsLU2s&s=10"
  },
  "common privet": {
    plantName: 'Common Privet',
    scientificName: 'Ligustrum vulgare',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Drooling", "Depression"],
    severity: 'Mild',
    actionRequired: 'Common Privet is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWyRbqvTiyhXfn_e1UzIDwRZ1AvJVqUMscGHZmSCeomIdWQM0E7F-UGoEo&s=10"
  },
  "coontie palm": {
    plantName: 'Coontie Palm',
    scientificName: 'Zamia pumila',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Excessive Drooling"],
    severity: 'Mild',
    actionRequired: 'Coontie Palm is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS--YWmFGHsbvRukm4OOAh404ef4H16qCaeasiWR4W4ZDEE8_Q6IMNCw-8&s=10"
  },
  "copperleaf": {
    plantName: 'Copperleaf',
    scientificName: 'Acalypha godseffiana',
    isToxic: true,
    clinicalSigns: ["Vomiting", "Diarrhea", "Loss of Appetite", "Drooling"],
    severity: 'Mild',
    actionRequired: 'Copperleaf is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://images.squarespace-cdn.com/content/v1/5324bf63e4b05fc1fc6ea99d/1517474544195-2IC07BI1NJ9KX994NSDZ/ACALYPHA_GODSEFFIANA.jpg"
  },
  "corn plant": {
    plantName: 'Corn Plant',
    scientificName: 'Dracaena fragrans',
    isToxic: true,
    clinicalSigns: ['Vomiting (sometimes with blood)', 'Hypersalivation', 'Depression', 'Anorexia', 'Dilated pupils'],
    severity: 'Mild',
    actionRequired: 'Corn Plant is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7Gw9JDugBkNHKGkA4ThprdaDBqJvnROrvkJ5DDnem16Pt0ElGufJxJt0&s=10"
  },
  "cow parsnip": {
    plantName: 'Cow Parsnip',
    scientificName: 'Heracleum maximum',
    isToxic: true,
    clinicalSigns: ['Photosensitization', 'Contact dermatitis', 'Oral irritation'],
    severity: 'Mild',
    actionRequired: 'Cow Parsnip is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRERmBxt2hppnJmr9j7j3JRtjPzQE7of-VJq4v67A98Mw&s=10"
  },
  "cowbane": {
    plantName: 'Cowbane',
    scientificName: 'Cicuta species',
    isToxic: true,
    clinicalSigns: ['Tremors', 'Salivation', 'Seizures', 'Dilated pupils', 'Diarrhea', 'Vomiting', 'Death'],
    severity: 'Mild',
    actionRequired: 'Cowbane is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6XlDki3VXRtGTwoDO8R4o5bYNLHrfoXgjCfwcj9i7rw&s=10"
  },
  "cyclamen": {
    plantName: 'Cyclamen',
    scientificName: 'Cyclamen spp',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Excessive salivation', 'Heart abnormalities', 'Seizures', 'Death'],
    severity: 'Mild',
    actionRequired: 'Cyclamen is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "Cyclamen spp"
  },
  "daffodil": {
    plantName: 'Daffodil',
    scientificName: 'Narcissus spp',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Salivation', 'Diarrhea', 'Large ingestions cause convulsions', 'Low blood pressure', 'Tremors', 'Cardiac arrhythmias'],
    severity: 'Mild',
    actionRequired: 'Daffodil is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiGEoF8RSespGTV_f2rVUzvgko4NCPXCacWwJjbkZWUsokyPuY7ex5xnSi&s=10"
  },
  "dahlia": {
    plantName: 'Dahlia',
    scientificName: 'Dahlia species',
    isToxic: true,
    clinicalSigns: ['Mild gastrointestinal upset', 'Mild dermatitis'],
    severity: 'Mild',
    actionRequired: 'Dahlia is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: null
  },
  "day lily": {
    plantName: 'Day Lily',
    scientificName: 'Hemerocallis spp.',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Inappetence', 'Lethargy', 'Kidney failure', 'Death'],
    severity: 'Mild',
    actionRequired: 'Day Lily is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://cdn.mos.cms.futurecdn.net/CDjnTYxBJ3xgDSEprNt4CR.jpg"
  },
  "desert rose": {
    plantName: 'Desert Rose',
    scientificName: 'Adenium obesum',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Anorexia', 'Depression', 'Heart rhythm abnormalities', 'Death'],
    severity: 'Mild',
    actionRequired: 'Desert Rose is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZv1Ytq1-dow70XkHchySego1tsF9t6DIF4f-DMlgPn4vqu7MY0Fgt6o6Y&s=10"
  },
  "dieffenbachia": {
    plantName: 'Dieffenbachia',
    scientificName: 'Dieffenbachia',
    isToxic: true,
    clinicalSigns: ['Oral irritation', 'Intense burning and irritation of mouth, tongue and lips', 'Excessive drooling', 'Vomiting', 'Difficulty swallowing'],
    severity: 'Mild',
    actionRequired: 'Dieffenbachia is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://bouqs.com/blog/wp-content/uploads/2024/08/shutterstock_2366959681-min-1-1080x810.jpg"
  },
  "easter lily": {
    plantName: 'Easter Lily',
    scientificName: 'Lilium longiflorum',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Inappetence', 'Lethargy', 'Kidney failure', 'Death'],
    severity: 'Mild',
    actionRequired: 'Easter Lily is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsS80Qw4fhJiRYNpPb0SVknvIcmaWbSpSUPJbMXVP3eg&s=10"
  },
  "english holly": {
    plantName: 'English Holly',
    scientificName: 'Ilex aquifolium',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Depression'],
    severity: 'Mild',
    actionRequired: 'English Holly is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/9/96/Ilex-aquifolium_%28Europaeische_Stechpalme-1%29.jpg"
  },
  "english ivy": {
    plantName: 'English Ivy',
    scientificName: 'Hedera helix',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Abdominal pain', 'Hypersalivation', 'Diarrhea'],
    severity: 'Mild',
    actionRequired: 'English Ivy is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTovpHzfCKj_I_obW2NG1saILvpoxuE7WiD936CR1RJ_brkBGphpBHKbV50&s=10"
  },
  "english yew": {
    plantName: 'English Yew',
    scientificName: 'Taxus baccata',
    isToxic: true,
    clinicalSigns: ['Tremors', 'Dyspnea', 'Ataxia', 'Acute cardiac failure', 'Death'],
    severity: 'Mild',
    actionRequired: 'English Yew is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSf1_rO8iElIkxysZQsJWJ8_4npJUOuuo2Nzv_zl2aLCG75mx689NHou1x5&s=10"
  },
  "epazote": {
    plantName: 'Epazote',
    scientificName: 'Chenopodium ambrosioides',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Lethargy', 'Weakness'],
    severity: 'Mild',
    actionRequired: 'Epazote is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://www.mofga.org/wp-content/uploads/2020/11/28-Epazote-199x300.jpg"
  },
  "eucalyptus": {
    plantName: 'Eucalyptus',
    scientificName: 'Eucalyptus species',
    isToxic: true,
    clinicalSigns: ['Salivation', 'Vomiting', 'Diarrhea', 'Depression', 'Weakness'],
    severity: 'Mild',
    actionRequired: 'Eucalyptus is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Eucalyptus_tereticornis_flowers%2C_capsules%2C_buds_and_foliage.jpeg"
  },
  "fetterbush": {
    plantName: 'Fetterbush',
    scientificName: 'Lyonia spp.',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Salivation', 'Depression', 'Weakness', 'Cardiovascular collapse'],
    severity: 'Mild',
    actionRequired: 'Fetterbush is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLVDjlr1wDyzROtySneqqf15xJhsRiBcouzwH8fquDmw&s=10"
  },
  "fig": {
    plantName: 'Fig',
    scientificName: 'Ficus benjamina',
    isToxic: true,
    clinicalSigns: ['Oral irritation', 'Salivation', 'Vomiting', 'Dermatitis'],
    severity: 'Mild',
    actionRequired: 'Fig is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVl-_WvkyjScR9a-TlS9RonKk4b7hy5Ch2WeG6VknqNchGfTVB5BWHeA0&s=10"
  },
  "flamingo flower": {
    plantName: 'Flamingo Flower',
    scientificName: 'Anthurium scherzeranum',
    isToxic: true,
    clinicalSigns: ['Oral irritation', 'Intense burning of mouth, tongue, lips', 'Excessive drooling', 'Vomiting', 'Difficulty swallowing'],
    severity: 'Mild',
    actionRequired: 'Flamingo Flower is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-afAL3XGR5JEx-HOi2HBFyqMF4nQy1OffMboI-HPUEYT6KH_ur6AFEkeY&s=10"
  },
  "foxglove": {
    plantName: 'Foxglove',
    scientificName: 'Digitalis purpurea',
    isToxic: true,
    clinicalSigns: ['Cardiac arrhythmias', 'Vomiting', 'Diarrhea', 'Weakness', 'Cardiac failure', 'Death'],
    severity: 'Mild',
    actionRequired: 'Foxglove is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTijvSqjka1dRf6TqRRT3ZL0RteBYRB6eD9jirZ681SCe1e5BFVeUet8ZQ&s=10"
  },
  "foxtail": {
    plantName: 'Foxtail',
    scientificName: 'Acalypha hispida',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Loss of appetite'],
    severity: 'Mild',
    actionRequired: 'Foxtail is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Acalypha_Hispida_DS.jpg"
  },
  "garlic": {
    plantName: 'Garlic',
    scientificName: 'Allium sativum',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Breakdown of red blood cells', 'Blood in urine', 'Weakness', 'High heart rate', 'Panting'],
    severity: 'Mild',
    actionRequired: 'Garlic is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdsHAAnegTgSVwe5FtWBAI3PSoohKjhBHNkcClKNbA_XNbiP-MOJnzRhcb&s=10"
  },
  "geranium": {
    plantName: 'Geranium',
    scientificName: 'Pelargonium species',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Depression', 'Dermatitis', 'Anorexia'],
    severity: 'Mild',
    actionRequired: 'Geranium is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlTLkG2sgtEJ_c6hmf1ezAwKIvJ_upttrOQ5zMsOZUhg&s=10"
  },
  "giant dracaena": {
    plantName: 'Giant Dracaena',
    scientificName: 'Cordyline australis',
    isToxic: true,
    clinicalSigns: ['Vomiting (sometimes with blood)', 'Hypersalivation', 'Depression', 'Anorexia', 'Dilated pupils'],
    severity: 'Mild',
    actionRequired: 'Giant Dracaena is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT57ahz5Yxs6XG4JSDUBmznYTP3lhbj14_D6PzRm04MEgnAyilNfAHqxIk&s=10"
  },
  "gladiola": {
    plantName: 'Gladiola',
    scientificName: 'Gladiolus species',
    isToxic: true,
    clinicalSigns: ['Salivation', 'Vomiting', 'Diarrhea', 'Lethargy'],
    severity: 'Mild',
    actionRequired: 'Gladiola is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDzcRp38qvwmx57Z9UJ3SseIXK60M7ZtGGQLx_hI-wAA2kYaVebRdMH7U&s=10"
  },
  "gold dieffenbachia": {
    plantName: 'Gold Dieffenbachia',
    scientificName: 'Dieffenbachia picta',
    isToxic: true,
    clinicalSigns: ['Oral irritation', 'Intense burning of mouth, tongue, lips', 'Excessive drooling', 'Vomiting', 'Difficulty swallowing'],
    severity: 'Mild',
    actionRequired: 'Gold Dieffenbachia is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://www.nearlynatural.com/cdn/shop/products/artificial-golden-dieffenbachia-wdecorative-planter-nearly-natural-572428.jpg?v=1627055599&width=1500"
  },
  "grapefruit": {
    plantName: 'Grapefruit',
    scientificName: 'Citrus paradisii',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Depression', 'Photosensitivity'],
    severity: 'Mild',
    actionRequired: 'Grapefruit is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjCHuXMsSKC5217o-eipKy1wtS16xyDS7pU3y2EbGa1A54o581Vd0WZLc&s=10"
  },
  "groundsel": {
    plantName: 'Groundsel',
    scientificName: 'Senecio species',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Lethargy', 'Liver failure'],
    severity: 'Mild',
    actionRequired: 'Groundsel is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFeY74b7RxhkZktE6mDcm7Z4QwETwywsi3Ox3QVmvNdg&s=10"
  },
  "heartleaf philodendron": {
    plantName: 'Heartleaf Philodendron',
    scientificName: 'Philodendron hederaceum',
    isToxic: true,
    clinicalSigns: ['Oral irritation', 'Intense burning and irritation of mouth, tongue and lips', 'Excessive drooling', 'Vomiting', 'Difficulty swallowing'],
    severity: 'Mild',
    actionRequired: 'Heartleaf Philodendron is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd1U6sawdasqvWq0PGJrvVWxAwzzSkh1nIZnr-aOTt8A&s=10"
  },
  "heavenly bamboo": {
    plantName: 'Heavenly Bamboo',
    scientificName: 'Nandina domestica',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Abdominal pain', 'Coordination problems', 'Seizures', 'Respiratory distress'],
    severity: 'Mild',
    actionRequired: 'Heavenly Bamboo is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwgufziRsDaCNKGwy5H5-4yZ5DZfDgtuYyks4RumHkYGRXytcprl8ck647&s=10"
  },
  "hills of snow": {
    plantName: 'Hills of Snow',
    scientificName: 'Hydrangea arborescens',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Depression', 'Diarrhea'],
    severity: 'Mild',
    actionRequired: 'Hills of Snow is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlTYhlOnDiqj6ZUsxbnhO9mdPoOg_m_bzDlqExxmVLxWiqJZgEKRArPf8&s=10"
  },
  "horsehead philodendron": {
    plantName: 'Horsehead Philodendron',
    scientificName: 'Philodendron bipennifolium',
    isToxic: true,
    clinicalSigns: ['Oral irritation', 'Intense burning of mouth, tongue, lips', 'Excessive drooling', 'Vomiting', 'Difficulty swallowing'],
    severity: 'Mild',
    actionRequired: 'Horsehead Philodendron is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSA_WXq6BeIgQLoedDyjfhlvtIEvoaEXvyBUxR3mrhbMD2JIeA7XNsgxLU&s=10"
  },
  "hosta": {
    plantName: 'Hosta',
    scientificName: 'Hosta plataginea',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Depression'],
    severity: 'Mild',
    actionRequired: 'Hosta is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3Q6z8qe0QynOnQpSrJiWLh2gn-0EBAUFjORrGwqEt5A&s=10"
  },
  "hyacinth": {
    plantName: 'Hyacinth',
    scientificName: 'Hyacinthus orientalis',
    isToxic: true,
    clinicalSigns: ['Intense vomiting', 'Diarrhea (occasionally with blood)', 'Depression', 'Tremors'],
    severity: 'Mild',
    actionRequired: 'Hyacinth is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjT1yTZfU65db6V-bd0JhJUSk9sXnS9aBF9kVOojMOmBlXhDQh9BCTMVI&s=10"
  },
  "inch plant": {
    plantName: 'Inch Plant',
    scientificName: 'Tradescantia flumeninsis',
    isToxic: true,
    clinicalSigns: ['Contact dermatitis', 'Mild gastrointestinal upset'],
    severity: 'Mild',
    actionRequired: 'Inch Plant is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRrrPYFMbCldO8HyXpRLzS0YC0LWXg63fjNfbIBHhEGc0nCgCJ_nPulcO1TFZyBSH3Wjk2xfV2XgqX6xVVz3ctozP5lWNA7XekjZZlXw&s=10"
  },
  "iris": {
    plantName: 'Iris',
    scientificName: 'Iris species',
    isToxic: true,
    clinicalSigns: ['Salivation', 'Vomiting', 'Diarrhea', 'Lethargy', 'Abdominal pain'],
    severity: 'Mild',
    actionRequired: 'Iris is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8j7WDfewrGwsBAX9Kp1X0Z-mMlyy3HmrhL-D2IVEDuA&s"
  },
  "jack-in-the-pulpit": {
    plantName: 'Jack-in-the-Pulpit',
    scientificName: 'Arisaema triphyllum',
    isToxic: true,
    clinicalSigns: ['Oral irritation', 'Intense burning of mouth, tongue, lips', 'Excessive drooling', 'Vomiting', 'Difficulty swallowing'],
    severity: 'Mild',
    actionRequired: 'Jack-in-the-Pulpit is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://www.gardenia.net/wp-content/uploads/2024/10/shutterstock_418117654.jpg"
  },
  "jade plant": {
    plantName: 'Jade Plant',
    scientificName: 'Crassula argentea',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Depression', 'Ataxia', 'Slow heart rate'],
    severity: 'Mild',
    actionRequired: 'Jade Plant is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReupg5OJR8w70MHKp8nePHqA668mrBOPWZBL_-9yAuRQ2uNfQlNAUY2bM0&s=10"
  },
  "japanese show lily": {
    plantName: 'Japanese Show Lily',
    scientificName: 'Lilium speciosum',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Inappetence', 'Lethargy', 'Kidney failure', 'Death'],
    severity: 'Mild',
    actionRequired: 'Japanese Show Lily is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUu3baW2X2A4U5wzKe3c1HRzT6Jy40zEEryer2JJE8vw&s=10"
  },
  "japanese yew": {
    plantName: 'Japanese Yew',
    scientificName: 'Taxus sp.',
    isToxic: true,
    clinicalSigns: ['Tremors', 'Dyspnea', 'Ataxia', 'Acute cardiac failure', 'Death'],
    severity: 'Mild',
    actionRequired: 'Japanese Yew is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFVNBobq8YRj_9uDbLkBsUkTUi_tGYOAOFdJMzH0SV8w&s=10"
  },
  "jerusalem cherry": {
    plantName: 'Jerusalem Cherry',
    scientificName: 'Solanum pseudocapsicum',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Drowsiness', 'Weakness', 'Seizures', 'Slow heart rate', 'Difficulty breathing'],
    severity: 'Mild',
    actionRequired: 'Jerusalem Cherry is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZaEeCknydqQC6j1bBBm3WEr9JQUSWhClhBb0Px-xJTdpVW7OVpLqExkI&s=10"
  },
  "jonquil": {
    plantName: 'Jonquil',
    scientificName: 'Narcissus jonquilla',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Salivation', 'Diarrhea', 'Large ingestions cause convulsions', 'Low blood pressure', 'Tremors', 'Cardiac arrhythmias'],
    severity: 'Mild',
    actionRequired: 'Jonquil is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyyK0c-w1T8WGwReMQq_A5HP3RMnY7H5aWlS6GJS7jYw&s=10"
  },
  "kaffir lily": {
    plantName: 'Kaffir Lily',
    scientificName: 'Clivia minata',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Abdominal pain', 'Drooling', 'Depression'],
    severity: 'Mild',
    actionRequired: 'Kaffir Lily is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw0fr4h3WhUUpjmb1OvaxmOm4pGt2AliCP3MHGXCFzCwL5i1DT6auFTyE&s=10"
  },
  "kalanchoe": {
    plantName: 'Kalanchoe',
    scientificName: 'Kalanchoe spp',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Abnormal heart rhythms'],
    severity: 'Mild',
    actionRequired: 'Kalanchoe is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/6/67/Kalanchoe.blossfeldiana.jpg"
  },
  "klamath weed": {
    plantName: 'Klamath Weed',
    scientificName: 'Hypericum perforatum',
    isToxic: true,
    clinicalSigns: ['Photosensitization', 'Sunburn-like lesions on skin', 'Pruritus'],
    severity: 'Mild',
    actionRequired: 'Klamath Weed is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: null
  },
  "lacy tree philodendron": {
    plantName: 'Lacy Tree Philodendron',
    scientificName: 'Philodendron selloum',
    isToxic: true,
    clinicalSigns: ['Oral irritation', 'Intense burning of mouth, tongue, lips', 'Excessive drooling', 'Vomiting', 'Difficulty swallowing'],
    severity: 'Severe',
    actionRequired: 'Lacy Tree Philodendron is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cf/%28MHNT%29_Hypericum_perforatum_flower_and_buttons.jpg"
  },
  "lambkill": {
    plantName: 'Lambkill',
    scientificName: 'Kalmia augustifolia',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Salivation', 'Depression', 'Weakness', 'Cardiovascular collapse'],
    severity: 'Mild',
    actionRequired: 'Lambkill is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzHjyCLt9v06iRDEh5C8cf99-wbYyOouY8vuayPvu5rg&s=10"
  },
  "lantana": {
    plantName: 'Lantana',
    scientificName: 'Lantana camara',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Lethargy', 'Weakness', 'Liver failure'],
    severity: 'Mild',
    actionRequired: 'Lantana is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/LantanaFlowerLeaves.jpg/1280px-LantanaFlowerLeaves.jpg"
  },
  "larkspur": {
    plantName: 'Larkspur',
    scientificName: 'Delphinium species',
    isToxic: true,
    clinicalSigns: ['Constipation', 'Colic', 'Salivation', 'Muscle tremors', 'Stiffness', 'Weakness', 'Recumbency', 'Convulsions', 'Respiratory paralysis', 'Death'],
    severity: 'Severe',
    actionRequired: 'Larkspur is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTdsed2WuB1W4D0iLfMNT7pVTH97zXV6MAXfgXNecKoA&s=10"
  },
  "laurel": {
    plantName: 'Laurel',
    scientificName: 'Kalmia latifolia',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Salivation', 'Depression', 'Weakness', 'Cardiovascular collapse'],
    severity: 'Severe',
    actionRequired: 'Laurel is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Kalmia_Latifolia.jpg"
  },
  "lavender": {
    plantName: 'Lavender',
    scientificName: 'Lavendula angustifolia',
    isToxic: true,
    clinicalSigns: ['Nausea', 'Vomiting', 'Inappetence'],
    severity: 'Mild',
    actionRequired: 'Lavender is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx7V59qjcG3t29r3tr8Fc78OUlioQMNAOgep677UpTt1JoC5bprMwfI70&s=10"
  },
  "leek": {
    plantName: 'Leek',
    scientificName: 'Allium ampeloprasum',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Breakdown of red blood cells', 'Blood in urine', 'Weakness', 'High heart rate', 'Panting'],
    severity: 'Severe',
    actionRequired: 'Leek is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/8/81/A.ampeloprasum_1.jpg"
  },
  "lemon": {
    plantName: 'Lemon',
    scientificName: 'Citrus limonia',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Depression', 'Photosensitivity'],
    severity: 'Mild',
    actionRequired: 'Lemon is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVxMJMKloRmNlxymPKaDJknl--WDhWUQXESNxa5A8s3FXXdTk26EB67Yg&s=10"
  },
  "lemon grass": {
    plantName: 'Lemon Grass',
    scientificName: 'Cymbopogon citratus',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Depression'],
    severity: 'Mild',
    actionRequired: 'Lemon Grass is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bd/YosriNov04Pokok_Serai.JPG"
  },
  "lemon verbena": {
    plantName: 'Lemon Verbena',
    scientificName: 'Aloysia triphylla',
    isToxic: true,
    clinicalSigns: ['Mild indigestion', 'Skin irritation'],
    severity: 'Mild',
    actionRequired: 'Lemon Verbena is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Aloysia_citriodora_002.jpg"
  },
  "lily": {
    plantName: 'Lily',
    scientificName: 'Lilium species',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Inappetence', 'Lethargy', 'Kidney failure', 'Death'],
    severity: 'Severe',
    actionRequired: 'Lily is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIG_TaEbaXufgUS0giOknBlO_HR3xQDnlUtUZOE6jUWDsUTQB-EC22sl6J&s=10"
  },
  "lily of the valley": {
    plantName: 'Lily of the Valley',
    scientificName: 'Convallaria majalis',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Irregular heartbeat', 'Low blood pressure', 'Confusion', 'Disorientation', 'Seizures', 'Coma', 'Death'],
    severity: 'Mild',
    actionRequired: 'Lily of the Valley is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLCLWEQzmXoDI2oHs_CFrUUDP4eXhFes1W5krlS3EmgKgKIKGNZqF-Y_A&s=10"
  },
  "lime": {
    plantName: 'Lime',
    scientificName: 'Citrus aurantifolia',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Depression', 'Photosensitivity'],
    severity: 'Mild',
    actionRequired: 'Lime is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnW0JVN9ar8CQOydismfVnYjywKh9jRfff1pdkXZDvYJrDH80QbhmXMiE&s=10"
  },
  "locust": {
    plantName: 'Locust',
    scientificName: 'Robinia spp.',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Depression', 'Weakness', 'Anorexia'],
    severity: 'Severe',
    actionRequired: 'Locust is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/8/86/Robina9146.JPG"
  },
  "lovage": {
    plantName: 'Lovage',
    scientificName: 'Levisticum officinale',
    isToxic: true,
    clinicalSigns: ['Photosensitization', 'Mild stomach upset'],
    severity: 'Mild',
    actionRequired: 'Lovage is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgczjndP6otFNX4zlrElcKMv_nYWj3bql7BMpOA_c38A&s=10"
  },
  "madagascar dragon tree": {
    plantName: 'Madagascar Dragon Tree',
    scientificName: 'Dracaena marginata',
    isToxic: true,
    clinicalSigns: ['Vomiting (sometimes with blood)', 'Hypersalivation', 'Depression', 'Anorexia', 'Dilated pupils'],
    severity: 'Severe',
    actionRequired: 'Madagascar Dragon Tree is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: null
  },
  "malaysian dracaena": {
    plantName: 'Malaysian Dracaena',
    scientificName: 'Dracaena reflexa',
    isToxic: true,
    clinicalSigns: ['Vomiting (sometimes with blood)', 'Hypersalivation', 'Depression', 'Anorexia', 'Dilated pupils'],
    severity: 'Mild',
    actionRequired: 'Malaysian Dracaena is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSQwTeZ7YU-v_A0eLsCKqnotc9xXWtt8CgGTyEFggbV_9_Hl5s_PzwrLwW&s=10"
  },
  "mapleleaf begonia": {
    plantName: 'Mapleleaf Begonia',
    scientificName: 'Begonia cleopatra',
    isToxic: true,
    clinicalSigns: ['Oral irritation', 'Vomiting', 'Diarrhea'],
    severity: 'Mild',
    actionRequired: 'Mapleleaf Begonia is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRG3sg5gulRu9Ev07Joor9IKU-ceEoMTz2-aIZiBEg_QMeMElXFSaXnOqI&s=10"
  },
  "marble queen": {
    plantName: 'Marble Queen',
    scientificName: 'Scindapsus aureus',
    isToxic: true,
    clinicalSigns: ['Oral irritation', 'Intense burning and irritation of mouth, tongue and lips', 'Excessive drooling', 'Vomiting', 'Difficulty swallowing'],
    severity: 'Mild',
    actionRequired: 'Marble Queen is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH_pYSlxx4Nv4Gj38cE8ZCjZJnKRuDqWt4mnBtNP5e6A&s=10"
  },
  "marijuana": {
    plantName: 'Marijuana',
    scientificName: 'Cannabis sativa',
    isToxic: true,
    clinicalSigns: ['Depression', 'Vomiting', 'Incoordination', 'Sleepiness', 'Excitation', 'Hypersalivation', 'Dilated pupils', 'Low blood pressure', 'Low body temperature', 'Seizures', 'Coma', 'Death'],
    severity: 'Severe',
    actionRequired: 'Marijuana is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfdb1kWKBOEiFDE9s7G2yx1EjeywkrGOghvGwr2y_3Rw&s"
  },
  "marjoram": {
    plantName: 'Marjoram',
    scientificName: 'Origanum majorana',
    isToxic: true,
    clinicalSigns: ['Mild vomiting', 'Diarrhea', 'Contact dermatitis'],
    severity: 'Mild',
    actionRequired: 'Marjoram is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Origanum_majorana_002.JPG"
  },
  "mayweed": {
    plantName: 'Mayweed',
    scientificName: 'Anthemis cotula',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Allergic dermatitis', 'Bleeding tendencies (with long-term ingestion)'],
    severity: 'Severe',
    actionRequired: 'Mayweed is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOKqWwFfNDg79JTypgbTb8QGUH-MQbURq0Y738tzeW8mR7chH0cpmV50jb&s=10"
  },
  "milkweed": {
    plantName: 'Milkweed',
    scientificName: 'Asclepias species',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Depression', 'Weakness', 'Difficulty breathing', 'Dilated pupils', 'Seizures', 'Coma', 'Death'],
    severity: 'Severe',
    actionRequired: 'Milkweed is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_KTWhj1HtoAtRWi1Pt-Wjskp2-iZCS3jvPzhfpBEiTQ&s=10"
  },
  "mint": {
    plantName: 'Mint',
    scientificName: 'Mentha sp.',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea'],
    severity: 'Mild',
    actionRequired: 'Mint is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTm7k4EzyeujDvEn1SJkfuAUsXNE3Z7nkbUUDpM7b0Oq8ABTALfLNv9VsQ&s=10"
  },
  "mistletoe american": {
    plantName: 'Mistletoe American',
    scientificName: 'Phoradendron flavescens',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Low blood pressure', 'Slow heart rate', 'Breathing difficulties', 'Shock', 'Death'],
    severity: 'Severe',
    actionRequired: 'Mistletoe American is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQckqaDQNxJEf3bbZAPD1Z1L_6v0VNMTmLL7s5zYpy4unXrhHLBCyb0zeps&s=10"
  },
  "morning glory": {
    plantName: 'Morning Glory',
    scientificName: 'Ipomoea spp',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Hallucinations', 'Incoordination'],
    severity: 'Mild',
    actionRequired: 'Morning Glory is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOph9FnJV93H4w3camxmD7U_Zeyl7cHlZaFp2H9n70rMOS3hvLy0XSv6U&s=10"
  },
  "moss rose": {
    plantName: 'Moss Rose',
    scientificName: 'Portulaca oleracea',
    isToxic: true,
    clinicalSigns: ['Hypersalivation', 'Vomiting', 'Diarrhea', 'Depression', 'Tremors', 'Kidney failure'],
    severity: 'Severe',
    actionRequired: 'Moss Rose is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://www.gardenia.net/wp-content/uploads/2023/04/McGEkf8w4qGYCiAsY5MyM76sI318gB5ED1DKgWEf-780x520.webp"
  },
  "narcissus": {
    plantName: 'Narcissus',
    scientificName: 'Narcissus spp',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Salivation', 'Diarrhea', 'Large ingestions cause convulsions', 'Low blood pressure', 'Tremors', 'Cardiac arrhythmias'],
    severity: 'Mild',
    actionRequired: 'Narcissus is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_dZ8zalx5xr2f3kQGbBXUbxz8VFO6rUzTwpL10FVL4Toh29WRoQD34JY&s=10"
  },
  "nasturtium": {
    plantName: 'Nasturtium',
    scientificName: 'Nasturium officinale',
    isToxic: true,
    clinicalSigns: ['Mild stomach upset', 'Skin irritation'],
    severity: 'Mild',
    actionRequired: 'Nasturtium is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeDFsQkRgCKgK8nQZ2X_LauEOg5G7ohhVEoEdbnDGIpA&s=10"
  },
  "nicotiana": {
    plantName: 'Nicotiana',
    scientificName: 'Nicotiana glauca',
    isToxic: true,
    clinicalSigns: ['Hypersalivation', 'Vomiting', 'Diarrhea', 'Excitement', 'Coordination loss', 'Seizures', 'Death'],
    severity: 'Severe',
    actionRequired: 'Nicotiana is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSIAhKoBdDvIoanORqs6Ryt87LXERZw6OQT3PLUpYo2g&s=10"
  },
  "oleander": {
    plantName: 'Oleander',
    scientificName: 'Nerium oleander',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Abnormal heart rate', 'Decreased body temperature', 'Weakness', 'Death'],
    severity: 'Severe',
    actionRequired: 'Oleander is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-vbd2UvvfOAj3750FPCpaHLt__XLgKfwWTLAvCWerkg&s=10"
  },
  "onion": {
    plantName: 'Onion',
    scientificName: 'Allium cepa',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Breakdown of red blood cells', 'Blood in urine', 'Weakness', 'High heart rate', 'Panting'],
    severity: 'Severe',
    actionRequired: 'Onion is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1fxZXVRu3hbxO8_PIJJJmFM_uZ-JI4w1GwXKP4B7qgjt-pG_STNzKAmg&s=10"
  },
  "orange": {
    plantName: 'Orange',
    scientificName: 'Citrus sinensis',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Depression', 'Photosensitivity'],
    severity: 'Mild',
    actionRequired: 'Orange is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlPwVvUNkcHSeWSpsG1qDtEpiF5k5oqSLm_im5LqRDCA&s=10"
  },
  "orange day lily": {
    plantName: 'Orange Day Lily',
    scientificName: 'Hemerocallis graminea',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Inappetence', 'Lethargy', 'Kidney failure', 'Death'],
    severity: 'Severe',
    actionRequired: 'Orange Day Lily is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://d2seqvvyy3b8p2.cloudfront.net/a9e62f300a27a16cc29c86b71982ba0e.jpg"
  },
  "oregano": {
    plantName: 'Oregano',
    scientificName: 'Origanum vulgare hirtum',
    isToxic: true,
    clinicalSigns: ['Mild vomiting', 'Diarrhea', 'Contact dermatitis'],
    severity: 'Mild',
    actionRequired: 'Oregano is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQ0_fnETDi88gwRxo560SHOfKT1W4v2wipM7JzTwCPCZ5NlbLzr21FdWs&s=10"
  },
  "pacific yew": {
    plantName: 'Pacific Yew',
    scientificName: 'Taxus brevifolia',
    isToxic: true,
    clinicalSigns: ['Tremors', 'Dyspnea', 'Ataxia', 'Acute cardiac failure', 'Death'],
    severity: 'Severe',
    actionRequired: 'Pacific Yew is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/8/84/Taxus_brevifolia_Blue_Mts_WA.jpg"
  },
  "parsley": {
    plantName: 'Parsley',
    scientificName: 'Petroselinum crispum',
    isToxic: true,
    clinicalSigns: ['Photosensitization', 'Sunburn-like lesions on skin'],
    severity: 'Mild',
    actionRequired: 'Parsley is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM-9vVJR1mzYSXXUREH9JIEKDS4vSxDxWdS58ZQtGHPlspzH1YW7xPra7H&s=10"
  },
  "peace lily": {
    plantName: 'Peace Lily',
    scientificName: 'Spathiphyllum',
    isToxic: true,
    clinicalSigns: ['Oral irritation', 'Intense burning and irritation of mouth, tongue and lips', 'Excessive drooling', 'Vomiting', 'Difficulty swallowing'],
    severity: 'Mild',
    actionRequired: 'Peace Lily is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7-L02ZlEkyD2O_xEjlBzx5Kb9YQ92wuALL4somovdIGiDQZR70vHJIrc&s=10"
  },
  "peach": {
    plantName: 'Peach',
    scientificName: 'Prunus persica',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Breathing difficulties', 'Dilated pupils', 'Bright red mucous membranes', 'Shock', 'Death'],
    severity: 'Severe',
    actionRequired: 'Peach is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbpa5lPIts7OGJKBamX5Q7SrQ9PfgaF2ETiKqyU7TEhX9J5dG7BXTWYfit&s=10"
  },
  "pencil cactus": {
    plantName: 'Pencil Cactus',
    scientificName: 'Euphorbia tirucalli',
    isToxic: true,
    clinicalSigns: ['Oral irritation', 'Vomiting', 'Excessive drooling', 'Dermatitis', 'Eye irritation'],
    severity: 'Mild',
    actionRequired: 'Pencil Cactus is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUDip_RBtGmnJ2K5Tt0_txkJIIbTHJ5xgZexQJQi8Q-h56XqrBnknUsddx&s=10"
  },
  "peony": {
    plantName: 'Peony',
    scientificName: 'Paeonis officinalis',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Depression'],
    severity: 'Mild',
    actionRequired: 'Peony is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1ZWImUngGwuaIVMgvWAa__oI55ML_LCkcEdOTv6xvgg&s=10"
  },
  "periwinkle": {
    plantName: 'Periwinkle',
    scientificName: 'Vinca rosea',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Depression', 'Incoordination', 'Seizures', 'Coma'],
    severity: 'Severe',
    actionRequired: 'Periwinkle is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://m.media-amazon.com/images/I/61PzSyC0aBL._AC_UF1000,1000_QL80_.jpg"
  },
  "plum": {
    plantName: 'Plum',
    scientificName: 'Prunus domestica',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Breathing difficulties', 'Dilated pupils', 'Bright red mucous membranes', 'Shock', 'Death'],
    severity: 'Severe',
    actionRequired: 'Plum is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/6/67/Fruits_Prunus_domestica.jpg"
  },
  "poinciana": {
    plantName: 'Poinciana',
    scientificName: 'Caesalpinia gilliessi',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Irritation of the mouth and throat'],
    severity: 'Mild',
    actionRequired: 'Poinciana is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwe-A1PS7FXN5drToCRt_0Upg4k64cZW3uOIJv6F2DJw&s=10"
  },
  "poinsettia": {
    plantName: 'Poinsettia',
    scientificName: 'Euphorbia pulcherrima',
    isToxic: true,
    clinicalSigns: ['Irritation to the mouth and stomach', 'Sometimes causing mild vomiting'],
    severity: 'Mild',
    actionRequired: 'Poinsettia is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTljklmwrZ2d39ndL7ZJjhTo5GmXvk8jdpEuVb4cLpNUR76M6Y1kQUWIwtx&s=10"
  },
  "poison hemlock": {
    plantName: 'Poison Hemlock',
    scientificName: 'Conium maculatum',
    isToxic: true,
    clinicalSigns: ['Hypersalivation', 'Vomiting', 'Diarrhea', 'Weakness', 'Muscle tremors', 'Difficulty breathing', 'Death'],
    severity: 'Severe',
    actionRequired: 'Poison Hemlock is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Conium.jpg"
  },
  "poison parsnip": {
    plantName: 'Poison Parsnip',
    scientificName: 'Cicuta maculata',
    isToxic: true,
    clinicalSigns: ['Tremors', 'Salivation', 'Seizures', 'Dilated pupils', 'Diarrhea', 'Vomiting', 'Death'],
    severity: 'Severe',
    actionRequired: 'Poison Parsnip is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/d/df/Cicuta_maculata.jpg"
  },
  "primrose": {
    plantName: 'Primrose',
    scientificName: 'Primula vulgaris',
    isToxic: true,
    clinicalSigns: ['Mild vomiting', 'Skin irritation'],
    severity: 'Mild',
    actionRequired: 'Primrose is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqFzsPHy_UTlnf6WSMqrM5TJXB8_kqZCyA7FuX3XHh7Q&s=10"
  },
  "privet": {
    plantName: 'Privet',
    scientificName: 'Ligustrum japonicum',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Drooling', 'Depression'],
    severity: 'Mild',
    actionRequired: 'Privet is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-7oSsRckMSPt_BCZGmIegxaCCmfamdIxxhhpb6TCfE9231JTaxkEyRAw&s=10"
  },
  "red lily": {
    plantName: 'Red Lily',
    scientificName: 'Lilium umbellatum',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Inappetence', 'Lethargy', 'Kidney failure', 'Death'],
    severity: 'Severe',
    actionRequired: 'Red Lily is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCQe9diT-dm2ST4B_BhAxa0jlDrdpL7xtj0nyY2H0B9DXUohKJtca0_F2y&s=10"
  },
  "rhododendron": {
    plantName: 'Rhododendron',
    scientificName: 'Rhododendron spp',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Salivation', 'Depression', 'Weakness', 'Cardiovascular collapse'],
    severity: 'Mild',
    actionRequired: 'Rhododendron is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8QqNQGNDLOqzyR4BMo0vyRoasmC3xhAzaGvyjMHa-SGRxHeInMV1_z7rr&s=10"
  },
  "rhubarb": {
    plantName: 'Rhubarb',
    scientificName: 'Rheum rhabarbarium',
    isToxic: true,
    clinicalSigns: ['Hypersalivation', 'Vomiting', 'Diarrhea', 'Tremors', 'Kidney failure'],
    severity: 'Severe',
    actionRequired: 'Rhubarb is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Rheum_rhabarbarum.2006-04-27.uellue.jpg"
  },
  "rosary pea": {
    plantName: 'Rosary Pea',
    scientificName: 'Abrus precatorius',
    isToxic: true,
    clinicalSigns: ['Severe vomiting', 'Diarrhea (often bloody)', 'High fever', 'Tremors', 'Shock', 'Death'],
    severity: 'Severe',
    actionRequired: 'Rosary Pea is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtIJ2qPjHVz0incxd5R54hSp6XIDB5kG1aRcdmBkXkQbD_xZx2ZRLDIRa8&s=10"
  },
  "sago palm": {
    plantName: 'Sago Palm',
    scientificName: 'Cycas revoluta, zamia species',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Melena', 'Icterus', 'Increased thirst', 'Hemorrhagic gastroenteritis', 'Bruising', 'Liver damage', 'Liver failure', 'Death'],
    severity: 'Severe',
    actionRequired: 'Sago Palm is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2Cnnw2gaAL1G4vl_u4lGygULYFCDXWV-Uw7YvYvZXdDhB8Et3RKD4kJQ&s=10"
  },
  "satin pothos": {
    plantName: 'Satin Pothos',
    scientificName: 'Scindapsus pictus',
    isToxic: true,
    clinicalSigns: ['Oral irritation', 'Intense burning and irritation of mouth, tongue and lips', 'Excessive drooling', 'Vomiting', 'Difficulty swallowing'],
    severity: 'Mild',
    actionRequired: 'Satin Pothos is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Scindapsus_pictus_01.jpg"
  },
  "schefflera": {
    plantName: 'Schefflera',
    scientificName: 'Schefflera',
    isToxic: true,
    clinicalSigns: ['Oral irritation', 'Intense burning and irritation of mouth, tongue and lips', 'Excessive drooling', 'Vomiting', 'Difficulty swallowing'],
    severity: 'Mild',
    actionRequired: 'Schefflera is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQod2Yg1PybFgJ8dUeCslTJol1wLI_Hn0MH7gU9Ei-Fug&s=10"
  },
  "shamrock plant": {
    plantName: 'Shamrock Plant',
    scientificName: 'Oxalis spp.',
    isToxic: true,
    clinicalSigns: ['Hypersalivation', 'Vomiting', 'Diarrhea', 'Tremors', 'Kidney failure'],
    severity: 'Severe',
    actionRequired: 'Shamrock Plant is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Oxalis_acetosella_jfg.jpg"
  },
  "skunk cabbage": {
    plantName: 'Skunk Cabbage',
    scientificName: 'Symplocarpus foetidus',
    isToxic: true,
    clinicalSigns: ['Oral irritation', 'Intense burning and irritation of mouth, tongue and lips', 'Excessive drooling', 'Vomiting', 'Difficulty swallowing'],
    severity: 'Mild',
    actionRequired: 'Skunk Cabbage is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/0/05/SKUNKCABBAGE-MOSS-400X575.jpg"
  },
  "sorrel": {
    plantName: 'Sorrel',
    scientificName: 'Rumex scutatus',
    isToxic: true,
    clinicalSigns: ['Hypersalivation', 'Vomiting', 'Diarrhea', 'Tremors', 'Kidney failure'],
    severity: 'Severe',
    actionRequired: 'Sorrel is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJ99AsEhmQmHPzWuhKw2VpOy8F9qpUbWJyNSw7nzAWhg&s=10"
  },
  "spring parsley": {
    plantName: 'Spring Parsley',
    scientificName: 'Cymopterus watsonii',
    isToxic: true,
    clinicalSigns: ['Photosensitization', 'Sunburn-like lesions on skin'],
    severity: 'Mild',
    actionRequired: 'Spring Parsley is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDiF3xrLOLwKouN_fkhNjop5b78n_DVz9T17tj7xnvwonK4q7Nkpm_xgiD&s=10"
  },
  "staggerbush": {
    plantName: 'Staggerbush',
    scientificName: 'Lyonia sp.',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Salivation', 'Depression', 'Weakness', 'Cardiovascular collapse'],
    severity: 'Severe',
    actionRequired: 'Staggerbush is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlEe0W0V923WFEezJ69QRn0YFUGzqQuMvjdfr54HfFp7SyTzLpExRucGUi&s=10"
  },
  "stargazer lily": {
    plantName: 'Stargazer Lily',
    scientificName: 'Lilium orientalis',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Inappetence', 'Lethargy', 'Kidney failure', 'Death'],
    severity: 'Severe',
    actionRequired: 'Stargazer Lily is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2TW0k-YItrK8BQjHX-Up_bYvKU6X2NFt2wfMQc7UG_bBVBM7xywQC6d4&s=10"
  },
  "sweet cherry": {
    plantName: 'Sweet Cherry',
    scientificName: 'Prunus avium',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Breathing difficulties', 'Dilated pupils', 'Bright red mucous membranes', 'Shock', 'Death'],
    severity: 'Severe',
    actionRequired: 'Sweet Cherry is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZOInpeYZgKoF2Mi3XJ4sSDrscq0jBlepr2NIJ_NRbmw&s=10"
  },
  "tahitian bridal veil": {
    plantName: 'Tahitian Bridal Veil',
    scientificName: 'tradescantia multiflora',
    isToxic: true,
    clinicalSigns: ['Contact dermatitis', 'Mild stomach upset'],
    severity: 'Mild',
    actionRequired: 'Tahitian Bridal Veil is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFeCceuoRchmGZh3PvQmf6IQReznuZHED3w0tDf_v5SSRwOl39In7auewZ&s=10"
  },
  "tarragon": {
    plantName: 'Tarragon',
    scientificName: 'Artemisia dracunculus',
    isToxic: true,
    clinicalSigns: ['Mild vomiting', 'Diarrhea'],
    severity: 'Mild',
    actionRequired: 'Tarragon is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbUVLMR3FY3A1vcnLbtcL7mKdPLgC_4wqZljjLrd0tDJ77AKjmwprMQF1h&s=10"
  },
  "tiger lily": {
    plantName: 'Tiger Lily',
    scientificName: 'Lilium tigrinum',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Inappetence', 'Lethargy', 'Kidney failure', 'Death'],
    severity: 'Severe',
    actionRequired: 'Tiger Lily is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoSQ0Ows_cYWMRhgKhE0_sISBIAEoPJ5-N-_BbSrn2CLyfWxGJwGOVLynF&s=10"
  },
  "tomato plant": {
    plantName: 'Tomato Plant',
    scientificName: 'Lycopersicon spp',
    isToxic: true,
    clinicalSigns: ['Hypersalivation', 'Inappetence', 'Severe gastrointestinal upset', 'Depression', 'Weakness', 'Slow heart rate', 'Dilated pupils'],
    severity: 'Severe',
    actionRequired: 'Tomato Plant is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaaW2rx5wKPibxw1aenCmOuiCRps4AYGhD5MQhtksCeV-aqP--HWUS8hxT&s=10"
  },
  "tulip": {
    plantName: 'Tulip',
    scientificName: 'Tulipa spp.',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Depression', 'Diarrhea', 'Hypersalivation', 'Increased heart rate'],
    severity: 'Severe',
    actionRequired: 'Tulip is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://images.squarespace-cdn.com/content/v1/5d00610d3115730001df62ab/1588263476411-NKLFSCQ13FMDOKBCH3TI/Pink_Tulips.jpg"
  },
  "warneckei dracaena": {
    plantName: 'Warneckei Dracaena',
    scientificName: 'Dracaena deremensis',
    isToxic: true,
    clinicalSigns: ['Vomiting (sometimes with blood)', 'Hypersalivation', 'Depression', 'Anorexia', 'Dilated pupils'],
    severity: 'Mild',
    actionRequired: 'Warneckei Dracaena is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKWWpJ6NID8xNuNjCgkTx2-K28hurQFgzl-uzxQtN-c9Nc2hx7GBRJ1ps&s=10"
  },
  "weeping fig": {
    plantName: 'Weeping Fig',
    scientificName: 'Ficus sp.',
    isToxic: true,
    clinicalSigns: ['Oral irritation', 'Salivation', 'Vomiting', 'Dermatitis'],
    severity: 'Mild',
    actionRequired: 'Weeping Fig is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4wSp0nm2QtKkSmhFXSIz2d1TAWgRlTOBpJYNQFujzC_emRUGrgs7VFUpA&s=10"
  },
  "wisteria": {
    plantName: 'Wisteria',
    scientificName: 'Wisteria spp.',
    isToxic: true,
    clinicalSigns: ['Vomiting (sometimes bloody)', 'Diarrhea', 'Depression', 'Dehydration'],
    severity: 'Mild',
    actionRequired: 'Wisteria is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://extension.umd.edu/sites/extension.umd.edu/files/styles/optimized/public/2023-04/ChineseWist-RebekahDWallaceUofGA_Bugwood.jpg?itok=eTT4QjvC"
  },
  "yarrow": {
    plantName: 'Yarrow',
    scientificName: 'Achillea millefolium',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Dermatitis', 'Increased urination'],
    severity: 'Mild',
    actionRequired: 'Yarrow is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu_eXYt3id0GU1LwMyPN678ziSToQ6JZ_mg8O3NDeWs7nSyzYHtPooEjbb&s=10"
  },
  "yellow oleander": {
    plantName: 'Yellow Oleander',
    scientificName: 'Thevetia peruviana',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Abnormal heart rate', 'Decreased body temperature', 'Weakness', 'Death'],
    severity: 'Severe',
    actionRequired: 'Yellow Oleander is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQn7ym8V6490XgpMJF5HO6YtT3uUhPBXATWLrreJOo6C3yNzBk2GuMhbaDj&s=10"
  },
  "yesterday today tomorrow": {
    plantName: 'Yesterday Today Tomorrow',
    scientificName: 'Brunfelsia species',
    isToxic: true,
    clinicalSigns: ['Tremors', 'Seizures', 'Vomiting', 'Diarrhea', 'Salivation', 'Lethargy', 'Incoordination'],
    severity: 'Mild',
    actionRequired: 'Yesterday Today Tomorrow is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW9amx-osUOAF6rx_nm-AEfAPzajygy5iZ2ANPAqaq-Q&s=10"
  },
  "yew": {
    plantName: 'Yew',
    scientificName: 'Taxus spp.',
    isToxic: true,
    clinicalSigns: ['Tremors', 'Dyspnea', 'Ataxia', 'Acute cardiac failure', 'Death'],
    severity: 'Severe',
    actionRequired: 'Yew is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQibW_otuOds5QTNt4iou-TJNlH5pCTdrzjhgQ7N22OJQ&s=10"
  },
  "yew pine": {
    plantName: 'Yew Pine',
    scientificName: 'Podocarpus macrophylla',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea'],
    severity: 'Mild',
    actionRequired: 'Yew Pine is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRcpQYrxwjPQWS9FdVZY9ej7-w53Yjx3uaKOufFOQcTCZ7rTZYUPm58dU&s=10"
  },
  "yucca": {
    plantName: 'Yucca',
    scientificName: 'Yucca spp.',
    isToxic: true,
    clinicalSigns: ['Vomiting', 'Diarrhea', 'Depression'],
    severity: 'Mild',
    actionRequired: 'Yucca is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.',
    mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm1QGFDPLhBhK5XZII8oavkhC_Mkh0yxQv2DOupbgAgQ&s"
  },
};