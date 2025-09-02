// Script to generate comprehensive timezone data from moment-timezone JSON
import { readFileSync, writeFileSync } from 'fs';

interface MomentCountry {
  name: string;
  abbr: string;
  zones: string[];
}

interface MomentZone {
  name: string;
  lat: number;
  long: number;
  countries: string[];
  comments: string;
}

interface MomentData {
  countries: Record<string, MomentCountry>;
  zones: Record<string, MomentZone>;
}

interface TimezoneData {
  id: string;
  city: string;
  region: string;
  country: string;
  searchTerms: string[];
  displayName: string;
}

// US state abbreviations mapping and comprehensive state list
const US_STATES: Record<string, string> = {
  'New_York': 'NY', 'Detroit': 'MI', 'Louisville': 'KY', 'Monticello': 'KY',
  'Indianapolis': 'IN', 'Vincennes': 'IN', 'Winamac': 'IN', 'Marengo': 'IN',
  'Petersburg': 'IN', 'Vevay': 'IN', 'Chicago': 'IL', 'Tell_City': 'IN',
  'Knox': 'IN', 'Menominee': 'MI', 'Center': 'ND', 'New_Salem': 'ND',
  'Beulah': 'ND', 'Denver': 'CO', 'Boise': 'ID', 'Phoenix': 'AZ',
  'Los_Angeles': 'CA', 'Anchorage': 'AK', 'Juneau': 'AK', 'Sitka': 'AK',
  'Metlakatla': 'AK', 'Yakutat': 'AK', 'Nome': 'AK', 'Adak': 'AK',
  'Honolulu': 'HI'
};

// All US states and territories for comprehensive search
const ALL_US_STATES = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
  'DC': 'District of Columbia', 'PR': 'Puerto Rico', 'VI': 'US Virgin Islands', 'GU': 'Guam'
};

// Timezone mapping for states that don't have specific cities in IANA data
const STATE_TIMEZONE_MAPPING: Record<string, string> = {
  'Alabama': 'America/Chicago', 'Arkansas': 'America/Chicago', 'Connecticut': 'America/New_York',
  'Delaware': 'America/New_York', 'Florida': 'America/New_York', 'Georgia': 'America/New_York',
  'Iowa': 'America/Chicago', 'Kansas': 'America/Chicago', 'Louisiana': 'America/Chicago',
  'Maine': 'America/New_York', 'Maryland': 'America/New_York', 'Massachusetts': 'America/New_York',
  'Minnesota': 'America/Chicago', 'Mississippi': 'America/Chicago', 'Missouri': 'America/Chicago',
  'Montana': 'America/Denver', 'Nebraska': 'America/Chicago', 'Nevada': 'America/Los_Angeles',
  'New Hampshire': 'America/New_York', 'New Jersey': 'America/New_York', 'New Mexico': 'America/Denver',
  'North Carolina': 'America/New_York', 'Ohio': 'America/New_York', 'Oklahoma': 'America/Chicago',
  'Oregon': 'America/Los_Angeles', 'Pennsylvania': 'America/New_York', 'Rhode Island': 'America/New_York',
  'South Carolina': 'America/New_York', 'South Dakota': 'America/Chicago', 'Tennessee': 'America/Chicago',
  'Utah': 'America/Denver', 'Vermont': 'America/New_York', 'Virginia': 'America/New_York',
  'Washington': 'America/Los_Angeles', 'West Virginia': 'America/New_York', 'Wisconsin': 'America/Chicago',
  'Wyoming': 'America/Denver'
};

