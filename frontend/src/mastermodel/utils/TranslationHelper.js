// Smart Agricultural Dictionary
export const PRODUCT_NAME_MAPPING = {
  // --- Agricultural Terms (Primary) ---
  'fertilizer': 'खत',
  'urea': 'युरिया',
  'dap': 'डीएपी',
  'npk': 'एनपीके',
  'potash': 'पोटॅश',
  'super': 'सुपर',
  'phosphate': 'फॉस्फेट',
  'bio': 'जैविक',
  'organic': 'सेंद्रिय',
  'pesticide': 'कीटकनाशक',
  'pesticides': 'कीटकनाशक',
  'herbicide': 'तणनाशक',
  'fungicide': 'बुरशीनाशक',
  'insecticide': 'कीटकनाशक',
  'medicine': 'औषध',
  'spraying': 'फवारणी',
  'seeds': 'बियाणे',
  'seed': 'बियाणे',
  'cotton': 'कापूस',
  'wheat': 'गहू',
  'soybean': 'सोयाबीन',
  'maize': 'मका',
  'tur': 'तूर',
  'gram': 'हरभरा',
  'spray': 'फवारणी',
  'pump': 'पंप',
  'pipe': 'पाइप',
  'drip': 'ठिबक',
  'pvc': 'पीव्हीसी',
  'motor': 'मोटार',
  'machine': 'मशीन',

  // --- Common Names & Surnames (Accuracy Fixes) ---
  'shevde': 'शेवडे',
  'shevade': 'शेवडे',
  'patil': 'पाटील',
  'tejas': 'तेजस',
  'balaji': 'बालाजी',
  'ganesh': 'गणेश',
  'vikas': 'विकास',
  'shinde': 'शिंदे',
  'jadhav': 'जाधव',
  'kulkarni': 'कुलकर्णी',
  'deshmukh': 'देशमुख',
  'gaikwad': 'गायकवाड',
  'pawar': 'पवार',
  'more': 'मोरे',
  'chavan': 'चव्हाण',
  'ghatge': 'घाटगे',
  'bhonde': 'भोंडे',
  'wade': 'वाडे',
  'kadam': 'कदम',
  'kale': 'काळे',
  'thorat': 'थोरात',
  'salunkhe': 'साळुंखे',
  'mankar': 'मानकर',
  'shelke': 'शेळके',
  'bhagat': 'भगत',
  'deshpande': 'देशपांडे',
  'joshi': 'जोशी',
  'kulkarni': 'कुलकर्णी',
  'phadke': 'फडके',
  'apate': 'आपटे',
  'sawant': 'सावंत',
  'mane': 'माने',
  'dhage': 'धागे',
  'khot': 'खोत',
  'raut': 'राऊत',
  'patre': 'पात्रे',
  'nikam': 'निकम',
  'shaikh': 'शेख',
  'mulani': 'मुलाणी',
  'tamboli': 'तांबोळी'
};

