# WebSockets in Joolia

Joolia uses WS for these purposes:

1. A native Chat implementation.
2. A Push-back notification channel.

## Underlying Technology

+ https://github.com/socketio/socket.io
+ https://github.com/socketio/socket.io-redis
+ https://redis.io/

### Message Storage & Broadcasting

Redis is used as a Storage __only__ for the Chat feature but Redis `Pub/Sub` feature
is used by the server instance to Broadcast messages to the other running Server instances.

# WS Payloads

In general this is the shape of data sent back & forth between a client and server.

    interface ISocketPayload {
        room: string;
        data: Record<string, any>;
    }

## Chat Payload

A message for Chat in a given Format.

    {
       "room": "/chat/format/77f4725e-6291-4914-a24a-ee59242d4c5a",
       "data": {
            "text": "Hallo Leute!",
            "createdAt": "2019-05-09T10:44:32",
            "createdBy": "19eb1eae-3560-4a31-bd03-60156359fbab",
            "user": {
                "id": "19eb1eae-3560-4a31-bd03-60156359fbab",
                "name": "Luke"
            }
        }
    };

## Notification Payload

A Notification sent after a Creation of a Canvas Submission.

    {
      "room":"/notification/canvas/40c4e61a-83c7-443a-a8dc-51a52ee795aa",
      "data":{
        "target":"<redacted>-4dd34b80d4f9/canvas/40c4e61a-83c7-443a-a8dc-51a52ee795aa/slot/d3e38dd6-0a16-453e-9c08-0860f1cc33e6/submission",
        "notification":"created",
        "user":{
          "id":"0004a350-29f8-11e9-b210-d663bd873d93",
          "email":"luke@alliance.com",
          "name":"Luke"
        },
        "ts":"2020-08-06T14:52:12.747Z"
      }
    }


# Room Names

Room names are matched using a RegExp for validation purposes.
 
See inline docs in `config/index.ts`. Rooms are configured under the `websocket` field.

# Socket.IO Namespaces

The `root (/)` namespace is being used to exchange the Chat messages while `notifications` namespace is
used to send one-way notifications only.

Further info: https://socket.io/docs/namespaces/

# Debugging

See environment variables `JOOLIA_WS_LOGGING` and `WS_LOG_LEVEL` in `.env.example`.
Use `JOOLIA_WS_ENABLED` to disable/enable the Chat e Notification features.
