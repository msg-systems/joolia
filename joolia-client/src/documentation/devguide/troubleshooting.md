# Troubleshooting
#### afterAll Error Event running `npm test`
**Error message:**   
`{
    "message": "An error was thrown in afterAll\n[object ErrorEvent]",
    "str": "An error was thrown in afterAll\n[object ErrorEvent]"
  }`  

  **Possible solution:**  
Check if every Jasmine Spy contains at least one dummy method. 