# Websocket

## Used NPM Module 
socket.io

## Related Files 
- src/app/core/services/basic-socket.service.ts
- src/app/core/services/chat-socket.service.ts 
- src/app/core/services/notifications-socket.service.ts

## Description

### Namespace '/'

**Rooms**

**For the maintenance (not yet in use)**  
- /maintenance

**Rooms for chat**  
- /chat/format/\[formatID]
- /chat/format/\[formatID]/team/\[teamID]


### Namespace /notifications
used for implementation of the push back channels

**Rooms**  

**Push-Back channels**
Below this path the specific Push-Back Channels should be defined
- /notification 
- /notification/canvas/\[canvasID]

  
### Analysis
Copy one of those in the Console of your Browser and reload the tab.

    localStorage.debug = '*';
    localStorage.debug = 'socket.io-client:socket';
