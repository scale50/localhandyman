console.log('Location finder script loaded');

// Data objects
const provinceMap = {
    'A': 'NL',
    'B': 'NS',
    'C': 'PE',
    'E': 'NB',
    'G': 'QC',
    'H': 'QC',
    'J': 'QC',
    'K': 'ON',
    'L': 'ON',
    'M': 'ON',
    'N': 'ON',
    'P': 'ON',
    'R': 'MB',
    'S': 'SK',
    'T': 'AB',
    'V': 'BC',
    'X': 'NT',  
    'Y': 'YT'
};

// Added US state map - maps first digit of ZIP code to state/region
const zipStateMap = {
    '0': 'CT_MA_ME_NH_NJ_NY_PR_RI_VT',
    '1': 'DE_NY_PA',
    '2': 'DC_MD_NC_SC_VA_WV',
    '3': 'AL_FL_GA_MS_TN',
    '4': 'IN_KY_MI_OH',
    '5': 'IA_MN_MT_ND_SD_WI',
    '6': 'IL_KS_MO_NE',
    '7': 'AR_LA_OK_TX',
    '8': 'AZ_CO_ID_NM_NV_UT_WY',
    '9': 'AK_CA_HI_OR_WA'
};

const territoryMap = {
    'BC': {
        'langley': ['V3A', 'V2Y', 'V2Z', 'V1M', 'V4W'],
        'kelowna': ['V1Z', 'V1Y', 'V1X', 'V1W', 'V4V', 'V4T', 'V1V'],
        'vancouver-central': ['V5K', 'V5Y', 'V5W', 'V5V','V59','V6T','V6S','V6N','V6R','V6L','V6K','V6P'],
        'northshore-vancouver': ['V7W', 'V7V', 'V7T', 'V7P', 'V7M', 'V7R', 'V7N', 'V7K','V7G', 'V7H','V7L','V7J','V5Y','V5W','V5V','V5P','V6G','V6E','V7X','V6C','V6Z','V6B','V5T','V6A','V5L'],
        'tri-cities': ['V3J', 'V3K', 'V2X', 'V3Y', 'V3B', 'V3E', 'V3C', 'V3H', 'V2W', 'V4R', 'V4S'],
        'whiterock': ['V4A', 'V4P', 'V3X', 'V4B', 'V3Z'],
    },
    'SK': {
        'regina': ['S4L', 'S4N', 'S4P', 'S4R', 'S4S', 'S4T', 'S4V', 'S4W', 'S4Y', 'S4Z', 'S0G', 'S4X'],
        'saskatoon': ['S7P', 'S7T', 'S7H', 'S7J', 'S7K', 'S7L', 'S7M', 'S7N', 'S7R', 'S7S', 'S7V', 'S7W'],
    },
       'AB': {
        'calgary-airdrie': ['T4A', 'T4B', 'T3S', 'T3R', 'T3P', 'T3N', 'T3M', 'T3L', 'T3K', 'T3J', 'T3H', 'T3G', 'T3E', 'T3C', 'T3B', 'T3A', 'T2Z', 'T2Y', 'T2X', 'T2V', 'T2T', 'T2S', 'T2R', 'T2P', 'T2N', 'T2M', 'T2L', 'T2H', 'T2G', 'T2E', 'T2C', 'T2B', 'T2A', 'T1Y', 'T1X', 'T2W'],
        'calgary-east': ['T2A', 'T2B', 'T2C', 'T3S', 'T1X'],
        'lethbridge': ['T1K', 'T1J', 'T1H', 'T0L', 'T0K', 'T1M', 'T1G'],
        'grande-prairie': ['T8X', 'T8W', 'T8V'],
    },
    'ON': {
        'niagara': ['L0S', 'L2A', 'L2E', 'L2G', 'L2H', 'L2M', 'L2N', 'L2P', 'L2R', 'L2S', 'L2T', 'L2V', 'L3K', 'L3C'],
        'oakville': ['L6K', 'L6H', 'L6L', 'L6M', 'L6J'],
    },
    // ... other provinces
    
    // Add US territories - example structure for when you add US locations
    'US': {
        'newyork': ['10001', '10002', '10003', '10004', '10005'],
        'losangeles': ['90001', '90002', '90003', '90004', '90005'],
        'frisco-allen': ['75033', '75034', '75035', '75002', '75013', '75023', '75025'],
        // Add more US territories as needed
    }
};

