// Random username generator for anonymous chat users

const adjectives = [
  'Anonymous', 'Mystery', 'Secret', 'Hidden', 'Silent', 'Quiet', 'Curious', 'Wandering',
  'Phantom', 'Shadow', 'Mystic', 'Enigma', 'Whisper', 'Echo', 'Cosmic', 'Digital',
  'Neon', 'Cyber', 'Electric', 'Quantum', 'Stellar', 'Lunar', 'Solar', 'Arctic',
  'Crimson', 'Azure', 'Golden', 'Silver', 'Emerald', 'Ruby', 'Sapphire', 'Diamond',
  'Swift', 'Bold', 'Brave', 'Clever', 'Wise', 'Sharp', 'Bright', 'Cool',
  'Wild', 'Free', 'Pure', 'Noble', 'Royal', 'Elite', 'Prime', 'Ultra'
];

const nouns = [
  'User', 'Guest', 'Visitor', 'Stranger', 'Traveler', 'Explorer', 'Seeker', 'Wanderer',
  'Spirit', 'Soul', 'Mind', 'Voice', 'Whisper', 'Echo', 'Dream', 'Vision',
  'Star', 'Moon', 'Sun', 'Comet', 'Galaxy', 'Nebula', 'Cosmos', 'Universe',
  'Wolf', 'Eagle', 'Falcon', 'Tiger', 'Lion', 'Dragon', 'Phoenix', 'Raven',
  'Ocean', 'River', 'Mountain', 'Forest', 'Desert', 'Valley', 'Storm', 'Thunder',
  'Knight', 'Warrior', 'Guardian', 'Hunter', 'Sage', 'Wizard', 'Mage', 'Scholar',
  'Artist', 'Poet', 'Dreamer', 'Thinker', 'Creator', 'Builder', 'Maker', 'Designer'
];

const animals = [
  'Cat', 'Dog', 'Fox', 'Wolf', 'Bear', 'Lion', 'Tiger', 'Eagle',
  'Hawk', 'Owl', 'Raven', 'Dolphin', 'Whale', 'Shark', 'Turtle', 'Penguin',
  'Panda', 'Koala', 'Rabbit', 'Deer', 'Horse', 'Zebra', 'Giraffe', 'Elephant'
];

const colors = [
  'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Black',
  'White', 'Gray', 'Brown', 'Cyan', 'Magenta', 'Lime', 'Indigo', 'Violet',
  'Crimson', 'Scarlet', 'Azure', 'Turquoise', 'Emerald', 'Gold', 'Silver', 'Bronze'
];

const techTerms = [
  'Byte', 'Pixel', 'Code', 'Data', 'Node', 'Link', 'Net', 'Web',
  'Cloud', 'Stream', 'Flow', 'Sync', 'Hash', 'Key', 'Token', 'Cache',
  'Buffer', 'Stack', 'Queue', 'Array', 'Vector', 'Matrix', 'Grid', 'Mesh'
];

/**
 * Generates a random username for anonymous chat users
 * @param style - The style of username to generate
 * @returns A randomly generated username
 */
export function generateRandomUsername(style: 'default' | 'animal' | 'tech' | 'color' = 'default'): string {
  const getRandomElement = <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const getRandomNumber = (min: number = 100, max: number = 9999): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  switch (style) {
    case 'animal':
      return `${getRandomElement(adjectives)}${getRandomElement(animals)}${getRandomNumber()}`;
    
    case 'tech':
      return `${getRandomElement(techTerms)}${getRandomElement(nouns)}${getRandomNumber()}`;
    
    case 'color':
      return `${getRandomElement(colors)}${getRandomElement(nouns)}${getRandomNumber()}`;
    
    default:
      return `${getRandomElement(adjectives)}${getRandomElement(nouns)}${getRandomNumber()}`;
  }
}

/**
 * Generates multiple username suggestions
 * @param count - Number of suggestions to generate
 * @param style - The style of usernames to generate
 * @returns Array of username suggestions
 */
export function generateUsernameSuggestions(count: number = 5, style?: 'default' | 'animal' | 'tech' | 'color'): string[] {
  const suggestions = new Set<string>();
  const styles: Array<'default' | 'animal' | 'tech' | 'color'> = ['default', 'animal', 'tech', 'color'];
  
  while (suggestions.size < count) {
    const selectedStyle = style || getRandomElement(styles);
    suggestions.add(generateRandomUsername(selectedStyle));
  }
  
  return Array.from(suggestions);
}

/**
 * Validates if a username is appropriate (basic validation)
 * @param username - Username to validate
 * @returns Boolean indicating if username is valid
 */
export function validateUsername(username: string): boolean {
  // Basic validation rules
  const minLength = 3;
  const maxLength = 20;
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  
  return (
    username.length >= minLength &&
    username.length <= maxLength &&
    validPattern.test(username)
  );
}

/**
 * Gets a random element from an array (utility function)
 */
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}