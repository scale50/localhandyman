/********** CONFIG **********/
const GBP_SCOPES = [
  'https://www.googleapis.com/auth/business.manage'
];

const OAUTH_CLIENT_ID = 'YOUR_OAUTH_CLIENT_ID_HERE';
const OAUTH_CLIENT_SECRET = 'YOUR_OAUTH_CLIENT_SECRET_HERE';

const COL_LABEL        = 1; // A
const COL_LOCATIONNAME = 2; // B
const COL_AVG_RATING   = 3; // C
const COL_REVIEW_COUNT = 4; // D
const COL_LAST_UPDATED = 5; // E

/********** WEB APP ENDPOINT **********/
/**
 * Serves the sheet data as JSON when the script is deployed as a web app.
 *
 * Deploy with:
 *   Execute as: Me
 *   Who has access: Anyone within [your org domain]
 *
 * The dashboard fetches this URL to get live data.
 *
 * Optional query parameter: ?refresh=true  → triggers updateReviews() first,
 * then returns the fresh data.
 */
function doGet(e) {
  // If ?refresh=true is passed, pull fresh data from GBP API first
  if (e && e.parameter && e.parameter.refresh === 'true') {
    try {
      updateReviews();
    } catch (err) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: err.message }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({ locations: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var numRows = lastRow - 1;
  var dataRange = sheet.getRange(2, 1, numRows, 5); // A2:E
  var values = dataRange.getValues();

  var locations = [];
  for (var i = 0; i < values.length; i++) {
    var name     = values[i][0]; // A - Location label
    var placeId  = values[i][1]; // B - Place ID
    var rating   = values[i][2]; // C - Avg Rating
    var reviews  = values[i][3]; // D - Review Count
    var updated  = values[i][4]; // E - Last Updated

    // Skip completely empty rows
    if (!name) continue;

    locations.push({
      name:    String(name),
      placeId: String(placeId || ''),
      rating:  Number(rating) || 0,
      reviews: Number(reviews) || 0,
      updated: updated ? new Date(updated).toISOString() : null
    });
  }

  var payload = {
    locations: locations,
    generatedAt: new Date().toISOString()
  };

  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}


/********** OAUTH SERVICE **********/
function getGbpService_() {
  return OAuth2.createService('gbp')
    .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
    .setTokenUrl('https://oauth2.googleapis.com/token')
    .setClientId(OAUTH_CLIENT_ID)
    .setClientSecret(OAUTH_CLIENT_SECRET)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties())
    .setScope(GBP_SCOPES.join(' '))
    .setParam('access_type', 'offline')
    .setParam('prompt', 'consent');
}

function authCallback(request) {
  const service = getGbpService_();
  const isAuthorized = service.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Authorization successful. You can close this tab and return to the sheet.');
  } else {
    return HtmlService.createHtmlOutput('Authorization denied.');
  }
}

function authorizeGbp() {
  const service = getGbpService_();
  if (!service.hasAccess()) {
    const authorizationUrl = service.getAuthorizationUrl();
    const template = HtmlService.createTemplateFromFile('Auth');
    template.url = authorizationUrl;
    const html = template.evaluate()
      .setWidth(600)
      .setHeight(600);
    SpreadsheetApp.getUi().showModalDialog(html, 'Authorize GBP Access');
  } else {
    SpreadsheetApp.getUi().alert('Already authorized.');
  }
}

/********** GBP API HELPERS **********/
function gbpRequest_(path, method, payload) {
  const service = getGbpService_();
  if (!service.hasAccess()) {
    throw new Error('No GBP access. Run authorizeGbp() first.');
  }

  const url = 'https://mybusinessbusinessinformation.googleapis.com/v1/' + path;
  const headers = {
    Authorization: 'Bearer ' + service.getAccessToken()
  };

  const options = {
    method: method || 'GET',
    headers: headers,
    muteHttpExceptions: true
  };

  if (payload) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(payload);
  }

  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();
  const body = response.getContentText();

  if (code < 200 || code >= 300) {
    throw new Error('GBP API error ' + code + ': ' + body);
  }

  return JSON.parse(body);
}

