# habla-backend
Habla backend

# Downloading and running

1. Clone the repo.
1. Run `yarn install`.
1. Make sure to have the file `service-account.json` at `/secrets/firebase/`. You can find this file at the project settings page on firebase console. **Do not share or upload this file.**
1. Make sure to have PostgreSQL running. You'll need a user called `habla`, with the password `habla` and a database called `habla` assigned to this user.
1. Run the following query in your database: `CREATE EXTENSION postgis;`. This will enable the geographic library used in the project's database.
1. Run `yarn dev` or `yarn start` (see scripts in `package.json`)

# Using the API

The API is made with Apollo GraphQL. You can access `http://localhost:3000/graphql` and test the queries and mutations. 
**Please notice that a valid authorization (firebase token) will be required in the request headers. Location information is required for some queries and mutations.**

