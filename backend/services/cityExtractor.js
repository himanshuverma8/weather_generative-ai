// Mapping of districts and areas to their parent cities
const districtMap = {
  // Tokyo districts (English)
  'shibuya': 'Tokyo',
  'shinjuku': 'Tokyo',
  'harajuku': 'Tokyo',
  'akihabara': 'Tokyo',
  'ginza': 'Tokyo',
  'roppongi': 'Tokyo',
  'ikebukuro': 'Tokyo',
  'asakusa': 'Tokyo',
  'ueno': 'Tokyo',
  'omotesando': 'Tokyo',
  'aoyama': 'Tokyo',
  'ebisu': 'Tokyo',
  'daikanyama': 'Tokyo',
  'meguro': 'Tokyo',
  'setagaya': 'Tokyo',
  'shibuya-ku': 'Tokyo',
  'shinjuku-ku': 'Tokyo',
  
  // Tokyo districts (Japanese)
  '渋谷': 'Tokyo',
  '新宿': 'Tokyo',
  '原宿': 'Tokyo',
  '秋葉原': 'Tokyo',
  '銀座': 'Tokyo',
  '六本木': 'Tokyo',
  '池袋': 'Tokyo',
  '浅草': 'Tokyo',
  '上野': 'Tokyo',
  '表参道': 'Tokyo',
  '青山': 'Tokyo',
  '恵比寿': 'Tokyo',
  '代官山': 'Tokyo',
  '目黒': 'Tokyo',
  '世田谷': 'Tokyo',
  
  // Osaka districts
  'namba': 'Osaka',
  'dotonbori': 'Osaka',
  'shinsaibashi': 'Osaka',
  'umeda': 'Osaka',
  'tennoji': 'Osaka',
  '難波': 'Osaka',
  '道頓堀': 'Osaka',
  '心斎橋': 'Osaka',
  '梅田': 'Osaka',
  '天王寺': 'Osaka',
  
  // Kyoto districts
  'gion': 'Kyoto',
  'arashiyama': 'Kyoto',
  'fushimi': 'Kyoto',
  '祇園': 'Kyoto',
  '嵐山': 'Kyoto',
  '伏見': 'Kyoto',
};

// Japanese city names mapping
const japaneseCityMap = {
  '東京': 'Tokyo',
  '大阪': 'Osaka',
  '京都': 'Kyoto',
  '横浜': 'Yokohama',
  '札幌': 'Sapporo',
  '福岡': 'Fukuoka',
  '広島': 'Hiroshima',
  '仙台': 'Sendai',
  '名古屋': 'Nagoya',
  '神戸': 'Kobe',
  '千葉': 'Chiba',
  '埼玉': 'Saitama',
  '新潟': 'Niigata',
  '静岡': 'Shizuoka',
  '岡山': 'Okayama',
  '熊本': 'Kumamoto',
  '鹿児島': 'Kagoshima',
  '長崎': 'Nagasaki',
  '青森': 'Aomori',
  '盛岡': 'Morioka',
};

// Common city name patterns
const cityPatterns = [
  /(?:weather|天気|てんき|天候)\s*(?:for|in|at|4|の)?\s*([A-Za-zぁ-んァ-ン一-龯]+)/i,
  /([A-Za-zぁ-んァ-ン一-龯]+)(?:\s+の天気|\s+weather|\s+の天候)/i,
  /(?:in|at|for|の)\s*([A-Za-zぁ-んァ-ン一-龯]+)/i,
  // Pattern for "Weather 4 City" or "Weather for City"
  /\b(?:weather|天気)\s*(?:for|4)\s+([A-Za-zぁ-んァ-ン一-龯]+)/i,
];

export function extractCityFromMessage(message) {
  if (!message || typeof message !== 'string') {
    return null;
  }

  const trimmedMessage = message.trim();
  const lowerMessage = trimmedMessage.toLowerCase();
  
  // First, check if the entire message is a city or district name
  // Check Japanese city names
  if (japaneseCityMap[trimmedMessage]) {
    return japaneseCityMap[trimmedMessage];
  }
  
  // Check district names (both English and Japanese)
  if (districtMap[trimmedMessage]) {
    return districtMap[trimmedMessage];
  }
  
  // Check lowercase English district names
  if (districtMap[lowerMessage]) {
    return districtMap[lowerMessage];
  }
  
  // Check for district names within the message
  for (const [district, city] of Object.entries(districtMap)) {
    if (trimmedMessage.includes(district) || lowerMessage.includes(district.toLowerCase())) {
      return city;
    }
  }
  
  // Check for Japanese city names within the message
  for (const [japaneseName, englishName] of Object.entries(japaneseCityMap)) {
    if (trimmedMessage.includes(japaneseName)) {
      return englishName;
    }
  }

  // Try to extract city name using patterns
  for (const pattern of cityPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const extractedCity = match[1].trim();
      // Check if it's a known district
      const lowerCity = extractedCity.toLowerCase();
      if (districtMap[lowerCity] || districtMap[extractedCity]) {
        return districtMap[lowerCity] || districtMap[extractedCity];
      }
      // Check if it's a Japanese city name
      if (japaneseCityMap[extractedCity]) {
        return japaneseCityMap[extractedCity];
      }
      return extractedCity;
    }
  }

  // Check for common city names in the message (English)
  const commonCities = [
    'tokyo', 'osaka', 'kyoto', 'yokohama', 'sapporo',
    'fukuoka', 'hiroshima', 'sendai', 'nagoya', 'kobe',
    'chiba', 'saitama', 'niigata', 'shizuoka', 'okayama'
  ];

  for (const city of commonCities) {
    if (lowerMessage.includes(city)) {
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }

  return null;
}

export function normalizeCityName(city) {
  if (!city) return null;
  
  const trimmedCity = city.trim();
  const lowerCity = trimmedCity.toLowerCase();
  
  // Check Japanese city map first
  if (japaneseCityMap[trimmedCity]) {
    return japaneseCityMap[trimmedCity];
  }
  
  // Check district map (both exact match and lowercase)
  if (districtMap[trimmedCity]) {
    return districtMap[trimmedCity];
  }
  
  if (districtMap[lowerCity]) {
    return districtMap[lowerCity];
  }
  
  // Return original city name
  return trimmedCity;
}

