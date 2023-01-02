# Validation
In this document we specialize how the different fields of the models have to be validated

## User
| Field | Required? | Validation |
| :------ | :------ |  :------ |
| name | Yes | Maximum number of characters: 200 |
| email | Yes | Valid e-mail address <br> Regex: ^[a-zA-Z0-9.!#$%&’*+/=?^_`{&#124;}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$ |
| company | No | Maximum number of characters: 100 |
| password | Yes | Minimum number of characters: 8, at least one number or special character <br> Regex: ^(?=.*[^a-zA-Z]).{8,}$ |

## Workspace
| Field | Required? | Validation |
| :------ | :------ |  :------ |
| name | No | Maximum number of characters: 200 |
| description | No | Maximum number of characters: 2000 |
| licenses | Yes | Lowest possible value: 1 |
