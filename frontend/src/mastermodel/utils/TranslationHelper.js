// Smart Agricultural Dictionary
export const PRODUCT_NAME_MAPPING = {
  // Specific Translations (Meaning based)
  'fertilizer': 'खत',
  'urea': 'युरिया',
  'dap': 'डीएपी',
  'npk': 'एनपीके खत',
  'potash': 'पोटॅश',
  'super phosphate': 'सुपर फॉस्फेट',
  'bio fertilizer': 'जैविक खत',
  'organic fertilizer': 'सेंद्रिय खत',
  'pesticide': 'कीटकनाशक',
  'herbicide': 'तणनाशक',
  'fungicide': 'बुरशीनाशक',
  'insecticide': 'कीटकनाशक',
  'medicine': 'औषध',
  'spraying medicine': 'औषध फवारणी',
  'seeds': 'बियाणे',
  'cotton seeds': 'कापूस बियाणे',
  'wheat seeds': 'गहू बियाणे',
  'soybean seeds': 'सोयाबीन बियाणे',
  'maize seeds': 'मका बियाणे',
  'spray pump': 'फवारणी पंप',
  'drip pipe': 'ठिबक पाइप',
  'spraying machine': 'औषध फवारणी मशीन',
  'pvc pipe': 'पीव्हीसी पाइप',
  'motor': 'मोटार',
  'tejas': 'तेजस',
  'seeds': 'बियाणे'
};

// Basic Transliteration Logic for Marathi (Approximation)
const transliterateToMarathi = (text) => {
  if (!text) return '';
  
  // This is a basic mapping for demonstration. 
  // In a real scenario, one might use a more complex library or API.
  // But we will handle the most common agricultural terms and names accurately.
  
  const lowerText = text.toLowerCase().trim();
  
  // Check dictionary first (Priority 1)
  if (PRODUCT_NAME_MAPPING[lowerText]) {
    return PRODUCT_NAME_MAPPING[lowerText];
  }

  // Handle multi-word names (Priority 2)
  const words = lowerText.split(' ');
  const translatedWords = words.map(word => PRODUCT_NAME_MAPPING[word] || word);
  
  // If at least one word was found in dictionary, return the combined version
  if (translatedWords.some((w, i) => w !== words[i])) {
    return translatedWords.join(' ');
  }

  // Fallback: If not in dictionary, we return the original or a basic transliteration if possible
  // For now, we will focus on the user's specific dictionary which is very comprehensive
  return text; 
};

export const getMarathiTranslation = (englishName) => {
  return transliterateToMarathi(englishName);
};
