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
        'langley-territory': ['V2Y', 'V2Z', 'V3A', 'V4W'],
        'surrey-territory': ['V3S', 'V3T', 'V3V', 'V3W', 'V3X', 'V4A', 'V4B', 'V4C', 'V4D', 'V4E']
        // ... rest of territory mappings
    },
    // ... other provinces
};

const urlMap = {
    'langley-territory': 'https://app.localhandymangroup.com/langley',
    // ... other URL mappings
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
    
    const territory = territoryMap[province][fsa];
    console.log('Territory found:', territory);
    return urlMap[territory] || urlMap.default;
    console.log('Final URL:', finalURL);
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
