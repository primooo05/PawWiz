/**
 * Prompt Validator
 * Detects vague, unclear, or inappropriate prompts and suggests clarifications
 */

export interface PromptValidation {
  isVague: boolean;
  reason: string;
  clarifyingQuestion: string;
  suggestedPrompts: string[];
}

// Vague keywords that indicate insufficient information
const VAGUE_INDICATORS = [
  'weird',
  'strange',
  'odd',
  'different',
  'acting funny',
  'acting different',
  'not normal',
  'acting up',
  'being weird',
  'seems off',
  'feels like something\'s wrong',
  'doesn\'t seem right',
  'something\'s up',
  'has a problem',
  'seems weird',
  'looks weird',
];

// Keywords indicating inadequate detail
const INSUFFICIENT_DETAIL = [
  'doing something',
  'being weird',
  'just sitting',
  'just lying',
  'just there',
  'idk',
  'i don\'t know',
  'can\'t explain',
  'hard to describe',
  'just acting weird',
];

/**
 * Validate if a prompt is too vague and needs clarification
 */
export function validatePrompt(userMessage: string): PromptValidation {
  const lowerMessage = userMessage.toLowerCase();
  const messageLength = userMessage.trim().split(/\s+/).length; // word count

  // Check for vague indicators
  let vagueCount = 0;
  for (const indicator of VAGUE_INDICATORS) {
    if (lowerMessage.includes(indicator)) {
      vagueCount++;
    }
  }

  // Check for insufficient detail
  let insufficientCount = 0;
  for (const indicator of INSUFFICIENT_DETAIL) {
    if (lowerMessage.includes(indicator)) {
      insufficientCount++;
    }
  }

  // Determine if prompt is vague
  const isVague = vagueCount > 0 || insufficientCount > 0 || messageLength < 5;

  if (!isVague) {
    return {
      isVague: false,
      reason: '',
      clarifyingQuestion: '',
      suggestedPrompts: [],
    };
  }

  // Determine the specific reason and generate suggestions
  let reason = '';
  let clarifyingQuestion = '';
  let suggestedPrompts: string[] = [];

  if (lowerMessage.includes('weird') || lowerMessage.includes('strange')) {
    reason = 'Too general - "weird" needs specific details';
    clarifyingQuestion = 'What exactly is your cat doing that seems weird?';
    suggestedPrompts = [
      'My cat is meowing constantly at night',
      'My cat is hiding and not eating',
      'My cat is pouncing on things aggressively',
      'My cat keeps licking the same spot obsessively',
    ];
  } else if (lowerMessage.includes('acting up') || lowerMessage.includes('acting funny')) {
    reason = 'Unclear behavior - more details needed';
    clarifyingQuestion = 'Can you describe the specific behavior or sounds your cat is making?';
    suggestedPrompts = [
      'My cat is making strange chirping sounds at birds',
      'My cat is running around frantically in circles',
      'My cat is refusing to use the litter box',
      'My cat is attacking me when I try to pet',
    ];
  } else if (lowerMessage.includes('not normal') || lowerMessage.includes('doesn\'t seem right')) {
    reason = 'Vague assessment - specifics would help';
    clarifyingQuestion = 'What does your cat\'s normal behavior look like, and what\'s different?';
    suggestedPrompts = [
      'My cat usually sleeps 16 hours but is now awake all day',
      'My cat is usually playful but is now lethargic',
      'My cat is usually calm but keeps hissing at family members',
      'My cat usually eats a lot but barely touches food now',
    ];
  } else if (insufficientCount > 0 || messageLength < 5) {
    reason = 'Not enough information - can\'t decode without details';
    clarifyingQuestion = 'Tell me more about what your cat is doing. What are you seeing or hearing?';
    suggestedPrompts = [
      'My cat is meowing with high-pitched cries',
      'My cat is stalking and pouncing on my feet',
      'My cat is grooming itself excessively',
      'My cat is sleeping in unusual positions',
    ];
  } else {
    reason = 'Vague prompt - needs more specific details';
    clarifyingQuestion = 'Can you provide more specific details about what your cat is doing?';
    suggestedPrompts = [
      'My cat is displaying different behavior',
      'My cat is making unusual sounds',
      'My cat\'s body language has changed',
      'My cat\'s activity level is different',
    ];
  }

  return {
    isVague: true,
    reason,
    clarifyingQuestion,
    suggestedPrompts,
  };
}

/**
 * Check if a message contains inappropriate content
 */
export function checkInappropriate(userMessage: string): { isInappropriate: boolean; reason: string } {
  const lowerMessage = userMessage.toLowerCase();

  // Check for requests to harm animals
  if (
    lowerMessage.includes('hurt') ||
    lowerMessage.includes('harm') ||
    lowerMessage.includes('kill') ||
    lowerMessage.includes('abuse')
  ) {
    return {
      isInappropriate: true,
      reason: 'Cannot provide advice that could harm animals',
    };
  }

  return { isInappropriate: false, reason: '' };
}
