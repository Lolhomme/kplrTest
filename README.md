# kplrTest
A webhook that handle payment tickets

## Info
J'ai utilisé cluster de node pour gérer le load balancing. Je voulais utiliser nginx à la base mais je me suis dit que c'était trop pour l'exercice demandé.

## Setup database
- brew install postgresql
- psql (to check if postgresql works)
- createdb <yourdb>

- create a .env file:
```
PGHOST='localhost'
PGUSER='machine-user'
PGDATABASE='yourdb'
PGPASSWORD=null
PGPORT=5432
PORT=3000
```

- npm run build
- npm start

