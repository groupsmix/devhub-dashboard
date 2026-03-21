/**
 * DevHub Dashboard - Google Apps Script Backend
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Paste this entire code into the script editor
 * 4. Click Deploy > New deployment
 * 5. Select "Web app" as the type
 * 6. Set "Execute as" to "Me"
 * 7. Set "Who has access" to "Only myself"
 * 8. Click Deploy and copy the Web App URL
 * 9. Add the URL to your .env file as VITE_SHEETS_API_URL
 *
 * The script will auto-create sheets on first use.
 */

// Sheet names
var SHEET_PROJECTS = 'Projects';
var SHEET_TASKS = 'TodayTasks';
var SHEET_CATEGORIES = 'Categories';
var SHEET_WORKSPACES = 'Workspaces';
var SHEET_ACTIVITY = 'Activity';

// Column definitions
var PROJECT_COLS = [
  'id', 'name', 'domain', 'category', 'status', 'priority',
  'description', 'notes', 'workspaceId', 'pinned', 'deadline',
  'startDate', 'createdAt', 'updatedAt', 'currentWork',
  'tags', 'toolsUsed', 'trafficSources', 'connectedEmails',
  'checklist', 'whatsDone', 'whatsNotDone', 'workflow', 'links', 'finance'
];

var TASK_COLS = ['id', 'projectId', 'text', 'done'];
var CATEGORY_COLS = ['name'];
var WORKSPACE_COLS = ['id', 'name', 'color'];
var ACTIVITY_COLS = ['id', 'projectId', 'projectName', 'action', 'timestamp'];

// JSON fields (stored as JSON strings in cells)
var JSON_FIELDS = [
  'tags', 'toolsUsed', 'trafficSources', 'connectedEmails',
  'checklist', 'whatsDone', 'whatsNotDone', 'workflow', 'links', 'finance'
];

function doGet(e) {
  try {
    var data = getAllData();
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action || 'saveAll';

    if (action === 'saveAll') {
      saveAllData(body.data);
    } else if (action === 'saveProjects') {
      writeSheet(SHEET_PROJECTS, PROJECT_COLS, body.data, true);
    } else if (action === 'saveTasks') {
      writeSheet(SHEET_TASKS, TASK_COLS, body.data, false);
    } else if (action === 'saveCategories') {
      writeCategoriesSheet(body.data);
    } else if (action === 'saveWorkspaces') {
      writeSheet(SHEET_WORKSPACES, WORKSPACE_COLS, body.data, false);
    } else if (action === 'saveActivity') {
      writeSheet(SHEET_ACTIVITY, ACTIVITY_COLS, body.data, false);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getAllData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheets(ss);

  return {
    projects: readSheet(SHEET_PROJECTS, PROJECT_COLS, true),
    todayTasks: readSheet(SHEET_TASKS, TASK_COLS, false),
    categories: readCategoriesSheet(),
    workspaces: readSheet(SHEET_WORKSPACES, WORKSPACE_COLS, false),
    activity: readSheet(SHEET_ACTIVITY, ACTIVITY_COLS, false)
  };
}

function saveAllData(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheets(ss);

  if (data.projects) writeSheet(SHEET_PROJECTS, PROJECT_COLS, data.projects, true);
  if (data.todayTasks) writeSheet(SHEET_TASKS, TASK_COLS, data.todayTasks, false);
  if (data.categories) writeCategoriesSheet(data.categories);
  if (data.workspaces) writeSheet(SHEET_WORKSPACES, WORKSPACE_COLS, data.workspaces, false);
  if (data.activity) writeSheet(SHEET_ACTIVITY, ACTIVITY_COLS, data.activity, false);
}

function ensureSheets(ss) {
  var sheetConfigs = [
    { name: SHEET_PROJECTS, headers: PROJECT_COLS },
    { name: SHEET_TASKS, headers: TASK_COLS },
    { name: SHEET_CATEGORIES, headers: CATEGORY_COLS },
    { name: SHEET_WORKSPACES, headers: WORKSPACE_COLS },
    { name: SHEET_ACTIVITY, headers: ACTIVITY_COLS }
  ];

  for (var i = 0; i < sheetConfigs.length; i++) {
    var config = sheetConfigs[i];
    var sheet = ss.getSheetByName(config.name);
    if (!sheet) {
      sheet = ss.insertSheet(config.name);
      sheet.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);
      sheet.getRange(1, 1, 1, config.headers.length).setFontWeight('bold');
    }
  }
}

function readSheet(sheetName, cols, hasJsonFields) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  var data = sheet.getRange(2, 1, lastRow - 1, cols.length).getValues();
  var results = [];

  for (var r = 0; r < data.length; r++) {
    var row = data[r];
    if (!row[0] && row[0] !== 0) continue; // skip empty rows

    var obj = {};
    for (var c = 0; c < cols.length; c++) {
      var col = cols[c];
      var val = row[c];

      if (hasJsonFields && JSON_FIELDS.indexOf(col) !== -1) {
        try {
          obj[col] = val ? JSON.parse(val) : [];
        } catch (e) {
          obj[col] = [];
        }
      } else if (col === 'pinned' || col === 'done') {
        obj[col] = val === true || val === 'true' || val === 'TRUE';
      } else {
        obj[col] = val !== undefined && val !== null ? String(val) : '';
      }
    }
    results.push(obj);
  }

  return results;
}

function writeSheet(sheetName, cols, items, hasJsonFields) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    ensureSheets(ss);
    sheet = ss.getSheetByName(sheetName);
  }

  // Clear existing data (keep headers)
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, cols.length).clearContent();
  }

  if (!items || items.length === 0) return;

  var rows = [];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var row = [];
    for (var c = 0; c < cols.length; c++) {
      var col = cols[c];
      var val = item[col];

      if (hasJsonFields && JSON_FIELDS.indexOf(col) !== -1) {
        row.push(val ? JSON.stringify(val) : '[]');
      } else if (col === 'pinned' || col === 'done') {
        row.push(val === true || val === 'true');
      } else {
        row.push(val !== undefined && val !== null ? val : '');
      }
    }
    rows.push(row);
  }

  sheet.getRange(2, 1, rows.length, cols.length).setValues(rows);
}

function readCategoriesSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_CATEGORIES);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  var data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var results = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i][0]) results.push(String(data[i][0]));
  }
  return results;
}

function writeCategoriesSheet(categories) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_CATEGORIES);
  if (!sheet) {
    ensureSheets(ss);
    sheet = ss.getSheetByName(SHEET_CATEGORIES);
  }

  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 1).clearContent();
  }

  if (!categories || categories.length === 0) return;

  var rows = categories.map(function(cat) { return [cat]; });
  sheet.getRange(2, 1, rows.length, 1).setValues(rows);
}

/**
 * Run this function once to initialize the sheets.
 * Go to Run > initializeSheets in the Apps Script editor.
 */
function initializeSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheets(ss);
  Logger.log('Sheets initialized successfully!');
}
