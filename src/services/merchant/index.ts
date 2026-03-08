/**
 * Merchant Normalization Service
 * Clean and standardize merchant names for better categorization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const MERCHANT_MAPPING_KEY = '@fintrack/merchant_mapping';

// Common patterns to remove from merchant names
const NOISE_PATTERNS = [
  /\s+\d+$/i, // Trailing numbers (location codes)
  /\s+#\d+$/i, // Store numbers
  /\s+store\s+#?\d+/i, // "Store 123"
  /\s+location\s+#?\d+/i, // "Location 123"
  /\s+branch\s+#?\d+/i, // "Branch 123"
  /\s+-\s*.*$/i, // Everything after dash (often location)
  /\s+\([^)]*\)/i, // Text in parentheses
  /\*+\d*$/i, // Trailing asterisks with numbers
  /^[0-9\s\-*]+/i, // Leading numbers, spaces, dashes, asterisks
  /\s{2,}/g, // Multiple spaces
];

// Location patterns
const LOCATION_PATTERNS = [
  /\s+(inc|llc|ltd|corp|corporation|co|company)\s*\.?$/i,
  /\s+(pvt|private|limited)\s*\.?$/i,
  /\s+[A-Z]{2}$/i, // State codes at end
  /,\s*[A-Z]{2}$/i, // ", CA" style
];

// Common merchant name mappings
const COMMON_MERCHANTS: Record<string, string> = {
  'amazon web services': 'AWS',
  'amazon prime': 'Amazon Prime',
  'amzn mktp': 'Amazon',
  'amzn': 'Amazon',
  'apple.com/bill': 'Apple',
  'google storage': 'Google Cloud',
  'google cloud': 'Google Cloud',
  'netflix.com': 'Netflix',
  'spotify': 'Spotify',
  'uber': 'Uber',
  'lyft': 'Lyft',
  'starbucks': 'Starbucks',
  'mcdonalds': "McDonald's",
  'dunkin': 'Dunkin',
  'walmart': 'Walmart',
  'target': 'Target',
  'costco': 'Costco',
  'wholefoods': 'Whole Foods',
  'whole foods': 'Whole Foods',
  'cvs': 'CVS',
  'walgreens': 'Walgreens',
};

interface MerchantMapping {
  [original: string]: string;
}

/**
 * Clean merchant name by removing noise patterns
 */
export function cleanMerchantName(name: string): string {
  if (!name) return '';

  let cleaned = name.trim();

  // Remove noise patterns
  NOISE_PATTERNS.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Remove location patterns
  LOCATION_PATTERNS.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Clean up whitespace
  cleaned = cleaned.trim().replace(/\s+/g, ' ');

  // Capitalize properly
  cleaned = cleaned
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return cleaned;
}

/**
 * Normalize merchant name using mappings and cleaning
 */
export function normalizeMerchantName(name: string): string {
  if (!name) return 'Unknown Merchant';

  const cleaned = cleanMerchantName(name);
  const lowerCleaned = cleaned.toLowerCase();

  // Check common mappings
  for (const [key, value] of Object.entries(COMMON_MERCHANTS)) {
    if (lowerCleaned.includes(key.toLowerCase())) {
      return value;
    }
  }

  return cleaned || 'Unknown Merchant';
}

/**
 * Get custom merchant mappings from storage
 */
async function getCustomMappings(): Promise<MerchantMapping> {
  try {
    const data = await AsyncStorage.getItem(MERCHANT_MAPPING_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading merchant mappings:', error);
    return {};
  }
}

/**
 * Save custom merchant mappings
 */
async function saveCustomMappings(mappings: MerchantMapping): Promise<void> {
  try {
    await AsyncStorage.setItem(MERCHANT_MAPPING_KEY, JSON.stringify(mappings));
  } catch (error) {
    console.error('Error saving merchant mappings:', error);
  }
}

/**
 * Add custom merchant mapping
 */
export async function addMerchantMapping(original: string, normalized: string): Promise<void> {
  const mappings = await getCustomMappings();
  mappings[original.toLowerCase()] = normalized;
  await saveCustomMappings(mappings);
}

/**
 * Get normalized name with custom mappings
 */
export async function getNormalizedMerchant(name: string): Promise<string> {
  const customMappings = await getCustomMappings();
  const lowerName = name.toLowerCase();

  // Check custom mappings first
  if (customMappings[lowerName]) {
    return customMappings[lowerName];
  }

  // Use automatic normalization
  return normalizeMerchantName(name);
}

/**
 * Extract merchant keywords for categorization
 */
export function extractMerchantKeywords(name: string): string[] {
  const normalized = normalizeMerchantName(name).toLowerCase();
  const words = normalized.split(' ');

  // Filter out common words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'at', 'to'];
  return words.filter(word => word.length > 2 && !stopWords.includes(word));
}

/**
 * Categorization keywords for rule-based fallback
 */
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: [
    'restaurant',
    'cafe',
    'coffee',
    'pizza',
    'burger',
    'food',
    'dining',
    'kitchen',
    'grill',
    'bistro',
    'eatery',
    'starbucks',
    'mcdonalds',
    'subway',
    'chipotle',
    'dunkin',
  ],
  groceries: [
    'market',
    'grocery',
    'supermarket',
    'walmart',
    'target',
    'costco',
    'wholefoods',
    'trader',
    'safeway',
    'kroger',
    'publix',
  ],
  transport: [
    'uber',
    'lyft',
    'taxi',
    'gas',
    'fuel',
    'parking',
    'transit',
    'metro',
    'train',
    'bus',
    'toll',
    'shell',
    'chevron',
    'exxon',
    'bp',
  ],
  shopping: [
    'amazon',
    'ebay',
    'store',
    'shop',
    'retail',
    'mall',
    'boutique',
    'clothing',
    'fashion',
    'apparel',
  ],
  entertainment: [
    'netflix',
    'spotify',
    'hulu',
    'disney',
    'movie',
    'cinema',
    'theater',
    'concert',
    'game',
    'youtube',
    'twitch',
  ],
  bills: [
    'electric',
    'water',
    'gas',
    'utility',
    'internet',
    'phone',
    'mobile',
    'verizon',
    'att',
    'tmobile',
    'comcast',
    'spectrum',
  ],
  health: [
    'pharmacy',
    'cvs',
    'walgreens',
    'hospital',
    'clinic',
    'doctor',
    'medical',
    'health',
    'dental',
    'insurance',
  ],
};

/**
 * Suggest category based on merchant keywords
 */
export function suggestCategory(merchantName: string): string | null {
  const keywords = extractMerchantKeywords(merchantName);
  const lowerName = merchantName.toLowerCase();

  for (const [category, categoryKeywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of categoryKeywords) {
      if (lowerName.includes(keyword) || keywords.includes(keyword)) {
        return category;
      }
    }
  }

  return null;
}
