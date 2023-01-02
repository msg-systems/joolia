# Meetings API

Encapsulates the integration with third party Meeting Service Providers.

## Big Blue Button Provider

Selfhosted Joolia Meeting Solution

### Requirements

1. Environment vars `JOOLIA_MEETING_ENDPOINT` and `JOOLIA_MEETING_SECRET`

## Microsoft Teams Provider

### Requirements

1. Environment vars `JOOLIA_TEAMS_CLIENT_ID`, `JOOLIA_TEAMS_CLIENT_SECRET` and `JOOLIA_TEAMS_TENANT`

# API

## Joining a Format Meeting

### GET /format/{formatId}/meeting

+ `formatId` is the unique identifier of a Format

#### Responses

##### 200

    {
        "url": "http://meet.example.com/api"
    }

##### 204

Meeting is not started yet.

## Creating a Format Meeting

### POST /format/{formatId}/meeting

+ `formatId` is the unique identifier of a Format

Only organizers can create format meetings

#### Request body

    {
        "authorizationCode": "0.AAAA4s6[...]h5eplCAA",
        "type": "MSTeams",
        "redirectUri": "https://app.joolia.ninja/[...]/callback"
    }

#### Responses

##### 200

    {
        "url": "https://teams.microsoft.com/l/meetup-join/[...]"
    }

##### 401

Could not obtain an access token.

##### 403

Participants cannot create meetings.

## Joining a Team Meeting

### GET /format/{formatId}/team/{teamId}/meeting

+ `formatId` is the unique identifier of a Format
+ `teamId` is the unique identifier of a Team

#### Responses

##### 200

    {
        "url": "http://meet.example.com/api"
    }

##### 204

Meeting is not started yet.

## Creating a Team Meeting

### POST /format/{formatId}/team/{teamId}/meeting

+ `formatId` is the unique identifier of a Format
+ `teamId` is the unique identifier of a Team

#### Request body

    {
        "authorizationCode": "0.AAAA4s6[...]h5eplCAA",
        "type": "MSTeams",
        "redirectUri": "https://app.joolia.ninja/[...]/callback"
    }

#### Responses

##### 200

    {
        "url": "https://teams.microsoft.com/l/meetup-join/[...]"
    }

##### 401

Could not obtain an access token.
