Model:

-   position
   number >= 0
-   description
   string
-   done
   boolean

Operations:

   - GET format/formatId/phase/phaseId/activity/activityId/step
       Parameters: select

       ResponseBody:
           - Model
       Response codes: 200, 400, 401, 404
   - PATCH format/formatId/phase/phaseId/activity/activityId/step/stepId
       Body:
           Model BUT NOT POSITION!!!
       ResponseBody:
           Updated fields.
       Response codes: 200, 400, 401, 404
   - PATCH format/formatId/phase/phaseId/activity/activityId/step/stepId/_position
       Body:
         position
       ResponseBody:
           id
           position
       ResponseCodes: 200, 400, 401, 404
   - DELETE format/formatId/phase/phaseId/activity/activityId/step/stepId
           Body:
               NO body
           ResponseBody:
               NO response
           Response codes: 204, 401, 404
   - POST format/formatId/phase/phaseId/activity/activityId/step
           Body:
               Model:
                   description:
                       required
                   position:
                       required
                   done:
                       required
           Response body:
               Created object (Everything)
           Response codes : 201, 401, 400, 404