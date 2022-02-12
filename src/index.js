const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { default: html2canvas } = require("html2canvas");
const path = require('path');
const $ = require('jquery');
const fs = require('fs');
const cheerio = require('cheerio');
const playwright = require('playwright');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 768,
    webPreferences: {
      nodeIntegration:false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.$ = $;



  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  // Open the DevTools.
  mainWindow.removeMenu();
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'win32') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("toMain", (event, args) => {
  //console.log(event);
  if (args == "openFileBrowser") {
    dialog.showOpenDialog({ 
      defaultPath: app.getPath("desktop"),
      properties: ['openFile', 'multiSelections'],
      filters: [
        {name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']}
      ]
    }).then((result)=>{
      console.log(result);
      mainWindow.webContents.send("fromMain", result);
    })
  }
});

ipcMain.on("tiermaker", (event, args) => {
  playwrightGetTiermaker(args)
  .then((result) => {
    console.log(result);
    mainWindow.webContents.send("fromMain", result);
  });
});

ipcMain.on("openSave", (event, args) => {
  dialog.showSaveDialog({ 
    defaultPath: 'myTierlist.png',
    properties: ['saveFile'],
    filters: [
      {name: 'Images', extensions: ['png']}
    ]
  }).then((result)=>{
    console.log(result);
    try {
      fs.writeFileSync(result.filePath, Buffer.from(args));
      mainWindow.webContents.send("fromMain", 'true');
    }
    catch(err) {
      console.log(err)
      mainWindow.webContents.send("fromMain", 'false');
    }
    
  })
});

ipcMain.on("saveJson", (event, args) => {
  dialog.showSaveDialog({ 
    defaultPath: 'TierlistTemplate.json',
    properties: ['saveFile'],
    filters: [
      {name: 'Text', extensions: ['json']}
    ]
  }).then((result)=>{
    console.log(result);
    try {
      fs.writeFileSync(result.filePath, args);
      mainWindow.webContents.send("fromMain", 'true');
    }
    catch(err) {
      console.log(err)
      mainWindow.webContents.send("fromMain", 'false');
    }
  })
});

ipcMain.on("openJson", (event, args) => {
    dialog.showOpenDialog({ 
      defaultPath: app.getPath("desktop"),
      properties: ['openFile'],
      filters: [
        {name: 'Text', extensions: ['json']}
      ]
    }).then((result)=>{
      console.log(result);
      let fileContents = fs.readFileSync(result.filePaths[0]);
      let data = JSON.parse(fileContents);
      console.log(data);
      mainWindow.webContents.send("fromMain", data);
    }).catch ((err) => {
      console.log(err);
    });
});

async function playwrightGetTiermaker(url) {
  baseurl = 'https://tiermaker.com'
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext({userAgent:'Mozilla/5.0'});
  const page = await context.newPage();
  await page.goto(url, {waitUntil: 'networkidle'});
  //console.log(await page.content());
  const data = await page.content();
  await browser.close();

  const $ = cheerio.load(data);

  const charList = $('.character').get();
  const imgLinks = [];
  charList.forEach(e => {
    let link = e.attribs.style.substring(e.attribs.style.indexOf(`"`)+1, e.attribs.style.lastIndexOf(`"`));
    imgLinks.push(baseurl+link);
  });
  //console.log(imgLinks);
  return(imgLinks);
}