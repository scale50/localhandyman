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

const territoryMap = {
    'BC': {
        'langley': ['V3A', 'V2Y', 'V2Z', 'V1M', 'V4W'],
        'surrey': ['V3S', 'V3T', 'V3V', 'V3W', 'V3X', 'V4A', 'V4B', 'V4C', 'V4D', 'V4E'],
        'kelowna': ['V1Z', 'V1Y', 'V1X', 'V1W', 'V4V', 'V4T'],
        'regina': ['S4L', 'S4N', 'S4P', 'S4R', 'S4S', 'S4T', 'S4V', 'S4W', 'S4Y', 'S4Z', 'S0G'],
        'saskatoon': ['S7P', 'S7T', 'S7H', 'S7J', 'S7K', 'S7L', 'S7M', 'S7N', 'S7R', 'S7S', 'S7V', 'S7W'],
        'calgary-airdre': ['T4A', 'T4B', 'T3S', 'T3R', 'T3P', 'T3N', 'T3M', 'T3L', 'T3K', 'T3J', 'T3H', 'T3G', 'T3E', 'T3C', 'T3B', 'T3A', 'T2Z', 'T2Y', 'T2X', 'T2V', 'T2T', 'T2S', 'T2R', 'T2P', 'T2N', 'T2M', 'T2L', 'T2H', 'T2G', 'T2E', 'T2C', 'T2B', 'T2A', 'T1Y', 'T1X', 'T2W'],
        'calgary-east': ['T2A', 'T2B', 'T2C', 'T3S', 'T1X'],
        'lethbridge': ['T1K', 'T1J', 'T1H', 'T0L'],
        'neworleans': ['V2Y', 'V2Z', 'V3A', 'V4W'],
        'vancouver-central': ['V5K', 'V5Y', 'V5W', 'V5V', 'V59'],
        'northshore-vancouver': ['V7W', 'V7V', 'V7T', 'V7P', 'V7M', 'V7R', 'V7N', 'V7K'],
        'tri-cities': ['V3J', 'V3K', 'V2X', 'V3Y', 'V3B', 'V3E', 'V3C', 'V3H', 'V2W', 'V4R', 'V4S'],
        'whiterock': ['V4A', 'V4P', 'V3X', 'V4B', 'V3Z'],
        'grande-prairie': ['T8X', 'T8W', 'T8V'],
        'niagara': ['L0S', 'L2A', 'L2E', 'L2G', 'L2H', 'L2M', 'L2N', 'L2P', 'L2R', 'L2S', 'L2T', 'L2V', 'L3K', 'L3C'],
        'oakville': ['L6K', 'L6H', 'L6L', 'L6M'],
        '
        // ... rest of territory mappings
    },
    // ... other provinces
};

const urlMap = {
     'langley': 'https://app.localhandymangroup.com/langley-ojoy',
    'surrey': 'https://app.localhandymangroup.com/surrey',
    'kelowna': 'https://app.localhandymangroup.com/kelowna',
    'regina': 'https://app.localhandymangroup.com/regina',
    'saskatoon': 'https://app.localhandymangroup.com/saskatoon',
    'calgary-airdre': 'https://app.localhandymangroup.com/calgary-airdre',
    'calgary-east': 'https://app.localhandymangroup.com/calgary-east',
    'lethbridge': 'https://app.localhandymangroup.com/lethbridge',
    'neworleans': 'https://app.localhandymangroup.com/neworleans',
    'vancouver-central': 'https://app.localhandymangroup.com/vancouver-central',
    'northshore-vancouver': 'https://app.localhandymangroup.com/northshore-vancouver',
    'tri-cities': 'https://app.localhandymangroup.com/tri-cities',
    'whiterock': 'https://app.localhandymangroup.com/whiterock',
    'grande-prairie': 'https://app.localhandymangroup.com/grande-prairie',
    'niagara': 'https://app.localhandymangroup.com/niagara',
    'oakville': 'https://app.localhandymangroup.com/oakville',
    'default': 'https://app.localhandymangroup.com/default-location'
};

// Functions
function cleanPostalCode(input) {
    return input.replace(/[\s-]/g, '').toUpperCase().substring(0, 3);
}

function getProvince(fsa) {
    return provinceMap[fsa[0]];
}

function findLocation(fsa) {
    console.log('FSA being looked up:', fsa);
    console.log('Territory Map:', territoryMap);
    
    const fsaPattern = /^[ABCEGHJKLMNPRSTVWXYZ][0-9][ABCEGHJKLMNPRSTVWXYZ]$/i;
    if (!fsaPattern.test(fsa)) {
        console.log('FSA failed pattern test');
        return urlMap.default;
    }
    
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

function handleSearch() {
  console.log('Button clicked');
    const rawInput = document.getElementById('fsaInput').value;
    console.log('Input value:', rawInput);
    const fsa = cleanPostalCode(rawInput);
    console.log('Cleaned FSA:', fsa);
    const url = findLocation(fsa);
    console.log('Redirect URL:', url);
    window.location.href = url;
}
