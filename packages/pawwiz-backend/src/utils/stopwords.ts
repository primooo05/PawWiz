/**
 * English stop-word dictionary used by the RAKE keyword extractor.
 * Includes closed-class English tokens (articles, aux verbs, pronouns,
 * prepositions, conjunctions) and low-signal domain fillers that recur
 * across cat-behavior chat prompts.
 *
 * The set is frozen and case-normalized. Callers must lowercase tokens
 * before lookup.
 */

const STOPWORD_LIST: readonly string[] = [
  // articles
  'a', 'an', 'the',

  // pronouns
  'i', 'me', 'my', 'mine', 'myself',
  'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself',
  'we', 'us', 'our', 'ours', 'ourselves',
  'they', 'them', 'their', 'theirs', 'themselves',
  'this', 'that', 'these', 'those',
  'who', 'whom', 'whose', 'which', 'what', 'whatever', 'whoever',

  // aux / modal / copular verbs
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'having',
  'do', 'does', 'did', 'doing', 'done',
  'will', 'would', 'shall', 'should', 'can', 'could', 'may',
  'might', 'must', 'ought', 'need',
  "don't", "doesn't", "didn't", "isn't", "aren't", "wasn't", "weren't",
  "hasn't", "haven't", "hadn't", "won't", "wouldn't", "shouldn't",
  "couldn't", "can't", "cannot", "shan't", "mustn't",
  "i'm", "i've", "i'll", "i'd",
  "you're", "you've", "you'll", "you'd",
  "he's", "she's", "it's", "we're", "we've", "we'll", "we'd",
  "they're", "they've", "they'll", "they'd",
  "that's", "there's", "here's", "what's", "where's", "who's",

  // prepositions / conjunctions
  'and', 'or', 'but', 'nor', 'so', 'yet', 'if', 'then', 'else',
  'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for',
  'with', 'about', 'against', 'between', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'to', 'from',
  'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
  'further', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
  'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'not', 'only', 'own', 'same', 'than',
  'too', 'very', 'just', 'also', 'like', 'unlike',

  // low-signal fillers
  'get', 'got', 'getting', 'go', 'goes', 'going', 'went', 'gone',
  'make', 'makes', 'making', 'made',
  'take', 'takes', 'taking', 'took', 'taken',
  'come', 'comes', 'coming', 'came',
  'know', 'knows', 'knowing', 'knew', 'known',
  'think', 'thinks', 'thinking', 'thought',
  'want', 'wants', 'wanting', 'wanted',
  'see', 'sees', 'seeing', 'saw', 'seen',
  'say', 'says', 'saying', 'said',
  'give', 'gives', 'giving', 'gave', 'given',
  'thing', 'things', 'stuff', 'kind', 'sort',
  'today', 'yesterday', 'tomorrow', 'now', 'still',
  'really', 'actually', 'basically', 'literally', 'maybe',
  'lot', 'lots', 'bit', 'kinda', 'sorta',
  'okay', 'ok', 'well', 'yeah', 'yes', 'hi', 'hey', 'hello',
  'please', 'help',

  // domain fillers (PawWiz-specific — subjects the app already knows)
  'cat', 'cats', 'kitty', 'kitten', 'kittens', 'pet', 'pets',
];

export const STOPWORDS: ReadonlySet<string> = new Set(STOPWORD_LIST);

/** True when the lowercase token is a stop-word. Empty strings return true. */
export function isStopword(token: string): boolean {
  if (token.length === 0) return true;
  return STOPWORDS.has(token);
}
