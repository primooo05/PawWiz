/**
 * Prompt Validator
 * Detects vague, unclear, or inappropriate prompts and suggests clarifications.
 * Also generates curiosity-driven follow-up questions for structured-but-thin prompts.
 */

export interface PromptValidation {
  isVague: boolean;
  reason: string;
  clarifyingQuestion: string;
  suggestedPrompts: string[];
}

export interface FollowUpValidation {
  /** True when the message has enough structure to warrant a curiosity follow-up
   *  rather than a generic "tell me more" clarification. */
  needsFollowUp: boolean;
  question: string;
  suggestedPrompts: string[];
}

// Greeting patterns — these should receive a friendly reply, not a vague-prompt
// clarification. They are intentionally excluded from the vague-detection path.
export const GREETING_PATTERNS = [
  /^\s*(hi|hey|hello|howdy|greetings|yo|sup|hiya|hola|bonjour|salut|heyy+|heyyy+|helloo+|helloooo+)\s*[!?.]*\s*$/i,
];

/** True when the message is purely a greeting with no behavioral context. */
export function isGreeting(message: string): boolean {
  return GREETING_PATTERNS.some((re) => re.test(message.trim()));
}

// ─── Follow-up topic maps ────────────────────────────────────────────────────
// Each entry: { keywords, question, chips[] }
// Chips are deliberately different from the original clarifying chips so there
// is no chance of the same prompt re-appearing in the follow-up.

const FOLLOW_UP_TOPICS: Array<{
  keywords: string[];
  question: string;
  chips: string[];
}> = [
  {
    keywords: ['meow', 'meowing', 'cries', 'crying', 'high-pitched', 'loud', 'yowl', 'yowling', 'scream'],
    question: "Those high-pitched cries can mean a few things. 🐱 Is this happening at a specific time — like at night, around meal times, or when she's near a door or window?",
    chips: [
      'She cries loudly at night and won\'t stop',
      'She meows right before or after eating',
      'She sits at the door yowling to go outside',
      'She woke up crying and seems disoriented',
    ],
  },
  {
    keywords: ['hiding', 'hides', 'under bed', 'under the bed', 'behind', 'closet', 'corner'],
    question: "Hiding usually signals stress or discomfort. 🫣 Did something change recently — a new person, loud noise, or a trip to the vet — or is this new behavior out of nowhere?",
    chips: [
      'She started hiding after we had guests over',
      'She hid after a loud noise scared her',
      'She has been hiding for days and barely eats',
      'She hides but comes out when it\'s quiet',
    ],
  },
  {
    keywords: ['hiss', 'hissing', 'swat', 'swatting', 'growl', 'growling', 'attack', 'attacking', 'scratch', 'scratching', 'bite', 'biting', 'aggressive'],
    question: "Aggression usually has a trigger. 🙀 Is she reacting to a specific person, another pet, or does it seem to come out of nowhere during petting or play?",
    chips: [
      'She suddenly attacks my hands during petting',
      'She hisses and swats at the other cat',
      'She gets aggressive when I pick her up',
      'She attacks my feet when I walk past',
    ],
  },
  {
    keywords: ['purr', 'purring', 'knead', 'kneading', 'biscuits', 'slow blink', 'headbutt', 'rubbing'],
    question: "That sounds like affectionate behavior! 😺 Is she doing this towards you specifically, or towards objects and blankets too?",
    chips: [
      'She kneads and purrs on my lap only',
      'She headbutts me and slow-blinks',
      'She kneads blankets and purrs loudly alone',
      'She purrs loudly but also bites gently',
    ],
  },
  {
    keywords: ['litter', 'litter box', 'pee', 'peeing', 'urinate', 'poop', 'pooping', 'outside', 'accident', 'spray', 'spraying'],
    question: "Litter box issues can point to stress, territory, or health concerns. 🧐 Is she going *near* the box but not in it, or avoiding the area entirely?",
    chips: [
      'She squats near the box but goes on the floor',
      'She stopped using the box after we moved it',
      'She only uses it sometimes and sprays elsewhere',
      'She cries before or after using the litter box',
    ],
  },
  {
    keywords: ['lick', 'licking', 'groom', 'grooming', 'bald', 'fur loss', 'overgrooming', 'obsessive'],
    question: "Excessive grooming often signals stress or a skin issue. 🩺 Is she focusing on one specific spot, or grooming her whole body more than usual?",
    chips: [
      'She licks her belly until it\'s bald',
      'She pulls fur from her tail obsessively',
      'She grooms constantly but no bald patches yet',
      'She started this after a change at home',
    ],
  },
  {
    keywords: ['play', 'playing', 'pounce', 'pouncing', 'chase', 'chasing', 'zoomies', 'run', 'running', 'jump', 'jumping'],
    question: "Sounds energetic! 🎾 Is this happening at a particular time of day, or is she playing rough enough that it feels like aggression?",
    chips: [
      'She gets the zoomies every night at 3am',
      'She pounces on me but seems friendly about it',
      'She plays rough and sometimes scratches hard',
      'She plays alone with her toys for hours',
    ],
  },
  {
    keywords: ['eat', 'eating', 'food', 'hungry', 'not eating', 'refusing', 'appetite', 'drink', 'drinking', 'water'],
    question: "Changes in appetite are worth paying attention to. 🍽️ Has this been gradual over a few days, or did it change suddenly?",
    chips: [
      'She stopped eating overnight with no warning',
      'She eats less every day over the past week',
      'She drinks a lot of water but won\'t eat',
      'She begs constantly but only wants treats',
    ],
  },
  {
    keywords: ['sleep', 'sleeping', 'tired', 'lethargic', 'lazy', 'inactive', 'energy', 'sluggish'],
    question: "Increased sleep can be normal — but a sudden drop in energy is worth noting. 💤 Is she sleeping more than usual, or does she seem weak or unresponsive when awake?",
    chips: [
      'She used to be active but now only sleeps',
      'She seems weak and doesn\'t react to toys',
      'She sleeps all day but is active at night',
      'She naps more since we got a new pet',
    ],
  },
  {
    keywords: ['chirp', 'chirping', 'chatter', 'chattering', 'trill', 'trilling', 'bird', 'window'],
    question: "That chattering is prey-drive in action! 🐦 Is she doing this at birds specifically, or at other moving things like insects, screens, or shadows?",
    chips: [
      'She chatters at birds through the window',
      'She chirps at the TV when animals appear',
      'She chatters and then zooms around the room',
      'She trills softly at me when I call her name',
    ],
  },
];

