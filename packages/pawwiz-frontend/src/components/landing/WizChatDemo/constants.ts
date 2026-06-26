import type { ChatLine } from "./types";

export const SCRIPT: ChatLine[] = [
  {
    speaker: "wiz",
    text: "Hello there! 🐾 I'm Wiz, your personal Virtual Mascot Doctor of PawWiz. What seems to be the problem?",
    pauseBefore: 600,
    typingDuration: 1800,
  },
  {
    speaker: "user",
    text: "Hi! My cat is very fat, around 15 kg, and I don't know what to do.",
    pauseBefore: 1200,
    typingDuration: 2200,
  },
  {
    speaker: "wiz",
    text: "It seems like your cat is dealing with significant obesity. At 15 kg, that's about 2–3× the ideal weight for most cats. I'd recommend switching to a high-protein, low-carb wet food diet, splitting meals into 3 smaller portions daily, and scheduling a vet check for thyroid levels.",
    pauseBefore: 800,
    typingDuration: 2800,
  },
  {
    speaker: "user",
    text: "What food should I get specifically?",
    pauseBefore: 1000,
    typingDuration: 1400,
  },
  {
    speaker: "wiz",
    text: "Great question! Look for wet foods with: ✓ 40–50% protein ✓ No grain fillers ✓ High moisture (75%+). Brands like Royal Canin Satiety or Hill's Metabolic work well. Want me to calculate a precise daily calorie target for your cat?",
    pauseBefore: 700,
    typingDuration: 2600,
  },
];
