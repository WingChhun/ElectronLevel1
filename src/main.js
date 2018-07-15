// Modules to control application life and create native browser window
const {app, BrowserWindow, dialog, Menu} = require("electron");
const fs = require("fs");
const {default: installExtension, REACT_DEVELOPER_TOOLS} = require("electron-devtools-installer");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 1200, height: 800, titleBarStyle: "hidden"});

    // and load the index.html of the app.
    mainWindow.loadURL("http://localhost:3000");

    const template = [
        {
            label: "File",
            submenu: [// {   label: "Open File",   accelerator: "CmdOrCtrl+O",   click() {
                // openFile();   } },
                {
                    label: "Open Folder",
                    accelerator: "CmdOrCtrl+O",
                    click() {
                        openDir();
                    }
                }
            ]
        }, {
            label: "Edit",
            submenu: [
                {
                    role: "undo"
                }, {
                    role: "redo"
                }, {
                    type: "separator"
                }, {
                    role: "cut"
                }, {
                    role: "copy"
                }, {
                    role: "paste"
                }, {
                    role: "pasteandmatchstyle"
                }, {
                    role: "delete"
                }, {
                    role: "selectall"
                }
            ]
        }, {
            label: "View",
            submenu: [
                {
                    role: "reload"
                }, {
                    role: "forcereload"
                }, {
                    role: "toggledevtools"
                }, {
                    type: "separator"
                }, {
                    role: "resetzoom"
                }, {
                    role: "zoomin"
                }, {
                    role: "zoomout"
                }, {
                    type: "separator"
                }, {
                    role: "togglefullscreen"
                }
            ]
        }, {
            role: "window",
            submenu: [
                {
                    role: "minimize"
                }, {
                    role: "close"
                }
            ]
        }, {
            role: "help",
            submenu: [
                {
                    label: "Learn More",
                    click() {
                        require("electron")
                            .shell
                            .openExternal("https://electronjs.org");
                    }
                }
            ]
        }, {
            label: "Developer",
            submenu: [
                {
                    label: "Toggle Developer Tools",
                    accelerator: process.platform === "darwin"
                        ? "Alt+Command+I"
                        : "Ctrl+Shift+I",
                    click() {
                        mainWindow
                            .webContents
                            .toggleDevTools();
                    }
                }
            ]
        }
    ];

    // If macOS
    if (process.platform === "darwin") {
        template.unshift({
            label: app.getName(),
            submenu: [
                {
                    role: "about"
                }, {
                    type: "separator"
                }, {
                    role: "services",
                    submenu: []
                }, {
                    type: "separator"
                }, {
                    role: "hide"
                }, {
                    role: "hideothers"
                }, {
                    role: "unhide"
                }, {
                    type: "separator"
                }, {
                    role: "quit"
                }
            ]
        });

        // Edit menu
        template[2]
            .submenu
            .push({
                type: "separator"
            }, {
                label: "Speech",
                submenu: [
                    {
                        role: "startspeaking"
                    }, {
                        role: "stopspeaking"
                    }
                ]
            });

        // Window menu
        template[4].submenu = [
            {
                role: "close"
            }, {
                role: "minimize"
            }, {
                role: "zoom"
            }, {
                type: "separator"
            }, {
                role: "front"
            }
        ];
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    // window is closed.
    mainWindow.on("closed", function () {
        // Dereference the window object, usually you would store windows in an array if
        // your app supports multi windows, this is the time when you should delete the
        // corresponding element.
        mainWindow = null;
    });


    //TODO: Install developer extensions

    require('devtron')
        .install();
     

    mainWindow
        .webContents
        .openDevTools();
    //install React Devtools and Redux
    installExtension(REACT_DEVELOPER_TOOLS).then(msg => {
        console.log("Added extensnion ", msg);
    }).catch(err => {
        console.log("Error adding extension ", err);
    });
}

// This method will be called when Electron has finished initialization and is
// ready to create browser windows. Some APIs can only be used after this event
// occurs.
app.on("ready", () => {
    createWindow();
});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
    // On OS X it is common for applications and their menu bar to stay active until
    // the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", function () {
    // On OS X it's common to re-create a window in the app when the dock icon is
    // clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here. Open
// File
function openFile() {
    // Opens file dialog looking for markdown
    const files = dialog.showOpenDialog(mainWindow, {
        properties: ["openFile"],
        filters: [
            {
                name: "Markdown",
                extensions: ["md", "markdown", "txt"]
            }
        ]
    });

    // If no files
    if (!files) 
        return;
    
    const file = files[0]; // Grabs first file path in array
    // Loads file contents via path acquired via the dialog
    const fileContent = fs
        .readFileSync(file)
        .toString();

    // Send filedContent to renderer
    mainWindow
        .webContents
        .send("new-file", fileContent);
}

//Opens directory
const openDir = () => {
    const directory = dialog.showOpenDialog(mainWindow, {properties: ["openDirectory"]});

    if (!directory) 
        return;
    
    const dir = directory[0];

    mainWindow
        .webContents
        .send('new-dir', dir);
}
