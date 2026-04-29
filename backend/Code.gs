// Google Apps Script Backend for FamilyLaw.AI
// Copy this code into your Google Apps Script editor (script.google.com)
// Make sure to deploy as a Web App, accessible to "Anyone".

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create sheets if they don't exist
  const sheets = ['Users', 'Profiles', 'Files', 'Research', 'Chats'];
  sheets.forEach(name => {
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
      if (name === 'Users') ss.getSheetByName(name).appendRow(['tenantId', 'email', 'password', 'name', 'role']);
      if (name === 'Profiles') ss.getSheetByName(name).appendRow(['tenantId', 'profileData']);
      if (name === 'Files') ss.getSheetByName(name).appendRow(['tenantId', 'fileId', 'name', 'mimeType', 'dateAdded', 'base64Data']);
      if (name === 'Research') ss.getSheetByName(name).appendRow(['tenantId', 'query', 'answer', 'timestamp']);
      if (name === 'Chats') ss.getSheetByName(name).appendRow(['tenantId', 'chatId', 'title', 'messages', 'timestamp']);
    }
  });
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    let result = { success: false, message: 'Unknown action' };

    if (action === 'register') {
      result = handleRegister(payload);
    } else if (action === 'login') {
      result = handleLogin(payload);
    } else if (action === 'saveProfile') {
      result = handleSaveProfile(payload);
    } else if (action === 'getProfile') {
      result = handleGetProfile(payload);
    } else if (action === 'uploadFile') {
      result = handleUploadFile(payload);
    } else if (action === 'getFiles') {
      result = handleGetFiles(payload);
    } else if (action === 'deleteFile') {
      result = handleDeleteFile(payload);
    } else if (action === 'saveResearch') {
      result = handleSaveResearch(payload);
    } else if (action === 'getResearch') {
      result = handleGetResearch(payload);
    } else if (action === 'saveChat') {
      result = handleSaveChat(payload);
    } else if (action === 'getChats') {
      result = handleGetChats(payload);
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function generateId() {
  return Utilities.getUuid();
}

function handleRegister(payload) {
  const sheet = getSheet('Users');
  const data = sheet.getDataRange().getValues();
  
  // Check if email exists
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === payload.email) {
      return { success: false, message: 'Email already registered' };
    }
  }
  
  const tenantId = generateId();
  sheet.appendRow([tenantId, payload.email, payload.password, payload.name, payload.role]);
  
  return { success: true, tenantId, email: payload.email, name: payload.name, role: payload.role };
}

function handleLogin(payload) {
  const sheet = getSheet('Users');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === payload.email && data[i][2] === payload.password) {
      return { 
        success: true, 
        tenantId: data[i][0], 
        email: data[i][1], 
        name: data[i][3], 
        role: data[i][4] 
      };
    }
  }
  return { success: false, message: 'Invalid credentials' };
}

function handleSaveProfile(payload) {
  const sheet = getSheet('Profiles');
  const data = sheet.getDataRange().getValues();
  const profileString = JSON.stringify(payload.profile);
  
  // Update if exists
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.tenantId) {
      sheet.getRange(i + 1, 2).setValue(profileString);
      return { success: true };
    }
  }
  
  // Insert new
  sheet.appendRow([payload.tenantId, profileString]);
  return { success: true };
}

function handleGetProfile(payload) {
  const sheet = getSheet('Profiles');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.tenantId) {
      return { success: true, profile: JSON.parse(data[i][1]) };
    }
  }
  return { success: true, profile: null };
}

function handleUploadFile(payload) {
  const sheet = getSheet('Files');
  const fileId = generateId();
  const dateAdded = new Date().getTime();
  
  sheet.appendRow([payload.tenantId, fileId, payload.name, payload.mimeType, dateAdded, payload.base64Data]);
  
  return { 
    success: true, 
    file: { id: fileId, name: payload.name, type: payload.mimeType, dateAdded } 
  };
}

function handleGetFiles(payload) {
  const sheet = getSheet('Files');
  const data = sheet.getDataRange().getValues();
  const files = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.tenantId) {
      files.push({
        id: data[i][1],
        name: data[i][2],
        type: data[i][3],
        dateAdded: data[i][4]
      });
    }
  }
  return { success: true, files };
}

function handleDeleteFile(payload) {
  const sheet = getSheet('Files');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.tenantId && data[i][1] === payload.fileId) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, message: 'File not found' };
}

function handleSaveResearch(payload) {
  const sheet = getSheet('Research');
  sheet.appendRow([payload.tenantId, payload.query, payload.answer, new Date().getTime()]);
  return { success: true };
}

function handleGetResearch(payload) {
  const sheet = getSheet('Research');
  const data = sheet.getDataRange().getValues();
  const research = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.tenantId) {
      research.push({
        query: data[i][1],
        answer: data[i][2],
        timestamp: data[i][3]
      });
    }
  }
  return { success: true, research };
}

function handleSaveChat(payload) {
  const sheet = getSheet('Chats');
  const chatId = generateId();
  sheet.appendRow([payload.tenantId, chatId, payload.title, JSON.stringify(payload.messages), new Date().getTime()]);
  return { success: true, chatId };
}

function handleGetChats(payload) {
  const sheet = getSheet('Chats');
  const data = sheet.getDataRange().getValues();
  const chats = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.tenantId) {
      chats.push({
        id: data[i][1],
        title: data[i][2],
        messagesJSON: data[i][3],
        timestamp: data[i][4]
      });
    }
  }
  return { success: true, chats };
}
