# Video Conferencing

## Related Files
- src/app/shared/components/meeting-start/meeting-start.component.ts
- src/app/core/services/meeting.service.ts  

## Description

**Role: Organizer**  

- By clicking the video camera within the messenger, the organizer is able to create a new meeting  
- If another organizer is clicking the video camera in the format he just join the existing meeting room  
- When the adding of a meeting fails the organizer receives a notification in a snackbar message  

**Role: Participant of Format**  

- A participant is not able to create new meeting rooms  
- If the Organizer has already started the meeting, the participant is able to joint the meeting room  
- If the Organizer has not yet started the meeting, the participant will receive an information via snackbar that he should try in a few minutes again  

**Role: Member of a Team**

- any member of a team can create a meeting  
- after the first member created the meeting all other members can join  

Creation as well as joining of a meeting room in the successful case always results in a URL which is opened in a new tab.