const urlMap = {
     'langley': 'https://localhandymangroup.com/langley-ojoy',
    'kelowna': 'https://localhandymangroup.com/kelowna',
    'regina': 'https://localhandymangroup.com/regina',
    'saskatoon': 'https://localhandymangroup.com/saskatoon',
    'calgary-airdrie': 'https://localhandymangroup.com/calgary-airdrie',
    'calgary-east': 'https://localhandymangroup.com/calgary-east',
    'lethbridge': 'https://localhandymangroup.com/lethbridge',
    'neworleans': 'https://localhandymangroup.com/neworleans',
    'vancouver-central': 'https://localhandymangroup.com/vancouver-central',
    'northshore-vancouver': 'https://localhandymangroup.com/northshore-vancouver',
    'tri-cities': 'https://localhandymangroup.com/tri-cities',
    'whiterock': 'https://localhandymangroup.com/whiterock',
    'grande-prairie': 'https://localhandymangroup.com/grande-prairie',
    'niagara': 'https://localhandymangroup.com/niagara',
    'oakville': 'https://localhandymangroup.com/oakville',
    'frisco-allen': 'https://localhandymangroup.com/frisco-allen',
    'default': 'https://localhandymangroup.com/default-location'
};

// Functions
function cleanPostalCode(input) {
    return input.replace(/[\s-]/g, '').toUpperCase();
}

function isCanadianPostalCode(code) {
    return /^[ABCEGHJKLMNPRSTVWXYZ][0-9][ABCEGHJKLMNPRSTVWXYZ]/.test(code);
}

function isUSZipCode(code) {
    return /^\d{5}(-\d{4})?$/.test(code);
}

function getCodeType(code) {
    if (isCanadianPostalCode(code)) return 'CA';
    if (isUSZipCode(code)) return 'US';
    return 'UNKNOWN';
}

function getProvince(fsa) {
    return provinceMap[fsa[0]];
}

function getUSState(zipCode) {
    return zipStateMap[zipCode[0]];
}

function findLocation(code) {
    console.log('Code being looked up:', code);
    
    const codeType = getCodeType(code);
    console.log('Code type detected:', codeType);
    
    if (codeType === 'CA') {
        // Process Canadian postal code
        const fsa = code.substring(0, 3);
        console.log('FSA extracted:', fsa);
        
        const province = getProvince(fsa);
        console.log('Province found:', province);
        
        if (!territoryMap[province]) {
            return urlMap.default;
        }
        
        // Find territory that contains this FSA
        const territory = Object.keys(territoryMap[province]).find(terr => 
            territoryMap[province][terr].includes(fsa)
        );
        
        console.log('Territory found:', territory);
        return urlMap[territory] || urlMap.default;
    } 
    else if (codeType === 'US') {
        // Process US ZIP code - using all 5 digits now
        const zipCode = code.substring(0, 5);
        console.log('Full ZIP code used:', zipCode);
        
        // Find territory that contains this exact ZIP code
        const territory = Object.keys(territoryMap['US'] || {}).find(terr => 
            territoryMap['US']?.[terr]?.includes(zipCode)
        );
        
        console.log('Territory found:', territory);
        return urlMap[territory] || urlMap.default;
    }
    
    // If code type is unknown or not supported
    console.log('Unknown code format');
    return urlMap.default;
}

function handleSearch() {
    console.log('Button clicked');
    const rawInput = document.getElementById('fsaInput').value;
    console.log('Input value:', rawInput);
    const cleanCode = cleanPostalCode(rawInput);
    console.log('Cleaned code:', cleanCode);
    const url = findLocation(cleanCode);
    console.log('Redirect URL:', url);
    window.location.href = url;
}
