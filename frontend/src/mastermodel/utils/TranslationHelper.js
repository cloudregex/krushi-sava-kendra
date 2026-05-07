import api from '../../adminauth/utils/api';

// Smart Agricultural Dictionary
export const PRODUCT_NAME_MAPPING = {
  'fertilizer': 'खत',
  'urea': 'युरिया',
  'dap': 'डीएपी',
  'npk': 'एनपीके',
  'pesticide': 'कीटकनाशक',
  'seeds': 'बियाणे',
  'cotton': 'कापूस',
  'soybean': 'सोयाबीन'
};

// 1. Live Google Transliteration API (For 100% Accuracy)
export const getMarathiTranslationAsync = async (text) => {
  if (!text || !text.trim()) return '';
  
  try {
    // Priority: Dictionary check for specific terms
    const words = text.toLowerCase().split(/\s+/);
    if (words.length === 1 && PRODUCT_NAME_MAPPING[words[0]]) {
      return PRODUCT_NAME_MAPPING[words[0]];
    }

    // Call backend proxy for Google Input Tools Transliteration API to avoid CORS
    const response = await api.get(`/translate?text=${encodeURIComponent(text)}`);
    const data = response.data;
    
    if (data && data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
      return data[1][0][1][0];
    }
    
    return getMarathiTranslation(text); // Fallback to local
  } catch (error) {
    console.error('Transliteration API Error:', error);
    return getMarathiTranslation(text); // Fallback to local
  }
};


// 2. Local Phonetic Fallback (Order matters: longer rules first)
const PHONETIC_RULES = [
  { eng: 'shre', mar: 'श्रे' }, { eng: 'shri', mar: 'श्री' },
  { eng: 'mhi', mar: 'म्ही' }, { eng: 'lya', mar: 'ल्या' },
  { eng: 'rya', mar: 'ऱ्या' }, { eng: 'tra', mar: 'त्र' },
  { eng: 'kru', mar: 'कृ' }, { eng: 'pra', mar: 'प्र' },
  { eng: 'gra', mar: 'ग्र' }, { eng: 'dra', mar: 'द्र' },
  { eng: 'bra', mar: 'ब्र' }, { eng: 'chh', mar: 'छ' },
  { eng: 'ng', mar: 'ंग' }, { eng: 'nk', mar: 'ंक' },
  { eng: 'nd', mar: 'ंद' }, { eng: 'nt', mar: 'ंत' },
  { eng: 'mb', mar: 'ंब' }, { eng: 'mp', mar: 'ंप' },
  { eng: 'bh', mar: 'भ' }, { eng: 'ch', mar: 'च' },
  { eng: 'dh', mar: 'ध' }, { eng: 'gh', mar: 'घ' },
  { eng: 'kh', mar: 'ख' }, { eng: 'ph', mar: 'फ' },
  { eng: 'sh', mar: 'श' }, { eng: 'th', mar: 'थ' },
  { eng: 'jh', mar: 'झ' }, { eng: 'ee', mar: 'ी' },
  { eng: 'oo', mar: 'ू' }, { eng: 'ai', mar: 'ै' },
  { eng: 'au', mar: 'ौ' }, { eng: 'aa', mar: 'ा' },
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
    if (i + 2 < lowerWord.length) {
      const threeChar = lowerWord.substring(i, i + 3);
      const rule = PHONETIC_RULES.find(r => r.eng === threeChar);
      if (rule) { result += rule.mar; i += 3; matched = true; }
    }
    if (!matched && i + 1 < lowerWord.length) {
      const twoChar = lowerWord.substring(i, i + 2);
      const rule = PHONETIC_RULES.find(r => r.eng === twoChar);
      if (rule) { result += rule.mar; i += 2; matched = true; }
    }
    if (!matched) {
      const oneChar = lowerWord.substring(i, i + 1);
      const rule = PHONETIC_RULES.find(r => r.eng === oneChar);
      if (rule) {
        if (i === 0 && oneChar === 'a') result += 'अ';
        else if (oneChar === 'i' && i === lowerWord.length - 1) result += 'ी';
        else result += rule.mar;
      } else result += oneChar;
      i += 1;
    }
  }
  return result;
};

export const getMarathiTranslation = (text) => {
  if (!text) return '';
  const cleanText = text.replace(/\s+/g, ' ');
  const words = cleanText.split(' ');
  const translatedWords = words.map(word => {
    const lowerWord = word.toLowerCase().trim();
    if (!lowerWord) return '';
    if (PRODUCT_NAME_MAPPING[lowerWord]) return PRODUCT_NAME_MAPPING[lowerWord];
    return phoneticTransliterate(word);
  });
  return translatedWords.join(' ');
};
