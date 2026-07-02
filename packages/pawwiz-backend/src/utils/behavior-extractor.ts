/**
 * Behavior Extractor: Keyword-based behavior pattern recognition
 * Extracts behavior types, intensity, and context from user messages
 * without requiring AI APIs
 */

export interface ExtractedBehavior {
  type: string; // 'playful', 'anxious', 'aggressive', 'lethargic', 'affectionate', etc.
  intensity: 'mild' | 'moderate' | 'severe';
  description: string;
  context?: string;
  confidence: number; // 0-1
  keywords: string[]; // which keywords triggered this extraction
}

// Behavior patterns: keyword groups that indicate specific behaviors
const BEHAVIOR_KEYWORDS = {
  playful: {
    keywords: [
      'play', 'playful', 'running', 'sprinting', 'bouncing', 'pouncing', 'chasing',
      'zoom', 'zoomies', 'energetic', 'frisky', 'fun', 'chase', 'jump', 'jumping',
      'active', 'game', 'toy', 'pounce', 'gallop', 'silly', 'crazy', 'wild',
    ],
    intensity: { high: ['sprint', 'zoom', 'zoomies', 'crazy', 'wild', 'mad dash'] },
  },
  anxious: {
    keywords: [
      'anxious', 'nervous', 'scared', 'scared', 'frightened', 'hiding', 'hides',
      'trembling', 'shaking', 'stressed', 'stressed', 'tense', 'skittish', 'nervous',
      'afraid', 'scared', 'startled', 'jumpy', 'on edge', 'fidgety',
    ],
    intensity: { high: ['trembling', 'shaking', 'hiding constantly', 'won\'t leave'] },
  },
  aggressive: {
    keywords: [
      'aggressive', 'attacking', 'biting', 'scratching', 'hissing', 'growling',
      'pouncing hard', 'attack', 'bite', 'scratch', 'swat', 'angry', 'mad',
      'fight', 'violent', 'fierce', 'swatting', 'claw',
    ],
    intensity: { high: ['attacking', 'biting', 'scratching deeply', 'drawing blood'] },
  },
  affectionate: {
    keywords: [
      'affectionate', 'loving', 'cuddly', 'cuddles', 'snuggle', 'snuggling', 'purr',
      'purring', 'meowing', 'headbutt', 'rubbing', 'head rub', 'lap', 'hug', 'love',
      'friendly', 'sweet', 'gentle', 'kind', 'soft', 'warm', 'close',
    ],
    intensity: { high: ['constant purring', 'won\'t leave my side', 'all day cuddles'] },
  },
  lethargic: {
    keywords: [
      'lethargic', 'lazy', 'tired', 'sleeping', 'sluggish', 'inactive', 'sedentary',
      'low energy', 'no energy', 'doesn\'t want to play', 'stays in one spot', 'doesn\'t move',
      'listless', 'unresponsive', 'dull', 'slow', 'rest', 'nap', 'sleepy', 'exhausted',
    ],
    intensity: { high: ['won\'t move', 'completely unresponsive', 'sleeps constantly'] },
  },
  vocalization: {
    keywords: [
      'meowing', 'meow', 'meows', 'chirp', 'chirping', 'trill', 'trilling', 'yowl',
      'yowling', 'hiss', 'hissing', 'growl', 'growling', 'silent meow', 'squeaking',
      'chattering', 'chirping', 'vocal', 'sound', 'noise', 'loud',
    ],
    intensity: { high: ['constant meowing', 'loud yowling', 'screaming', 'excessive vocalization'] },
  },
  grooming: {
    keywords: [
      'grooming', 'licking', 'cleaning', 'self-grooming', 'washing', 'obsessively licking',
      'over-grooming', 'bald spots', 'hair loss', 'excessively grooming', 'biting fur',
    ],
    intensity: { high: ['obsessively', 'over-grooming', 'bald spots', 'hair loss'] },
  },
  toileting: {
    keywords: [
      'litter box', 'bathroom', 'urine', 'urinating', 'peeing', 'pee', 'poop', 'pooping',
      'defecation', 'outside box', 'accidents', 'marking', 'spraying', 'constipation', 'diarrhea',
    ],
    intensity: { high: ['outside litter box', 'spraying', 'multiple accidents'] },
  },
};

// Context keywords that provide additional information
const CONTEXT_KEYWORDS = {
  time: {
    'morning': ['morning', 'dawn', 'early', 'wake'],
    'afternoon': ['afternoon', 'day', 'daytime', 'midday'],
    'evening': ['evening', 'dusk', 'sunset'],
    'night': ['night', 'nighttime', 'midnight', '2am', '3am', '4am', '5am', 'late night'],
  },
  trigger: {
    'feeding': ['after eating', 'after meal', 'food', 'fed', 'feeding', 'dinner', 'breakfast'],
    'playing': ['after play', 'during play', 'play time', 'toy', 'game'],
    'interaction': ['when I', 'when you', 'when someone', 'when guests', 'visitor', 'stranger'],
    'stress': ['loud noise', 'vacuum', 'new', 'moved', 'moved house', 'thunderstorm', 'fireworks'],
  },
};

/**
 * Extract behaviors from a user message
 * @param message - The user's description of their cat's behavior
 * @returns Array of extracted behaviors
 */
