# kplrTest
A webhook that handle payment tickets

> Using cluster from node js to handle load balancing


- brew install postgresql
- psql (to check if postgresql works)
- createdb <yourdb>

Create a .env file:

PGHOST='localhost'
PGUSER='machine-user'
PGDATABASE='yourdb'
PGPASSWORD=null
PGPORT=5432

PORT=3000

- npm run build
- npm start