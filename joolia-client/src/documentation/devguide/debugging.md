# Debugging

### Debugging in Chrome

##### Description

Activate verbose debugging mode in Client. Can be used e.g. for Websocket debugging

##### Howto

1. Open your Browser console
2. Run "localStorage.debug = '\*'"
3. Reload your application

### Inspecting on read Mobile Devices

##### Description

##### Howto

### Connecting from mac-mini

1. Set up the mobile hotspot on Windows 10 Notebook (share internet-connection)
   troubleshooting: the answer from cambunctious might help: https://answers.microsoft.com/en-us/insider/forum/insider_wintp-insider_web/mobile-hotspot-connections-are-stuck-at-obtaining/365b496a-14db-4bec-951d-08726752ce98
2. Connect the mac-mini to the hotspot
3. Check the IP for the hotspot (displayed in Windows 10 settings; mac-mini might have IP 192.168.137.53, then server is 192.168.137.1)
4. Modify and run client/server:
    - add `'http://192.168.137.1:9000'` to `httpConf.cors.origin` in the dev-configuration for the server
    - add the following env-variables to the server:
        - `JOOLIA_HTTP_HOST=0.0.0.0`
        - `JOOLIA_CLIENT_URL=http://192.168.137.1:9000`
    - re-build and start server (`npm run build` and `npm run start:dev`)
    - change API-server-IP in joolia-client/src/environments/environment.dev.ts (`serverConnection` and `tokenCookieDomain`)
    - add `--host=0.0.0.0` to the `start` command in joolia-client/package.json
    - start client (`npm run start`)
5. Open safari on mac-mini, visit 192.168.137.1:9000
6. Note that signup doesn't work since reCaptcha is not configured
