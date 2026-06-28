import { z } from 'zod';

/**
 * Pure validation logic for each onboarding step.
 * No React state, no side effects — just input → result.
 */

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export function validateStep2(ownerName: string, ownerEmail: string): ValidationResult {
  const name = ownerName.trim();
  const email = ownerEmail.trim();

  if (name.length === 0) {
    return { isValid: false, message: `Hey so, I have a name and you don't?meow*` };
  }
  if (name.length < 2) {
    return { isValid: false, message: "Name must be at least 2 characters, meow!" };
  }
  if (email.length === 0) {
    return { isValid: false, message: "I need your email too! Every cat parent needs one, meow!" };
  }
  if (!z.string().email().safeParse(email).success) {
    return { isValid: false, message: "Hmm, that doesn't look like a valid email. Try again, meow!" };
  }

  return { isValid: true, message: `Meow, ${name}! So glad to meet you! 🐾` };
}

export function validateStep3(catsCount: string, customCatsCount: string): ValidationResult {
  const hasCats = catsCount.trim().length > 0 || customCatsCount.trim().length > 0;

  if (!hasCats) {
    return { isValid: false, message: "Adopt me if you don't have one!" };
  }

  const parsedCount = parseCatsCount(catsCount, customCatsCount);
  const selectedLabel = catsCount || customCatsCount.trim();

  if (parsedCount !== null && parsedCount >= 1 && parsedCount <= 3) {
    return { isValid: true, message: `Amazing, ${selectedLabel} Cats` };
  }

  return { isValid: false, message: "That's too many Fur Babies, my dream fur parent!" };
}

export function validateStep4(catName: string, catSex: string): ValidationResult {
  const trimmedName = catName.trim();

  if (trimmedName.length < 2) {
    return { isValid: false, message: "Is that really a cat's name? Try again, meow." };
  }
  if (!catSex) {
    return { isValid: false, message: "Please select your cat's biological gender, meow" };
  }

  return { isValid: true, message: `What a cool name for a ${catSex.toLowerCase()} cat!` };
}

export function validateStep5(catLifeStage: string): ValidationResult {
  if (!catLifeStage) {
    return { isValid: false, message: "Please select your cat's life stage, meow" };
  }

  return { isValid: true, message: `Awesome! A wonderful ${catLifeStage.toLowerCase()} cat!` };
}

export function validateStep7(password: string, confirmPassword: string): ValidationResult {
  if (password.length === 0) {
    return { isValid: false, message: "You need a password to protect your profile, meow!" };
  }
  if (password.length < 12) {
    return { isValid: false, message: "Password must be at least 12 characters long!" };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Add an uppercase letter to make it stronger!" };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Add a lowercase letter too, meow!" };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
    return { isValid: false, message: "Spice it up with a special character!" };
  }
  if (/\s/.test(password)) {
    return { isValid: false, message: "No spaces allowed in passwords, meow!" };
  }
  if (confirmPassword.length === 0) {
    return { isValid: false, message: "Please confirm your password, meow!" };
  }
  if (password !== confirmPassword) {
    return { isValid: false, message: "Passwords don't match! Try again, meow!" };
  }

  return { isValid: true, message: "Purr-fect! Your account is being created..." };
}

/**
 * Resolves the total number of cats the user indicated they have.
 */
export function getResolvedCatsCount(catsCount: string, customCatsCount: string): number {
  const parsed = parseCatsCount(catsCount, customCatsCount);
  return parsed ?? 1;
}

/**
 * Parses the cats count from either the preset option or custom text input.
 */
export function parseCatsCount(countStr: string, customStr: string): number | null {
  const cats = countStr.trim().toLowerCase();
  const custom = customStr.trim().toLowerCase();

  if (cats) {
    if (cats === 'one') return 1;
    if (cats === 'two') return 2;
    if (cats === 'three') return 3;
  }

  if (custom) {
    const parsed = parseInt(custom, 10);
    if (!isNaN(parsed)) return parsed;

    const wordMap: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    };
    return wordMap[custom] ?? null;
  }

  return null;
}

/**
 * Derives display text for "other cats" count in step 6.
 */
export function getOtherCatsText(catsCount: string, customCatsCount: string): string {
  if (customCatsCount.trim()) {
    const count = parseInt(customCatsCount.trim(), 10);
    if (!isNaN(count) && count > 1) {
      return `${count - 1} ${count - 1 === 1 ? 'cat' : 'cats'}`;
    }
    return customCatsCount;
  }
  if (catsCount === 'Two') return '1 cat';
  if (catsCount === 'Three') return '2 cats';
  return 'cats';
}
