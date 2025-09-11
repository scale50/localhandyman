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
        'fraser-valley': ['V3A', 'V2Y', 'V2Z', 'V1M', 'V4W','V4X','V2T','V2S','V3G','V0X','V2R','V2P','V0M','V4Z'],
        'kelowna': ['V1Z', 'V1Y', 'V1X', 'V1W', 'V4V', 'V4T', 'V1V'],
        'vancouver-central': ['V5K', 'V5Y', 'V5W', 'V5V','V59','V6T','V6S','V6N','V6R','V6L','V6K','V6P'],
        'northshore-vancouver': ['V7W', 'V7V', 'V7T', 'V7P', 'V7M', 'V7R', 'V7N', 'V7K','V7G', 'V7H','V7L','V7J','V5Y','V5W','V5V','V5P','V6G','V6E','V7X','V6C','V6Z','V6B','V5T','V6A','V5L'],
        'ridge-meadows': ['V2X', 'V3Y', 'V2W', 'V4R'],
        'whiterock': ['V4A', 'V4P', 'V3X', 'V4B', 'V3Z'],
        'tri-cities': ['V3H', 'V3K', 'V3J', 'V3B', 'V3E', 'V3C'],
    },
    'SK': {
        'regina': ['S4L', 'S4N', 'S4P', 'S4R', 'S4S', 'S4T', 'S4V', 'S4W', 'S4Y', 'S4Z', 'S0G', 'S4X'],
        'saskatoon': ['S7P', 'S7T', 'S7H', 'S7J', 'S7K', 'S7L', 'S7M', 'S7N', 'S7R', 'S7S', 'S7V', 'S7W'],
    },
    'AB': {
        'calgary-airdrie': ['T4A', 'T4B', 'T3R', 'T3P', 'T3N', 'T3M', 'T3L', 'T3K', 'T3J', 'T3H', 'T3G', 'T3E', 'T3C', 'T3B', 'T3A', 'T2Z', 'T2Y', 'T2X', 'T2V', 'T2T', 'T2S', 'T2R', 'T2P', 'T2N', 'T2M', 'T2L', 'T2H', 'T2G', 'T2E', 'T1Y', 'T2W'],
        'calgary-east': ['T2A', 'T2B', 'T2C', 'T3S', 'T1X'],
        'lethbridge': ['T1K', 'T1J', 'T1H', 'T0L', 'T0K', 'T1M', 'T1G'],
        'grande-prairie': ['T8X', 'T8W', 'T8V'],
    },
    'ON': {
        'niagara': ['L0S', 'L2A', 'L2E', 'L2G', 'L2H', 'L2M', 'L2N', 'L2P', 'L2R', 'L2S', 'L2T', 'L2V', 'L3K', 'L3C'],
        'oakville': ['L6K', 'L6H', 'L6L', 'L6M', 'L6J', 'L8B', 'L7T', 'L7P', 'L7M', 'L7S', 'L7R', 'L7N', 'L7L'],
        'hamilton': ['L9H', 'L8N', 'L8P', 'L8M', 'L8S', 'L8R', 'L8L', 'L9G', 'L9K', 'L9B', 'L9C', 'L9A'],

    },
     'MB': {
        'brandon': ['R0K', 'R7B', 'R7C', 'R7A'],
        'winnipeg': ['R4G', 'R3Y', 'R4H', 'R3S', 'R3R', 'R3K', 'R2Y', 'R3P'],

    },
    // ... other provinces
    
    // Add US territories - example structure for when you add US locations
    'US': {
        'frisco-allen': ['75033', '75034', '75035', '75002', '75013', '75023', '75025'],
        'st-louis': ['63105', '63114', '63117', '63124', '63130', '63132', '63017', '63043', '63044', '63045', '63074', '63141', '63011', '63021', '63122', '63131', '63025', '63026', '63049', '63051', '63052', '63088', '63099', '63368', '63376', '63146'],
        'las-vegas': ['89004', '89113', '89148', '89161', '89178', '89002', '89012', '89052', '89074', '89123', '89139', '89103', '89135', '89147', '89128', '89134', '89138', '89144', '89145'],
        'mid-south':['38114', '38111', '38152', '38104', '38112', '38122', '38017', '38066', '38028', '38060', '38076', '38141', '38115', '38125', '38117', '38120', '38119', '38138', '38139', '38018', '38134', '38135', '38133', '38016', '38002'],
        'pittsburgh':['15104', '15221', '15110', '15122', '15034','15204', '15207', '15217', '15120', '15218', '15234', '15236', '15226', '15211', '15227', '15210', '15203', '15613', '15629', '15641', '15673', '15656', '15690', '15147', '15139', '15024', '15076', '15049', '15144', '15084', '15030', '15068', '15014', '15065', '15668', '15112', '15145', '15137', '15035', '15148', '15140', '15146', '15235', '15239', '15611', '15692', '15665', '15675', '15636', '15634', '15644', '15623', '15601', '15633', '15635', '15662', '15626', '15632', '15085', '15615', '15642', '15647', '15063', '15020', '15038', '15025', '15088', '15037', '15045', '15133', '15132', '15018', '15135', '15083', '15047', '15028', '15131', '15067', '15367', '15102', '15332', '15129', '15363', '15350', '15317', '15321', '15031', '15064', '15055', '15017', '15241', '15342', '15361', '15057', '15082', '15071', '15142', '15059', '15052', '15009', '16115', '16120', '15010', '16141', '15061', '15027', '15066', '15074', '16136', '16157', '16117', '15077', '15042', '15005', '15086', '16001', '16059', '16045', '16002', '16029', '16063', '16066', '16123', '16037', '16046', '16024', '16033', '16027', '16053', '19375'],
        // Add more US territories as needed
    }
};

const urlMap = {
    'fraser-valley': 'https://localhandyman.com/fraser-valley',
    'kelowna': 'https://localhandyman.com/kelowna',
    'regina': 'https://localhandyman.com/regina',
    'saskatoon': 'https://localhandyman.com/saskatoon',
    'calgary-airdrie': 'https://localhandyman.com/calgary-airdrie',
    'calgary-east': 'https://localhandyman.com/calgary-east',
    'lethbridge': 'https://localhandyman.com/lethbridge',
    'neworleans': 'https://localhandyman.com/neworleans',
    'vancouver-central': 'https://localhandyman.com/vancouver-central',
    'northshore-vancouver': 'https://localhandyman.com/northshore-vancouver',
    'tri-cities': 'https://localhandyman.com/tri-cities',
    'whiterock': 'https://localhandyman.com/whiterock',
    'grande-prairie': 'https://localhandyman.com/grande-prairie',
    'niagara': 'https://localhandyman.com/niagara',
    'oakville': 'https://localhandyman.com/oakville',
    'hamilton': 'https://localhandyman.com/hamilton',
    'frisco-allen': 'https://localhandyman.com/frisco-allen',
    'brandon': 'https://localhandyman.com/brandon',
    'winnipeg': 'https://localhandyman.com/winnipeg',
    'st-louis': 'https://localhandyman.com/stlouis',
    'las-vegas': 'https://localhandyman.com/lasvegas',
    'ridge-meadows': 'https://localhandyman.com/ridgemeadows',
    'mid-south': 'https://localhandyman.com/mid-south',
    'pittsburgh': 'https://localhandyman.com/pittsburgh',
    'default': 'https://localhandyman.com/default-location'
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