function listGbpLocationsToSheet() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const service = getGbpService_();
  if (!service.hasAccess()) {
    SpreadsheetApp.getUi().alert('Please run authorizeGbp() first.');
    return;
  }

  // 1) List accounts
  const accountsResp = UrlFetchApp.fetch(
    'https://mybusinessbusinessinformation.googleapis.com/v1/accounts',
    {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + service.getAccessToken() },
      muteHttpExceptions: true
    }
  );

  const accountsCode = accountsResp.getResponseCode();
  if (accountsCode !== 200) {
    throw new Error('Error listing accounts: ' + accountsResp.getContentText());
  }

  const accounts = JSON.parse(accountsResp.getContentText()).accounts || [];
  if (!accounts.length) {
    throw new Error('No GBP accounts found.');
  }

  const accountName = accounts[0].name;

  // 2) List ALL locations under that account using pagination
  const readMask = 'name,title,storefrontAddress,metadata';
  let pageToken = null;
  let locations = [];

  do {
    let locationsUrl =
      'https://mybusinessbusinessinformation.googleapis.com/v1/' +
      accountName +
      '/locations?readMask=' +
      encodeURIComponent(readMask) +
      '&pageSize=100';

    if (pageToken) {
      locationsUrl += '&pageToken=' + encodeURIComponent(pageToken);
    }

    const locationsResp = UrlFetchApp.fetch(
      locationsUrl,
      {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + service.getAccessToken() },
        muteHttpExceptions: true
      }
    );

    const locationsCode = locationsResp.getResponseCode();
    if (locationsCode !== 200) {
      throw new Error('Error listing locations: ' + locationsResp.getContentText());
    }

    const data = JSON.parse(locationsResp.getContentText());
    const batch = data.locations || [];
    locations = locations.concat(batch);
    pageToken = data.nextPageToken || null;
  } while (pageToken);

  // 3) Write locations into Sheet
  sheet.getRange(2, COL_LABEL, sheet.getLastRow(), 2).clearContent();

  let row = 2;
  locations.forEach(loc => {
    const label =
      loc.title ||
      (loc.storefrontAddress && loc.storefrontAddress.locality) ||
      loc.name;
    const locationName = loc.name;

    sheet.getRange(row, COL_LABEL).setValue(label);
    sheet.getRange(row, COL_LOCATIONNAME).setValue(locationName);
    row++;
  });

  SpreadsheetApp.getUi().alert('Imported ' + locations.length + ' locations into the sheet.');
}


function updateReviews() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var service = getGbpService_();
  if (!service.hasAccess()) {
    throw new Error('No OAuth access. Run "Authorize GBP" first.');
  }

  var token = service.getAccessToken();

  // 1) Get primary GBP account
  var accountsResp = UrlFetchApp.fetch(
    'https://mybusinessbusinessinformation.googleapis.com/v1/accounts',
    {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token },
      muteHttpExceptions: true
    }
  );

  var accountsCode = accountsResp.getResponseCode();
  var accountsText = accountsResp.getContentText();

  if (accountsCode !== 200) {
    throw new Error('Error listing v1 accounts: HTTP ' + accountsCode + '\n' + accountsText);
  }

  var accountsData;
  try {
    accountsData = JSON.parse(accountsText);
  } catch (e) {
    throw new Error('Could not parse v1 accounts response as JSON:\n' + accountsText);
  }

  if (!accountsData.accounts || !accountsData.accounts.length) {
    throw new Error('No GBP accounts returned in v1: ' + accountsText);
  }

  var accountName = accountsData.accounts[0].name;
  Logger.log('Using account: ' + accountName);

  // 2) Read all location names from column B
  var numRows = lastRow - 1;
  var locRange = sheet.getRange(2, COL_LOCATIONNAME, numRows, 1);
  var locValues = locRange.getValues();

  for (var i = 0; i < locValues.length; i++) {
    var rowIndex = i + 2;
    var locNameV1 = locValues[i][0];

    if (!locNameV1) continue;

    var parts = String(locNameV1).split('/');
    var locationId = parts[parts.length - 1];

    if (!locationId) {
      Logger.log('No locationId derived from locNameV1 in row ' + rowIndex + ': ' + locNameV1);
      sheet.getRange(rowIndex, COL_AVG_RATING).setValue('BAD_LOC_NAME');
      sheet.getRange(rowIndex, COL_REVIEW_COUNT).setValue('');
      sheet.getRange(rowIndex, COL_LAST_UPDATED).setValue(new Date());
      continue;
    }

    var parent = accountName + '/locations/' + locationId;

    var url =
      'https://mybusiness.googleapis.com/v4/' +
      parent +
      '/reviews?pageSize=1';

    var resp = UrlFetchApp.fetch(url, {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token },
      muteHttpExceptions: true
    });

    var code = resp.getResponseCode();
    var bodyText = resp.getContentText();

    if (code !== 200) {
      Logger.log('Error fetching reviews for ' + parent + ': HTTP ' + code + ' - ' + bodyText);
      sheet.getRange(rowIndex, COL_AVG_RATING).setValue('ERR');
      sheet.getRange(rowIndex, COL_REVIEW_COUNT).setValue('');
      sheet.getRange(rowIndex, COL_LAST_UPDATED).setValue(new Date());
      continue;
    }

    var data;
    try {
      data = JSON.parse(bodyText);
    } catch (e) {
      Logger.log('Non-JSON response for ' + parent + ':\n' + bodyText);
      sheet.getRange(rowIndex, COL_AVG_RATING).setValue('NON_JSON');
      sheet.getRange(rowIndex, COL_REVIEW_COUNT).setValue('');
      sheet.getRange(rowIndex, COL_LAST_UPDATED).setValue(new Date());
      continue;
    }

    var totalCount = data.totalReviewCount || 0;
    var avgRating = data.averageRating || 0;

    sheet.getRange(rowIndex, COL_AVG_RATING).setValue(avgRating);
    sheet.getRange(rowIndex, COL_REVIEW_COUNT).setValue(totalCount);
    sheet.getRange(rowIndex, COL_LAST_UPDATED).setValue(new Date());
  }
}


/********** MENU **********/
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('GBP Dashboard')
    .addItem('Authorize GBP', 'authorizeGbp')
    .addItem('List locations into sheet', 'listGbpLocationsToSheet')
    .addItem('Refresh reviews', 'updateReviews')
    .addToUi();
}
