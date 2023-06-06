# CS310_final_server
For working on web service before deploying to AWS...

## Installation
* Work locally (you are on your own if using replit)
* Install Node.js and Express
* Connect to MySQL database. The host, user name, password, and port are in file "photoapp-config". Consult the project handouts if needed for configuring. I used the "MySQL" VSCode extension by Jun Han.
* Install the "Live Server" VSCode extension. This is used to launch the client. It adds a "Go Live" button in the lower right corner of VSCode.

## Running
* Launch from terminal using "node app.js" from the repository's root directory
* To launch with debugging, click "Run and Debug" (Ctrl+Shift+D) on VSCode's left pane. Then click "JavaScript Debug Terminal". This creates a new terminal with debugging enabled. Run "node app.js" like before. This enables breakpoints on the server.
* For client-side breakpoints, open your web browser's developer tools (Ctrl+Shift+I in Chrome). Choose the "Sources" tab and open the file "clientscript.js" and set breakpoints in Chrome.
