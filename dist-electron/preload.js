"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  getSources: () => electron.ipcRenderer.invoke("get-sources"),
  getAppInfo: () => electron.ipcRenderer.invoke("get-app-info")
});
