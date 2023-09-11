# TODO APP

## Description

This is a simple todo app that allows you to add, edit, and delete tasks.

## Installation
Make sure you change the connection string in the `prisma/schema.prisma` file to your local postgres database and environment variables in the `.env` file

### For local postgres database

1. Clone the repository
2. Run `yarn install`
3. Run `npx prisma migrate dev --name init` (optional)
4. RUN `npx prisma generate`
5. Run `npx prisma deploy`
6. Run `yarn start`

### For docker postgres database

1. Clone the repository
2. Run `yarn install`
3. Run `npx prisma migrate dev --name init` (optional)
4. RUN `npx prisma generate`
5. Run `npx prisma deploy`
6. Run `docker-compose up -d`

## Usage

1. Go to `http://localhost:3005`
2. You can create a user by using the swagger.
3. You can login by using the swagger.
4. You can create a task by using the swagger.
5. You can get all tasks by using the swagger.
