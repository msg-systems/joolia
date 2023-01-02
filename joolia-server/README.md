# Joolia's API Server

This documentation is always a work in progress. If you see a problem, please fix it and make a Pull Request asap ;)

## Developer Guidelines

See in [Developer Guidelines](docs/DeveloperGuidelines.md).

## Install Dependencies & Build

    npm install && npm run build

## Local Development Environment

The Joolia server application relies on the following components:
1. A Redis database
2. A MySQL database
3. A file service (AWS S3)

and a couple of envrionment variables.

The instructions below show how to get up and running with these components.

For setting environment variables for local development, the tool
[dotenv-safe](https://www.npmjs.com/package/dotenv-safe) is used: Copy the
file `env.example` to `.env` and adjust the values of the environment
varialbes accordingly. Note that the `.env` file won't be committed to the git
repository, since is may contain confidential information.

Additionally, there's a Docker Compose file located in the `dev` folder.
You can use this to start both the Redis and MySQL DB with `docker-compose up`
from inside this folder. Note that you still have to set up the MySQL schema
as described below.

### Start Redis database

Currently only the chat implementation relies on Redis database hence depending
on your task you may skip this section.

#### Option 1: Vagrant

Note it's assumed you have vagrant installed in this case.

Inside the `dev` folder you can run the provided `vagrant` box that exposes a fresh database.

    vagrant up

#### Option 2: Docker

Note it's assumed you have docker installed in this case.

    docker run --rm -p 6379:6379 redis:5.0

### Start MySQL database

Joolia server requires an instance of MySQL database running locally. All
options below will start with empty schemas.

__Note__: In case you have used Vagrant to start the Redis database you
may skip this step. Vagrant configuration exposes both databases.

#### Option 0: Install MySQL Server & Client for your OS

+ https://dev.mysql.com/downloads/installer/

#### Option 1: Vagrant

Note it's assumed you have vagrant installed in this case.

Inside the `dev` folder you can run the provided `vagrant` box that exposes a fresh database.

    vagrant up
    
#### Option 2: Docker

Note it's assumed you have docker installed in this case.

    docker run --rm -p 3306:3306 -e MYSQL_ROOT_PASSWORD=admin -e MYSQL_DATABASE=jooliadb -e MYSQL_USER=joolia -e MYSQL_PASSWORD=12345 mysql:5.7 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

### Synchronize Schemas

Just run `npm run db:setup`. The script will handle creation of 
main and archive schema with the correct charset and collation. See further instructions in `db` folder.  
Be aware that if you work on a Windows OS, you will have to convert the shell scripts (in `dist/db` the files `update.sh`, `common.sh` and `configuration/ormconfig-dev-jooliadb.yml` to LF linefeed.
If you have issues, you can run a mysql docker image with:  

    docker build --force-rm --no-cache -t joolia_mysql_runner:1.0.0 docker/base-image

which will create an image with node and mysql, in which you can execute mysql commands.  Then with

    docker run --rm -it --network host -v ${PWD}:/joolia joolia_mysql_runner:1.0.0 ./joolia/dist/db/update.sh --migrate --no-schema-check --dev-environment

You can execute the schema sync script.

### Load Test Data

This is not mandatory but useful for local development.

    npm run fixtures
    
### File Service (AWS S3)

The File Service stores data in AWS S3 hence credentials for the development environment is needed only for testing file upload & download, ask the team. 

In a Linux OS you need something like:

    export AWS_ACCESS_KEY_ID=<ASK_TEAM>
    export AWS_SECRET_ACCESS_KEY=<ASK_TEAM> 

### Start Joolia Server

Finally.

    npm run start

There are other startup options. Check `package.json`. 

## API Documentation

After launch the documentation is served at <http://localhost:3000/api-docs>.

## Tips

### Jetbrains plugin

+ <https://plugins.jetbrains.com/plugin/10925-database-tools-and-sql>

### MySQL Workbench

A tool to display and manage the MySQL database.

https://dev.mysql.com/downloads/workbench/

### Debugging

### Webstorm

#### Debug transpiled JavaScript
Create a new Node.js Configuration

| Attribute       | Value             |
| --------------- | ----------------- |
| Node parameters | --inspect=5858    |
| Javascript file | dist/src/index.js |

Hit the debug button in the Run-Menu

#### Debug TypeScript

<https://www.jetbrains.com/help/webstorm/running-and-debugging-typescript.html>


#### Tips for Debugging

**- Activate express logging**

Open "Run/Debug Configuration" and add "Environment Variable"

| Name       | Value     |
| ---------- | ----------|
| DEBUG      | express:* |

**- Change local logging level**

Open "Run/Debug Configuration" and add "Environment Variable"

| Name       | Value  |
| -----------|--------|
| LOG_LEVEL  | silly  |


# Known Issues

## errno: 150 - Foreign key constraint is incorrectly formed

### Reason:

TypeORM is not able to synchronize the new version of the described models and relations to the previous data.

### Solution:

Drop the 'jooliadb' schema and run `npm run db:setup`.

**CAUTION**: Previous data will be lost. Save it or write a migration script based on the `update.sh`
output. See further instructions in `db` folder.
