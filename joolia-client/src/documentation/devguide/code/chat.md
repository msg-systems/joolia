# Chat

## Related Files

- src/app/core/services/messenger.service.ts
- src/app/public/messenger/messenger.component.ts
- src/app/shared/components/messenger-overview/messenger-overview.component.t
- src/app/shared/components/messenger-chat-room-card/messenger-chat-room-card.component.ts
- src/app/shared/components/messenger-chat/messenger-chat.component.ts

## Description

- Chat always in context of Format  
  When opening a format the chat gets initialized
- Leaving the Format will unsubscribe the chat
- For each Chatroom the LRTS (Last Read Timestap) is known.  
  This information is also sent to the server when reading opening the chat
- Chat Fab right bottom corner
- Badge for notification about new messages
- Adjust Title of Page to inform about new messages

### Kind of Chats

- For each Format there is a chat
- For each Team there is a chat

The specific chats of Format/Team can only been seen if I´m a member of it

### New Chat messages:

- New Message
    - Will adjust the Title
    - Shows up a bubble in closed chat

### Video Conferencing

On the right upper corner of the messenger cards, there is the video icon to start a video conferencing  
[./videoConferencing](./videoConferencing.md)

### Websocket

[./websocket.md](./websocket.md)
