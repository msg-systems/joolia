# Request Identifier

All API requests are enriched with a __unique identifier__ that can be used internally to help to identify correlated actions later. This is implemented through a middleware `api/middlewares/requestId` that intercepts all API calls to inject a unique [Base58 Identifier](https://de.wikipedia.org/wiki/Base58).

## Why not another UUID instead of?

First, to be visually different from UUIDs and this helps on debugging issues.

    2020-11-18T11:28:50.077Z [HTTP] error: 329e405a-29f8-11e9-b210-d663bd873d93 DNo63dCuxSMP12rAVmGJeLsy PATCH /workspace/7375d4a4-1a36-49f9-a1fa-c6faffdb6b19 403 8ms 

The `requestId` is `DNo63dCuxSMP12rAVmGJeLsy` in this call.

Second, these IDs are used to replace UUIDs of anonymized entries in the database what enforces even further the need of a visual difference.

Third, this can be later used to track logging calls sent to a centralized logging system (i.e, Cloudwatch). In production the userId is not logged on every call due to privacy and GDPR law.

For instance would be very easy (without extra db calls) to implement a layer at the response level to filter out anonymized data sent in a response, if required, of course.

Other usages hangs on your creativity ;)