// Canadian province abbreviations
const CA_PROVINCES: Record<string, string> = {
  'St_Johns': 'NL', 'Halifax': 'NS', 'Glace_Bay': 'NS', 'Moncton': 'NB',
  'Goose_Bay': 'NL', 'Blanc-Sablon': 'QC', 'Toronto': 'ON', 'Nipigon': 'ON',
  'Thunder_Bay': 'ON', 'Iqaluit': 'NU', 'Pangnirtung': 'NU', 'Atikokan': 'ON',
  'Winnipeg': 'MB', 'Rainy_River': 'ON', 'Resolute': 'NU', 'Rankin_Inlet': 'NU',
  'Regina': 'SK', 'Swift_Current': 'SK', 'Edmonton': 'AB', 'Cambridge_Bay': 'NU',
  'Yellowknife': 'NT', 'Inuvik': 'NT', 'Creston': 'BC', 'Dawson_Creek': 'BC',
  'Fort_Nelson': 'BC', 'Vancouver': 'BC', 'Whitehorse': 'YT', 'Dawson': 'YT'
};

// All Canadian provinces and territories for comprehensive search
const ALL_CA_PROVINCES = {
  'AB': 'Alberta', 'BC': 'British Columbia', 'MB': 'Manitoba', 'NB': 'New Brunswick',
  'NL': 'Newfoundland and Labrador', 'NS': 'Nova Scotia', 'ON': 'Ontario', 'PE': 'Prince Edward Island',
  'QC': 'Quebec', 'SK': 'Saskatchewan', 'NT': 'Northwest Territories', 'NU': 'Nunavut', 'YT': 'Yukon'
};

// Timezone mapping for provinces that don't have specific cities
const PROVINCE_TIMEZONE_MAPPING: Record<string, string> = {
  'Prince Edward Island': 'America/Halifax'
};

// Major cities mapping for better display names
const CITY_NAMES: Record<string, { city: string; searchTerms: string[] }> = {
  // US Major Cities
  'America/New_York': { city: 'New York', searchTerms: ['new york', 'ny', 'nyc', 'manhattan', 'brooklyn', 'eastern', 'est', 'edt'] },
  'America/Chicago': { city: 'Chicago', searchTerms: ['chicago', 'illinois', 'il', 'central', 'cst', 'cdt'] },
  'America/Denver': { city: 'Denver', searchTerms: ['denver', 'colorado', 'co', 'mountain', 'mst', 'mdt'] },
  'America/Los_Angeles': { city: 'Los Angeles', searchTerms: ['los angeles', 'california', 'ca', 'la', 'pacific', 'pst', 'pdt'] },
  'America/Phoenix': { city: 'Phoenix', searchTerms: ['phoenix', 'arizona', 'az', 'mountain'] },
  'America/Anchorage': { city: 'Anchorage', searchTerms: ['anchorage', 'alaska', 'ak'] },
  'Pacific/Honolulu': { city: 'Honolulu', searchTerms: ['honolulu', 'hawaii', 'hi'] },
  
  // Canada Major Cities
  'America/Toronto': { city: 'Toronto', searchTerms: ['toronto', 'ontario', 'on', 'canada', 'eastern'] },
  'America/Vancouver': { city: 'Vancouver', searchTerms: ['vancouver', 'british columbia', 'bc', 'canada', 'pacific'] },
  'America/Montreal': { city: 'Montreal', searchTerms: ['montreal', 'quebec', 'qc', 'canada', 'eastern'] },
  'America/Edmonton': { city: 'Edmonton', searchTerms: ['edmonton', 'alberta', 'ab', 'canada', 'mountain'] },
  'America/Halifax': { city: 'Halifax', searchTerms: ['halifax', 'nova scotia', 'ns', 'canada', 'atlantic'] },
  'America/Winnipeg': { city: 'Winnipeg', searchTerms: ['winnipeg', 'manitoba', 'mb', 'canada', 'central'] },
  
  // Europe Major Cities
  'Europe/London': { city: 'London', searchTerms: ['london', 'england', 'uk', 'britain', 'gmt', 'bst'] },
  'Europe/Paris': { city: 'Paris', searchTerms: ['paris', 'france', 'cet', 'cest'] },
  'Europe/Berlin': { city: 'Berlin', searchTerms: ['berlin', 'germany', 'deutschland', 'cet', 'cest'] },
  'Europe/Madrid': { city: 'Madrid', searchTerms: ['madrid', 'spain', 'españa', 'cet', 'cest'] },
  'Europe/Rome': { city: 'Rome', searchTerms: ['rome', 'italy', 'italia', 'cet', 'cest'] },
  'Europe/Amsterdam': { city: 'Amsterdam', searchTerms: ['amsterdam', 'netherlands', 'holland', 'cet', 'cest'] },
  'Europe/Stockholm': { city: 'Stockholm', searchTerms: ['stockholm', 'sweden', 'sverige', 'cet', 'cest'] },
  'Europe/Zurich': { city: 'Zurich', searchTerms: ['zurich', 'switzerland', 'swiss', 'cet', 'cest'] },
  
  // Asia Major Cities
  'Asia/Tokyo': { city: 'Tokyo', searchTerms: ['tokyo', 'japan', 'nippon', 'jst'] },
  'Asia/Shanghai': { city: 'Shanghai', searchTerms: ['shanghai', 'china', 'beijing', 'cst'] },
  'Asia/Hong_Kong': { city: 'Hong Kong', searchTerms: ['hong kong', 'hk', 'china'] },
  'Asia/Singapore': { city: 'Singapore', searchTerms: ['singapore', 'sg'] },
  'Asia/Seoul': { city: 'Seoul', searchTerms: ['seoul', 'south korea', 'korea', 'kst'] },
  'Asia/Mumbai': { city: 'Mumbai', searchTerms: ['mumbai', 'india', 'bombay', 'ist'] },
  'Asia/Kolkata': { city: 'Delhi', searchTerms: ['delhi', 'new delhi', 'india', 'ist', 'kolkata', 'calcutta'] },
  'Asia/Dubai': { city: 'Dubai', searchTerms: ['dubai', 'uae', 'united arab emirates'] },
  
  // Australia & New Zealand
  'Australia/Sydney': { city: 'Sydney', searchTerms: ['sydney', 'australia', 'nsw', 'new south wales', 'aest', 'aedt'] },
  'Australia/Melbourne': { city: 'Melbourne', searchTerms: ['melbourne', 'australia', 'vic', 'victoria', 'aest', 'aedt'] },
  'Australia/Perth': { city: 'Perth', searchTerms: ['perth', 'australia', 'wa', 'western australia', 'awst'] },
  'Pacific/Auckland': { city: 'Auckland', searchTerms: ['auckland', 'new zealand', 'nz', 'nzst', 'nzdt'] },
};

