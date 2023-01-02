# Developer Guidelines

This document is a best effort from lessons learned. It is a living document,
help to maintain, please.

# Good Practices / Tips

+ Run `npm ci` whenever you checkout a new branch/code.

## Models

Model files should be kept as simple as possible. Only declare fields that will be a column or a constraint
in the database.

### OneToMany/ManyToOne TypeORM Annotations.

If you want to use @OneToMany, @ManyToOne is required. However, the inverse is not required: If you only care about
the @ManyToOne relationship, you can define it without having @OneToMany on the related entity.

## Repositories

Each repository should be bound to a specific Entity hence inherits from `AbstractRepo`.
Always give preference to the methods `saveEntity`, `deleteEntity` and `patchEntity`
whenever these operations are needed.

## Controllers

Controller depends on Repositories to fetch data and build responses.

## Response Builders

Controllers should reply through a `ResponseBuilder` that has the knowledge to serialize
the correct Response instance based on the input data queried from the Repositories.

## Routes

TBD

## Fixtures

Make sure you understand the basics of [TypeORM fixtures Cli](https://github.com/RobinCK/typeorm-fixtures).

## General Considerations

### Fixtures

#### Avoid fancy Date formats

Use the standard [ISO_8601](https://en.wikipedia.org/wiki/ISO_8601).

#### When adding a new fixture avoid expliciting an ID field

Rationale: The _TypeORM fixtures Cli_ takes care of this automatically hence
avoids manual introduced, duplicated or malformed UUIDs. 

Use tools like [UUID Generator](https://www.uuidgenerator.net).

### DB Tools

All those tools are called through `npm run`.

#### db:sync

Use this to have the database synchronize when you made some model changes __and__
still do not have yet the migration in place.

#### db:setup

Use this often when you need to start a new development in a branch or just
need an empty database state. If model has changed you need the migrations.

#### fixtures

Populate the database with fixtures to run tests locally along with the web
client.
