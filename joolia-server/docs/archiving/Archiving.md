# Joolia's Delete & Archiving Solution

__Updated on 18.11.2020__

The rationale of this document explains the motivations and strategies implemented to fulfill business and legal requirements, such as:

+ Privacy and GDPR compliance
+ Deleted data lifecycle regarding backup and restoration
+ Preservation of data model consistency

# Delete & Archive Solution

Nevertheless, some entities listed here are not yet _deletable_ through the UI it is 
still a valid consideration to take into account because of cascading triggers and future implementations
that may enable the user to delete them directly.

# Archive Metadata

Any archived entry that is moved to the schema `archive_jooliadb` is automatically enriched through triggers with the following fields:

+ deletedAt TIMESTAMP DEFAULT now()
+ deletedById VARCHAR(36) NOT NULL
+ requestId VARCHAR(24) NOT NULL

These fields exist __only__ in the archive schema and are created through the stored procedure `archive_jooliadb.update_tables`, see code in `db/procedures` and call in `db/update.sh`.

The `requestId` is generated on each request by the middleware [requestId](../RequestId.md).

The `deletedById` and `requestId` are consumed by all triggers. These variables are passed as session variables in the database connection.

    SET @joolia_user_id = ?; SET @joolia_request_id = ?;
    
This is done for every started transaction (almost every API call), see code in `controllers/utils`.

# What gets deleted or archived?

See JOOLIA-2383 to understand in which scenarios below the entries are deleted or archived. 
The `acceptance/archive` test suites are used to enforce the business requirements are fulfilled.

All cases described below are handled through [the Gravedigger middleware](Gravedigger.md).

## Case 1: Not referenced tables

Entries from these tables can be removed easily without any constraint violation.

	select t.TABLE_SCHEMA, t.TABLE_NAME
	from TABLES t
	where t.TABLE_SCHEMA = 'jooliadb'
	  and t.ENGINE is not null
	  and not exists(
	        select 1
	        from REFERENTIAL_CONSTRAINTS r
	        where r.CONSTRAINT_SCHEMA = t.TABLE_SCHEMA
	          and r.REFERENCED_TABLE_NAME = t.TABLE_NAME
	    );

Returns (this result may be outdated at any time):

+ canvas_submission
+ step_check
+ team_members_format_member
+ user_comment
+ user_libraries_library
+ user_rating
+ user_skill
+ workspace_member

### What should happen?

+ Entry is deleted from table
+ Entry can be optionally archived through __before delete__ triggers. See `format_member` trigger.
+ In general no __after delete__ triggers are needed

## Case 2: Referenced tables

Entries from these tables are referenced by others, hence it should have triggers
in place to delete those references beforehand. This will create a cascaded deleting
through the other triggers until reaches a constraint violation or all references are
archived properly.

	select t.TABLE_SCHEMA, t.TABLE_NAME
	from TABLES t
	where t.TABLE_SCHEMA = 'jooliadb'
	  and t.ENGINE is not null
	  and exists(
	        select 1
	        from REFERENTIAL_CONSTRAINTS r
	        where r.CONSTRAINT_SCHEMA = t.TABLE_SCHEMA
	          and r.REFERENCED_TABLE_NAME = t.TABLE_NAME
	    );
	    
Returns (this result may be outdated):

+ activity
+ activity_configuration
+ activity_template
+ canvas
+ canvas_slot
+ file_entry
+ format
+ format_member
+ format_template
+ key_visual_entry
+ library
+ link_entry
+ phase
+ phase_template
+ skill
+ step
+ submission
+ team
+ user
+ workspace

### Case 2.1: References that cannot be removed at all

In this case the trigger __must not have__ a statement to remove the foreign keys hence will raise an error
that is already translated into the HTTP 409 Conflict error.

__The entry will not be deleted nor archived, constraint violation will be raised.__

### Case 2.2: References can be nullified

Before deleting the parent key its references are nullified first, avoiding the constraint to fail. This is only an
option when the __Not Null__ constraint is not in place for the relation. Note that is __not possible__ to restore this
relation if needed.

__The entry will be deleted and its child references will remain in the main schema, FK will be nullified.__

### Case 2.3: References can be removed through the triggers

The before triggers will delete the foreign keys before removing the entry and archiving it.
For instance this is what happens with `format_member`, the trigger `format_member_bd_tg` will
remove the foreign keys from `step_check` and `team_members_format_member`.

__The entry and its child references are all archived if and only if the triggers are designed to cascade.__

### Case 2.4: References can be replaced

In this case the foreign key will be replaced. It will be replaced by a surrogate (faked) version of the entry being deleted.
Take for instances the templates, all them have a FK to the user table (createdById) hence you cannot remove
this user entry without removing first all templates related to this particular user.

How it works: just before removing the user entry the FK on each template is updated to a new
Identifier that points to this new surrogate user. This new surrogate entry hides the identity of the deleted entry through
anonymization process.

The surrogate entry created to fulfill the constraint will have as primary key value the `requestId` generated during
the API call. That means it is still possible to recover fully the deleted entry and its relations.

__The child entries will point to a surrogate (a replacement entry) to satisfy the constraint while keeping the child relations in the
main schema. Only the parent entry will be archived if its trigger is designed to do so. The restoration is achieved comparing the requestId in the archive with the primary key of the surrogate entry.__

TODO: Add a picture to illustrate this process.