// Phonetic Transliteration Rules (Advanced Priority)
const PHONETIC_RULES = [
  // 4-character rules (Specific common combinations)
  { eng: 'shre', mar: 'श्रे' },
  { eng: 'shri', mar: 'श्री' },
  
  // 3-character rules
  { eng: 'mhi', mar: 'म्ही' },
  { eng: 'lya', mar: 'ल्या' },
  { eng: 'rya', mar: 'ऱ्या' },
  { eng: 'tra', mar: 'त्र' },
  { eng: 'kru', mar: 'कृ' },
  { eng: 'pra', mar: 'प्र' },
  { eng: 'gra', mar: 'ग्र' },
  { eng: 'dra', mar: 'द्र' },
  { eng: 'bra', mar: 'ब्र' },
  { eng: 'chh', mar: 'छ' },
  { eng: 'ngi', mar: 'ंगी' },
  { eng: 'nga', mar: 'ंगा' },
  
  // 2-character rules
  { eng: 'ng', mar: 'ंग' },
  { eng: 'nk', mar: 'ंक' },
  { eng: 'nd', mar: 'ंद' },
  { eng: 'nt', mar: 'ंत' },
  { eng: 'mb', mar: 'ंब' },
  { eng: 'mp', mar: 'ंप' },
  { eng: 'nj', mar: 'ंज' },
  { eng: 'bh', mar: 'भ' },
  { eng: 'ch', mar: 'च' },
  { eng: 'dh', mar: 'ध' },
  { eng: 'gh', mar: 'घ' },
  { eng: 'kh', mar: 'ख' },
  { eng: 'ph', mar: 'फ' },
  { eng: 'sh', mar: 'श' },
  { eng: 'th', mar: 'थ' },
  { eng: 'jh', mar: 'झ' },
  { eng: 'zh', mar: 'झ' },
  { eng: 'ee', mar: 'ी' },
  { eng: 'oo', mar: 'ू' },
  { eng: 'ai', mar: 'ै' },
  { eng: 'au', mar: 'ौ' },
  { eng: 'aa', mar: 'ा' },
  { eng: 'kt', mar: 'क्त' },
  { eng: 'pt', mar: 'प्त' },
  { eng: 'st', mar: 'स्त' },
  { eng: 'rt', mar: 'र्त' },
  { eng: 'ti', mar: 'टी' }, // Common for 'ti' as 'टी'
  { eng: 'di', mar: 'डी' }, // Common for 'di' as 'डी'
  { eng: 'de', mar: 'डे' }, // Common for names ending in 'de' like 'Shevde'
  
  // 1-character rules
  { eng: 'b', mar: 'ब' }, { eng: 'c', mar: 'क' }, { eng: 'd', mar: 'द' },
  { eng: 'f', mar: 'फ' }, { eng: 'g', mar: 'ग' }, { eng: 'h', mar: 'ह' },
  { eng: 'j', mar: 'ज' }, { eng: 'k', mar: 'क' }, { eng: 'l', mar: 'ल' },
  { eng: 'm', mar: 'म' }, { eng: 'n', mar: 'न' }, { eng: 'p', mar: 'प' },
  { eng: 'r', mar: 'र' }, { eng: 's', mar: 'स' }, { eng: 't', mar: 'त' },
  { eng: 'v', mar: 'व' }, { eng: 'w', mar: 'व' }, { eng: 'y', mar: 'य' },
  { eng: 'z', mar: 'झ' }, { eng: 'a', mar: 'ा' }, { eng: 'e', mar: 'े' },
  { eng: 'i', mar: 'ि' }, { eng: 'o', mar: 'ो' }, { eng: 'u', mar: 'ु' }
];

const phoneticTransliterate = (word) => {
  if (!word) return '';
  let result = '';
  let i = 0;
  const lowerWord = word.toLowerCase();

  while (i < lowerWord.length) {
    let matched = false;

    // Check for 3-character rules
    if (i + 2 < lowerWord.length) {
      const threeChar = lowerWord.substring(i, i + 3);
      const rule = PHONETIC_RULES.find(r => r.eng === threeChar);
      if (rule) {
        result += rule.mar;
        i += 3;
        matched = true;
      }
    }

    // Check for 2-character rules
    if (!matched && i + 1 < lowerWord.length) {
      const twoChar = lowerWord.substring(i, i + 2);
      const rule = PHONETIC_RULES.find(r => r.eng === twoChar);
      if (rule) {
        result += rule.mar;
        i += 2;
        matched = true;
      }
    }

    // Check for 1-character rules
    if (!matched) {
      const oneChar = lowerWord.substring(i, i + 1);
      const rule = PHONETIC_RULES.find(r => r.eng === oneChar);
      if (rule) {
        // Special cases
        if (i === 0 && oneChar === 'a') {
          result += 'अ';
        } else if (oneChar === 'i' && i === lowerWord.length - 1) {
          result += 'ी';
        } else {
          result += rule.mar;
        }
      } else {
        result += oneChar;
      }
      i += 1;
    }
  }

  return result;
};

// Advanced Transliteration Logic (Proper & Accurate)
const transliterateToMarathi = (text) => {
  if (!text) return '';
  
  // Clean up multiple spaces
  const cleanText = text.replace(/\s+/g, ' ');
  const words = cleanText.split(' ');
  
  const translatedWords = words.map(word => {
    const lowerWord = word.toLowerCase().trim();
    if (!lowerWord) return '';

    // Priority 1: Exact Dictionary Match
    if (PRODUCT_NAME_MAPPING[lowerWord]) {
      return PRODUCT_NAME_MAPPING[lowerWord];
    }

    // Priority 2: Smart Phonetic Transliteration
    return phoneticTransliterate(word);
  });
  
  return translatedWords.join(' ');
};

export const getMarathiTranslation = (englishName) => {
  return transliterateToMarathi(englishName);
};
