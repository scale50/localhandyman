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
        'kelowna': ['V1Z', 'V1Y', 'V1X', 'V1W', 'V4V', 'V4T', 'V1V', 'V1P', 'V1T', 'V1H', 'V1B', 'V1E', 'V0H', 'V2A'],
        'vancouver-central': ['V5K', 'V5Y', 'V5W', 'V5V','V59','V6T','V6S','V6N','V6R','V6L','V6K','V6P'],
        'northshore-vancouver': ['V7W', 'V7V', 'V7T', 'V7P', 'V7M', 'V7R', 'V7N', 'V7K', 'V7G', 'V7H', 'V7L', 'V7J', 'V7S'],
        'ridge-meadows': ['V2X', 'V3Y', 'V2W', 'V4R'],
        'whiterock': ['V4A', 'V4P', 'V3X', 'V4B', 'V3Z'],
        'tri-cities': ['V3H', 'V3K', 'V3J', 'V3B', 'V3E', 'V3C'],
        'kamloops': ['V2E', 'V1S', 'V2B', 'V2H', 'V2C'],
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
        'st-louis': ['63105', '63114', '63117', '63124', '63130', '63132', '63017', '63043', '63044', '63045', '63074', '63141', '63011', '63021', '63122', '63131', '63025', '63026', '63049', '63051', '63052', '63088', '63099', '63368', '63376', '63146','63005', '63010', '63038', '63040', '63053', '63119', '63123', '63125', '63126', '63127', '63128', '63129', '63133', '63143', '63144', '63301', '63303', '63304', '63332', '63341', '63348', '63357', '63362', '63366', '63367', '63369', '63373', '63380', '63383', '63385', '63390'],
        'las-vegas': ['89004', '89113', '89148', '89161', '89178', '89002', '89012', '89052', '89074', '89123', '89139', '89103', '89135', '89147', '89128', '89134', '89138', '89144', '89145'],
        'mid-south':['38114', '38111', '38152', '38104', '38112', '38122', '38017', '38066', '38028', '38060', '38076', '38141', '38115', '38125', '38117', '38120', '38119', '38138', '38139', '38018', '38134', '38135', '38133', '38016', '38002'],
        'pittsburgh':['15001', '15003', '15004', '15006', '15007', '15015', '15019', '15021', '15026', '15043', '15044', '15046', '15050', '15053', '15054', '15056', '15078', '15081', '15090', '15101', '15106', '15108', '15116', '15126', '15136', '15143', '15201', '15202', '15204', '15205', '15206', '15208', '15209', '15212', '15213', '15214', '15215', '15216', '15219', '15220', '15222', '15223', '15224', '15225', '15228', '15229', '15232', '15233', '15237', '15238', '15243', '15244', '15260', '15275', '15276', '15282', '15289'],
        'nw-arkansas': ['72713', '72739', '72719', '72712', '72715', '72714', '72751', '72732', '72747', '72734', '72722', '72736', '72768', '72718', '72758', '72745', '72756', '72738', '72762', '72764', '72761', '72774', '72753', '72730', '72704', '72727', '72701', '72703', '72773', '72744', '72769', '72916', '72903', '72917', '72923', '72936', '72905', '72941', '72956', '72952', '72921', '72935', '72946', '72933', '72930', '72947', '72934', '72937', '72908', '72901', '72904', '72932'],
        'raleigh': ['27603', '27592', '27529', '27539', '27540', '27526', '27312', '27523', '27502', '27517', '27559', '27562'],
        'charlotte-north': ['28078', '28206', '28269', '28117', '28036', '28115', '28031', '28027', '28081', '28083'],
        'knoxville': ['37862', '37863', '37738', '37876', '37764', '37820', '37725', '37760', '37890', '37742', '37772', '37801', '37737', '37777', '37803', '37701', '37804', '37853', '37886', '37865', '37934', '37830', '37932', '37922', '37931'],
        'ann-arbor': ['48197', '48105', '48198', '48103', '48108', '48104', '48109', '48188', '48187', '48170'],
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
    'kamloops': 'https://localhandyman.com/kamloops',
    'nw-arkansas': 'https://localhandyman.com/nwarkansas',
    'raleigh': 'https://localhandyman.com/raleigh',
    'charlotte-north': 'https://localhandyman.com/charlottenorth',
    'knoxville': 'https://localhandyman.com/knoxville',
    'ann-arbor': 'https://localhandyman.com/annarbor',
    'default': 'https://localhandyman.com/default-location',
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