function generateTimezones(): void {
  // Read the moment-timezone data
  const data: MomentData = JSON.parse(readFileSync('/Users/fahim/codes/projects/tz-buddy/docs/latest.json', 'utf8'));
  
  const timezones: TimezoneData[] = [];
  
  // Process each zone
  Object.entries(data.zones).forEach(([zoneId, zone]) => {
    // Skip Antarctica zones for now
    if (zoneId.startsWith('Antarctica/')) return;
    
    const countries = zone.countries.map(countryCode => data.countries[countryCode]?.name || countryCode);
    const primaryCountry = data.countries[zone.countries[0]];
    
    if (!primaryCountry) return;
    
    // Extract city name from zone ID
    const parts = zoneId.split('/');
    let cityPart = parts[parts.length - 1];
    
    // Handle special cases like America/Kentucky/Louisville
    if (parts.length > 2) {
      cityPart = parts[parts.length - 1];
    }
    
    // Clean up city name
    let cityName = cityPart.replace(/_/g, ' ');
    let region = '';
    let country = primaryCountry.name;
    let searchTerms: string[] = [];
    
    // Use predefined city data if available
    if (CITY_NAMES[zoneId]) {
      const cityData = CITY_NAMES[zoneId];
      cityName = cityData.city;
      searchTerms = [...cityData.searchTerms];
    }
    
    // Parse comments for additional region info and search terms
    let commentsRegion = '';
    let commentsSearchTerms: string[] = [];
    
    if (zone.comments) {
      // Parse comments like "Atlantic - New Brunswick", "Mountain - Alberta, east Saskatchewan", etc.
      const commentParts = zone.comments.split(' - ');
      if (commentParts.length > 1) {
        // First part might be timezone name, second part is region
        commentsRegion = commentParts[1].trim();
        commentsSearchTerms.push(commentsRegion.toLowerCase());
        
        // Split on commas and other separators for multiple regions
        const regions = commentsRegion.split(/[,;]/).map(r => r.trim());
        regions.forEach(region => {
          commentsSearchTerms.push(region.toLowerCase());
          // Add variations (e.g., "New Brunswick" -> "nb", "new brunswick")
          if (region.includes(' ')) {
            commentsSearchTerms.push(region.replace(/\s+/g, '').toLowerCase());
          }
        });
        
        // Add timezone abbreviation from first part if it looks like one
        if (commentParts[0].length <= 4 && commentParts[0].match(/^[A-Z]{2,4}$/)) {
          commentsSearchTerms.push(commentParts[0].toLowerCase());
        }
      } else {
        // Single comment, use as region
        commentsRegion = zone.comments;
        commentsSearchTerms.push(zone.comments.toLowerCase());
      }
    }

    // Determine region based on country and zone
    if (primaryCountry.abbr === 'US') {
      // US zones
      const stateName = US_STATES[cityPart] || 'US';
      region = stateName;
      country = 'US';
      
      // Add US-specific search terms
      searchTerms.push(
        cityName.toLowerCase(),
        stateName.toLowerCase(),
        'usa',
        'united states',
        'america'
      );
      
      // Add timezone abbreviations
      if (zoneId.includes('New_York') || zoneId.includes('Detroit')) {
        searchTerms.push('eastern', 'est', 'edt');
      } else if (zoneId.includes('Chicago')) {
        searchTerms.push('central', 'cst', 'cdt');
      } else if (zoneId.includes('Denver')) {
        searchTerms.push('mountain', 'mst', 'mdt');
      } else if (zoneId.includes('Los_Angeles')) {
        searchTerms.push('pacific', 'pst', 'pdt');
      }
      
      // Keep state abbreviation for US, don't use comments for display
      
    } else if (primaryCountry.abbr === 'CA') {
      // Canadian zones
      const provinceName = CA_PROVINCES[cityPart] || 'CA';
      region = provinceName;
      country = 'Canada';
      
      searchTerms.push(
        cityName.toLowerCase(),
        provinceName.toLowerCase(),
        'canada'
      );
      
      // Keep province abbreviation for Canada, don't use comments for display
      
    } else {
      // International zones
      region = commentsRegion || primaryCountry.name;
      searchTerms.push(
        cityName.toLowerCase(),
        primaryCountry.name.toLowerCase(),
        primaryCountry.abbr.toLowerCase()
      );
    }
    
    // Add all comments-derived search terms
    searchTerms.push(...commentsSearchTerms);
    
    // Create display name
    let displayName: string;
    if (primaryCountry.abbr === 'US') {
      displayName = `${cityName}, ${region}`;
    } else if (primaryCountry.abbr === 'CA') {
      displayName = `${cityName}, ${region}`;
    } else {
      displayName = `${cityName}, ${country}`;
    }
    
    // Add to list
    timezones.push({
      id: zoneId,
      city: cityName,
      region,
      country,
      searchTerms: [...new Set(searchTerms)], // Remove duplicates
      displayName
    });
  });
  
  // Add missing US states that don't have specific IANA zones
  Object.entries(ALL_US_STATES).forEach(([abbr, stateName]) => {
    // Check if this state is already covered by existing zones
    const existingState = timezones.find(tz => 
      tz.country === 'US' && (
        tz.region === abbr || 
        tz.searchTerms.includes(stateName.toLowerCase()) ||
        tz.displayName.includes(stateName)
      )
    );
    
    if (!existingState && STATE_TIMEZONE_MAPPING[stateName]) {
      timezones.push({
        id: STATE_TIMEZONE_MAPPING[stateName],
        city: stateName,
        region: abbr,
        country: 'US',
        searchTerms: [
          stateName.toLowerCase(),
          abbr.toLowerCase(),
          'usa',
          'united states',
          'america',
          // Add timezone abbreviations based on mapping
          ...(STATE_TIMEZONE_MAPPING[stateName].includes('New_York') ? ['eastern', 'est', 'edt'] : []),
          ...(STATE_TIMEZONE_MAPPING[stateName].includes('Chicago') ? ['central', 'cst', 'cdt'] : []),
          ...(STATE_TIMEZONE_MAPPING[stateName].includes('Denver') ? ['mountain', 'mst', 'mdt'] : []),
          ...(STATE_TIMEZONE_MAPPING[stateName].includes('Los_Angeles') ? ['pacific', 'pst', 'pdt'] : [])
        ],
        displayName: `${stateName}, ${abbr}`
      });
    }
  });

  // Add missing Canadian provinces that don't have specific IANA zones  
  Object.entries(ALL_CA_PROVINCES).forEach(([abbr, provinceName]) => {
    // Check if this province is already covered
    const existingProvince = timezones.find(tz => 
      tz.country === 'Canada' && (
        tz.region === abbr || 
        tz.searchTerms.includes(provinceName.toLowerCase()) ||
        tz.displayName.includes(provinceName)
      )
    );
    
    if (!existingProvince && PROVINCE_TIMEZONE_MAPPING[provinceName]) {
      timezones.push({
        id: PROVINCE_TIMEZONE_MAPPING[provinceName],
        city: provinceName,
        region: abbr,
        country: 'Canada',
        searchTerms: [
          provinceName.toLowerCase(),
          abbr.toLowerCase(),
          'canada',
          // Add common variations
          ...(provinceName === 'Prince Edward Island' ? ['pei', 'prince edward island'] : [])
        ],
        displayName: `${provinceName}, ${abbr}`
      });
    }
  });

  // Sort by display name
  timezones.sort((a, b) => a.displayName.localeCompare(b.displayName));
  
  // Write to TypeScript file
  const output = `// Comprehensive timezone data generated from moment-timezone
export interface TimezoneData {
  id: string; // IANA timezone ID
  city: string; // Primary city name
  region: string; // State/Province/Country
  country: string; // Country code or name
  searchTerms: string[]; // Terms to search by
  displayName: string; // How to show it to user
}

export const TIMEZONE_DATA: TimezoneData[] = ${JSON.stringify(timezones, null, 2)};

// Helper function to search timezones
export function searchTimezones(query: string): TimezoneData[] {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return TIMEZONE_DATA.slice(0, 50); // Return first 50 if no query

  const results = TIMEZONE_DATA.filter(tz => 
    tz.searchTerms.some(term => term.includes(searchTerm)) ||
    tz.city.toLowerCase().includes(searchTerm) ||
    tz.region.toLowerCase().includes(searchTerm) ||
    tz.country.toLowerCase().includes(searchTerm) ||
    tz.displayName.toLowerCase().includes(searchTerm)
  );

  // Sort by relevance - exact matches first, then partial matches
  return results.sort((a, b) => {
    const aExact = a.searchTerms.some(term => term === searchTerm) || 
                   a.city.toLowerCase() === searchTerm ||
                   a.region.toLowerCase() === searchTerm;
    const bExact = b.searchTerms.some(term => term === searchTerm) ||
                   b.city.toLowerCase() === searchTerm ||
                   b.region.toLowerCase() === searchTerm;
    
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    return a.displayName.localeCompare(b.displayName);
  }).slice(0, 20); // Limit to 20 results
}

// Get unique timezone options (removes duplicates for same timezone ID)
export function getUniqueTimezones(): TimezoneData[] {
  const seen = new Set<string>();
  return TIMEZONE_DATA.filter(tz => {
    if (seen.has(tz.id)) return false;
    seen.add(tz.id);
    return true;
  });
}
`;
  
  writeFileSync('/Users/fahim/codes/projects/tz-buddy/src/timezones.ts', output);
  console.log(`Generated ${timezones.length} timezone entries`);
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTimezones();
}

export { generateTimezones };