/**
 * Words/phrases that indicate the message already contains specific context
 * (location, named time window, causal phrase, physical detail).
 * Their presence means the message is a detailed answer, not a thin opener —
 * follow-up should NOT fire.
 *
 * Deliberately excludes broad frequency/degree words (always, never, sometimes,
 * just, only, seems, looks, scared, etc.) that appear equally in thin questions.
 */
const ALREADY_SPECIFIC_MARKERS = [
  // concrete locations
  'door', 'window', 'outside', 'bedroom', 'kitchen', 'bathroom', 'litter',
  'couch', 'bed', 'floor', 'corner', 'closet', 'hallway', 'lap',
  // body parts (specific physical detail)
  'belly', 'tail', 'fur', 'paw', 'ear',
  // named time windows (multi-word only — avoids matching "at" or "night" alone)
  'at night', 'in the morning', 'every day', 'all day', 'all night',
  // high-specificity frequency (not generic)
  'constantly', 'once', 'twice',
  // time-relative anchors
  'before', 'after', 'when i', 'when she', 'when he', 'while', 'until',
  'week',
  // causal / contextual markers
  'since', 'because', 'after we', 'since we', 'new pet', 'new cat',
  'vet', 'moved', 'guests', 'alone',
  // physical degree (high specificity, rarely in opening questions)
  'loudly', 'softly', 'gently', 'obsessively', 'barely', 'stopped',
];

/**
 * Generate a curiosity-driven follow-up for a message that has enough structure
 * to be recognizable but not enough detail for a full behavioral decode.
 *
 * Returns `needsFollowUp: false` when:
 * - no topic keyword matches, OR
 * - the message already contains specific context markers (location, time,
 *   frequency, cause) that indicate it is a detailed answer, not a thin opener.
 *   In that case the caller should route straight to the AI decode.
 */
export function generateFollowUp(userMessage: string): FollowUpValidation {
  const lower = userMessage.toLowerCase();

  // If the message already contains specific context, it's a detailed answer —
  // don't re-trigger follow-up no matter what topic keywords are present.
  const isAlreadySpecific = ALREADY_SPECIFIC_MARKERS.some((marker) => lower.includes(marker));
  if (isAlreadySpecific) {
    return { needsFollowUp: false, question: '', suggestedPrompts: [] };
  }

  for (const topic of FOLLOW_UP_TOPICS) {
    if (topic.keywords.some((kw) => lower.includes(kw))) {
      return {
        needsFollowUp: true,
        question: topic.question,
        suggestedPrompts: topic.chips,
      };
    }
  }

  return { needsFollowUp: false, question: '', suggestedPrompts: [] };
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
  "feels like something's wrong",
  "doesn't seem right",
  "something's up",
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
  "i don't know",
  "can't explain",
  'hard to describe',
  'just acting weird',
];

/**
 * Validate if a prompt is too vague and needs clarification.
 * Only triggers for genuinely context-free messages. Structured-but-thin
 * messages (e.g. "My cat is meowing") are handled by generateFollowUp().
 */
export function validatePrompt(userMessage: string): PromptValidation {
  const lowerMessage = userMessage.toLowerCase();
  const messageLength = userMessage.trim().split(/\s+/).length; // word count

  // Greetings are never vague — they are handled upstream by the decoder.
  if (isGreeting(userMessage)) {
    return { isVague: false, reason: '', clarifyingQuestion: '', suggestedPrompts: [] };
  }

  // If the message matches a follow-up topic it has enough structure —
  // let the decoder handle it as a follow-up, not a generic clarification.
  // Also: specific messages (containing context markers) go straight to the AI.
  const followUpResult = generateFollowUp(userMessage);
  const isAlreadySpecific = ALREADY_SPECIFIC_MARKERS.some((m) => lowerMessage.includes(m));
  if (followUpResult.needsFollowUp || isAlreadySpecific) {
    return { isVague: false, reason: '', clarifyingQuestion: '', suggestedPrompts: [] };
  }

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
    return { isVague: false, reason: '', clarifyingQuestion: '', suggestedPrompts: [] };
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
  } else if (lowerMessage.includes('not normal') || lowerMessage.includes("doesn't seem right")) {
    reason = 'Vague assessment - specifics would help';
    clarifyingQuestion = "What does your cat's normal behavior look like, and what's different?";
    suggestedPrompts = [
      'My cat usually sleeps 16 hours but is now awake all day',
      'My cat is usually playful but is now lethargic',
      'My cat is usually calm but keeps hissing at family members',
      'My cat usually eats a lot but barely touches food now',
    ];
  } else if (insufficientCount > 0 || messageLength < 5) {
    reason = "Not enough information - can't decode without details";
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
      "My cat's body language has changed",
      "My cat's activity level is different",
    ];
  }

  return { isVague: true, reason, clarifyingQuestion, suggestedPrompts };
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
