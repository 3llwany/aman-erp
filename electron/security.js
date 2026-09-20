function installSecurity(win) {
  //win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  win.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("file://")) event.preventDefault();
  });

  win.webContents.on("will-attach-webview", (event) => {
    event.preventDefault();
  });
}

module.exports = { installSecurity };
