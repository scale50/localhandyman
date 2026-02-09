# CLAUDE.md - AI Assistant Guide for LocalHandyman

## Project Overview

**LocalHandyman** is a client-side JavaScript utility that routes users to the correct LocalHandyman franchise location page based on their postal/ZIP code input. It supports both Canadian FSA (Forward Sorting Area) codes and US 5-digit ZIP codes.

- **Single-file application**: `location-finder.js` (210 lines)
- **Zero dependencies**: No npm packages, frameworks, or build tools
- **Runtime**: Browser-based (vanilla JavaScript, DOM API)
- **Domain**: https://localhandyman.com

## Repository Structure

```
localhandyman/
├── CLAUDE.md               # This file - AI assistant guide
├── README.md               # Brief project description
└── location-finder.js      # Entire application (single file)
```

## Architecture

The application is structured as a single JavaScript file with four sections:

### 1. Data Maps (lines 1-90)
- `provinceMap` — Maps the first letter of a Canadian postal code to a province abbreviation (e.g., `'V' -> 'BC'`)
- `zipStateMap` — Maps the first digit of a US ZIP code to a state/region string (used for reference, not for routing)
- `territoryMap` — Core lookup table. Nested object: `province/country -> territory-name -> [postal codes]`. Canadian entries are keyed by province (`'BC'`, `'SK'`, `'AB'`, `'ON'`, `'MB'`); US entries are all under the `'US'` key
- `urlMap` — Maps territory names to their full LocalHandyman URLs

### 2. Validation Functions (lines 129-146)
- `cleanPostalCode(input)` — Strips spaces/hyphens, uppercases
- `isCanadianPostalCode(code)` — Regex: starts with letter, digit, letter (FSA format)
- `isUSZipCode(code)` — Regex: exactly 5 digits (with optional +4 extension)
- `getCodeType(code)` — Returns `'CA'`, `'US'`, or `'UNKNOWN'`

### 3. Lookup Functions (lines 148-199)
- `getProvince(fsa)` — Returns province from first character of FSA
- `getUSState(zipCode)` — Returns state region from first digit of ZIP
- `findLocation(code)` — Main logic: determines code type, looks up territory in `territoryMap`, returns URL from `urlMap` (or `urlMap.default`)

### 4. Entry Point (lines 201-210)
- `handleSearch()` — Reads from DOM input `#fsaInput`, cleans the code, finds the URL, and redirects via `window.location.href`

## How It Works

1. User enters a postal/ZIP code in an HTML input (`id="fsaInput"`)
2. `handleSearch()` is called (typically from a button click)
3. Input is cleaned (whitespace/hyphens removed, uppercased)
4. Code type is detected (Canadian vs US)
5. For **Canadian codes**: extract 3-character FSA -> look up province -> search province's territories for matching FSA
6. For **US codes**: extract 5-digit ZIP -> search `territoryMap['US']` for matching ZIP
7. Redirect user to the matched territory URL, or `default` URL if no match

## Service Territories

### Canada (by province)
| Province | Territories |
|----------|------------|
| BC | fraser-valley, kelowna, vancouver-central, northshore-vancouver, ridge-meadows, whiterock, tri-cities, kamloops |
| SK | regina, saskatoon |
| AB | calgary-airdrie, calgary-east, lethbridge, grande-prairie |
| ON | niagara, oakville, hamilton |
| MB | brandon, winnipeg |

### United States
frisco-allen (TX), st-louis (MO), las-vegas (NV), mid-south (TN), pittsburgh (PA), nw-arkansas (AR), raleigh (NC), north-charlotte (NC), knoxville (TN), southeast-michigan (MI), youngstown (OH), oklahoma-city (OK), west-denver (CO)

## Development Workflow

### Setup
No setup required. There is no `package.json`, no `npm install`, no build step. The file is plain JavaScript intended to be loaded via a `<script>` tag in an HTML page.

### Testing
There is no automated test suite. Changes should be verified manually:
1. Include `location-finder.js` in an HTML page with an `<input id="fsaInput">` element
2. Call `handleSearch()` or test `findLocation()` directly in the browser console
3. Verify correct URL is returned for sample postal/ZIP codes from each territory

### No Build, Lint, or CI
- No build system (webpack, Vite, etc.)
- No linter (ESLint) or formatter (Prettier) configured
- No CI/CD pipelines
- No pre-commit hooks

## Conventions for AI Assistants

### Adding a New Territory

1. **Add postal/ZIP codes** to `territoryMap`:
   - For Canadian locations: add under the correct province key (e.g., `'BC'`) with the territory name and array of FSA codes (3 characters, uppercase)
   - For US locations: add under the `'US'` key with the territory name and array of 5-digit ZIP code strings

2. **Add URL mapping** to `urlMap`:
   - Key: the territory name (must exactly match the key used in `territoryMap`)
   - Value: the full `https://localhandyman.com/<slug>` URL

3. **Known inconsistency**: The `urlMap` key `'ann-arbor'` doesn't match its `territoryMap` key `'southeast-michigan'`. Be aware of this when adding or modifying territories.

### Code Style
- Plain ES6+ JavaScript (const, arrow functions, template literals)
- No semicolons are used inconsistently (some lines have them, some don't) — follow the existing style in surrounding code
- `console.log` statements are used throughout for debugging — maintain this pattern
- Functions are declared with the `function` keyword (not arrow function declarations)
- No JSDoc or type annotations

### Commit Messages
- Historical commits use the simple format: `Update location-finder.js`
- Prefer short, descriptive messages explaining what changed

### Important Notes
- The `urlMap` has a `'neworleans'` entry with no corresponding territory in `territoryMap` yet (ZIP codes pending).
- Canadian postal codes use the first 3 characters (FSA) for matching, not the full 6-character code.
- US ZIP codes use all 5 digits for exact matching.
- All unmatched codes redirect to `urlMap.default` (`https://localhandyman.com/default-location`).
