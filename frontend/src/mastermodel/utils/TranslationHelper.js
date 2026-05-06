export const PRODUCT_NAME_MAPPING = {
  // Fertilizers
  'fertilizer': 'खत',
  'urea': 'युरिया',
  'dap': 'डीएपी',
  'npk': 'एनपीके खत',
  'potash': 'पोटॅश',
  'super phosphate': 'सुपर फॉस्फेट',
  'bio fertilizer': 'जैविक खत',
  'organic fertilizer': 'सेंद्रिय खत',

  // Pesticides & Chemicals
  'pesticide': 'कीटकनाशक',
  'herbicide': 'तणनाशक',
  'fungicide': 'बुरशीनाशक',
  'insecticide': 'कीटकनाशक',
  'medicine': 'औषध',
  'spraying medicine': 'औषध फवारणी',

  // Seeds
  'seeds': 'बियाणे',
  'cotton seeds': 'कापूस बियाणे',
  'wheat seeds': 'गहू बियाणे',
  'soybean seeds': 'सोयाबीन बियाणे',
  'maize seeds': 'मका बियाणे',

  // Equipment
  'spray pump': 'फवारणी पंप',
  'drip pipe': 'ठिबक पाइप',
  'spraying machine': 'औषध फवारणी मशीन',
  'pvc pipe': 'पीव्हीसी पाइप',
  'motor': 'मोटार'
};

export const getMarathiTranslation = (englishName) => {
  if (!englishName) return '';
  const lowerName = englishName.toLowerCase().trim();
  
  // Check for exact matches
  if (PRODUCT_NAME_MAPPING[lowerName]) {
    return PRODUCT_NAME_MAPPING[lowerName];
  }

  // Check for partial matches (e.g. "Urea Fertilizer" should contain "urea" or "fertilizer")
  // Priority to the first match found in the order of the mapping
  for (const [key, value] of Object.entries(PRODUCT_NAME_MAPPING)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }

  return '';
};