export function extractBehaviors(message: string): ExtractedBehavior[] {
  const lowercaseMsg = message.toLowerCase();
  const extractedBehaviors: ExtractedBehavior[] = [];
  const foundKeywords = new Set<string>();

  // Iterate through behavior types and find matches
  for (const [behaviorType, patterns] of Object.entries(BEHAVIOR_KEYWORDS)) {
    const matchingKeywords: string[] = [];
    let maxIntensity = 'mild';

    for (const keyword of patterns.keywords) {
      if (lowercaseMsg.includes(keyword)) {
        matchingKeywords.push(keyword);
        foundKeywords.add(keyword);

        // Check if this keyword indicates high intensity
        if (patterns.intensity?.high && patterns.intensity.high.some(h => lowercaseMsg.includes(h))) {
          maxIntensity = 'severe';
        }
      }
    }

    if (matchingKeywords.length > 0) {
      // Confidence increases with more matching keywords
      const confidence = Math.min(1, matchingKeywords.length * 0.3);

      extractedBehaviors.push({
        type: behaviorType,
        intensity: determineIntensity(lowercaseMsg, maxIntensity),
        description: message, // Store original message
        context: extractContext(lowercaseMsg),
        confidence,
        keywords: matchingKeywords,
      });
    }
  }

  return extractedBehaviors;
}

/**
 * Determine intensity level based on message content
 */
function determineIntensity(message: string, baseIntensity: string): 'mild' | 'moderate' | 'severe' {
  const intensityModifiers = {
    severe: ['constant', 'always', 'never stops', 'excessive', 'extreme', 'obsessive', 'uncontrollable'],
    moderate: ['often', 'frequently', 'regularly', 'a lot', 'quite a bit', 'several times'],
  };

  for (const modifier of intensityModifiers.severe) {
    if (message.includes(modifier)) return 'severe';
  }

  for (const modifier of intensityModifiers.moderate) {
    if (message.includes(modifier)) return 'moderate';
  }

  return baseIntensity === 'severe' ? 'severe' : 'mild';
}

/**
 * Extract contextual information from the message
 */
function extractContext(message: string): string | undefined {
  const contexts: string[] = [];

  for (const [contextType, timings] of Object.entries(CONTEXT_KEYWORDS.time)) {
    for (const timing of Object.values(timings)) {
      if (message.includes(timing as string)) {
        contexts.push(contextType);
        break;
      }
    }
  }

  for (const [triggerType, triggers] of Object.entries(CONTEXT_KEYWORDS.trigger)) {
    for (const trigger of Object.values(triggers)) {
      if (message.includes(trigger as string)) {
        contexts.push(triggerType);
        break;
      }
    }
  }

  return contexts.length > 0 ? contexts.join(', ') : undefined;
}

/**
 * Generate a simple summary of the behavior from extracted patterns
 */
export function generateBehaviorSummary(behaviors: ExtractedBehavior[]): string {
  if (behaviors.length === 0) return 'No specific behaviors detected';

  const typeCount = new Map<string, number>();
  for (const behavior of behaviors) {
    typeCount.set(behavior.type, (typeCount.get(behavior.type) || 0) + 1);
  }

  // Get the most frequent behavior type
  let topBehavior = '';
  let maxCount = 0;
  for (const [type, count] of typeCount.entries()) {
    if (count > maxCount) {
      maxCount = count;
      topBehavior = type;
    }
  }

  // Create a human-readable summary
  const behaviorLabel: Record<string, string> = {
    playful: 'Playful & Active',
    anxious: 'Anxious & Nervous',
    aggressive: 'Aggressive',
    affectionate: 'Affectionate & Loving',
    lethargic: 'Lethargic & Low Energy',
    vocalization: 'Vocal',
    grooming: 'Grooming Focus',
    toileting: 'Toileting Issues',
  };

  return behaviorLabel[topBehavior] || topBehavior;
}

/**
 * Generate pattern insights for dashboard
 * Analyzes multiple behavior logs to find trends
 */
export interface BehaviorPattern {
  type: string;
  frequency: number;
  avgIntensity: 'mild' | 'moderate' | 'severe';
  commonContexts: string[];
  trend: 'increasing' | 'stable' | 'decreasing';
}

export function generateBehaviorPatterns(
  behaviorLogs: Array<{ type: string; intensity: string; context?: string; createdAt: Date }>,
  timeframeHours: number = 168 // default: 1 week
): BehaviorPattern[] {
  if (behaviorLogs.length === 0) return [];

  const cutoffDate = new Date(Date.now() - timeframeHours * 60 * 60 * 1000);
  const recentLogs = behaviorLogs.filter(log => log.createdAt > cutoffDate);

  if (recentLogs.length === 0) return [];

  const patterns = new Map<string, BehaviorPattern>();

  for (const log of recentLogs) {
    if (!patterns.has(log.type)) {
      patterns.set(log.type, {
        type: log.type,
        frequency: 0,
        avgIntensity: 'mild',
        commonContexts: [],
        trend: 'stable',
      });
    }

    const pattern = patterns.get(log.type)!;
    pattern.frequency += 1;

    // Track contexts
    if (log.context) {
      const contexts = log.context.split(', ');
      for (const ctx of contexts) {
        if (!pattern.commonContexts.includes(ctx)) {
          pattern.commonContexts.push(ctx);
        }
      }
    }
  }

  // Convert to array and sort by frequency
  return Array.from(patterns.values()).sort((a, b) => b.frequency - a.frequency);
}
