# Edumo RESTful API
> Modular RESTful API with Node, Express, Sequelize, Socket.IO, Javascript Standard Style and PostgreSQL

[![Node Version](https://img.shields.io/badge/node-%3E=%2014.16.1-success)](https://nodejs.org)


## Overview
1. Node.js v=18.13.0
2. Redis v=5.0.7
3. Written using ES6
4. Uses npm for package dependency management
5. Uses JavaScript Standard Style
6. Uses sequelize and sequelize-cli as ORM and data migration tool
7. Filename convention - camelCase should never be used. Uses snake_case for file.


## Development Environment Setup
1. Make sure you have nvm, node v18 or LTS version of node and redis-server installed
2. Install PostgreSql >= v9


## Quick Start
1. Clone the repository
2. Install the dependencies `npm install`
3. Copy `.env.example` `.env` and populate it with the correct credentials and settings
4. Create Databases `npx sequelize-cli db:create`
5. Run database migration `npx sequelize-cli db:migrate`
6. Run seeder `npx sequelize-cli db:seed:all`
7. Run the application in development mode with `npm run dev`


## Deploy
#### Process Manager (PM2)
1. `sudo npm install pm2 -g` - Install PM2
2. `pm2 startup` - Auto Start pm2 on boot
3. `npm run pm2:start` - Start an app
4. `pm2 save` - Freeze a process list for automatic respawn

#### Enable Port
1. `sudo ufw status` - Check ufw firewall
2. `sudo ufw allow {port}` - Open port


## Tech stack
* [Express](https://expressjs.com/) - Node Framweork
* [Nodemon](https://nodemon.io/) - Use for development file reload.
* [pg](https://www.npmjs.com/package/pg) - JavaScript and optional native libpq bindings
* [pg-hstore](https://www.npmjs.com/package/pg-hstore) - A node package for serializing and deserializing JSON data to hstore format
* [Sequalize](https://sequelize.org) - promise-based ORM for Node.js
* [Json Webtoken](https://github.com/auth0/node-jsonwebtoken) - An implementation of JSON Web Tokens.
* [Socket.IO](https://socket.io/) - Library that enables low-latency, bidirectional and event-based communication between a client and a server
* [Redis](https://redis.io/) - In-memory data store.


## JavaScript Standard Style
> [JavaScript Standard Style](https://standardjs.com) is a style guide with a linter and an automatic code fixer

### The Rules

* **2 spaces** – for indentation
* **Single quotes for strings** – except to avoid escaping
* **No unused variables** – this one catches tons of bugs!
* **No semicolons** 
* **Space after keywords** `if (condition) { ... }`
* **Space after function name** `function name (arg) { ... }`
* **Always use === instead of ==** – but `obj == null` is allowed to check `null || undefined`
* **Always handle the node.js err function parameter**
* And [more](https://standardjs.com/rules.html)

## Troubleshoot
* If you have issue with chromium run `node_modules/puppeteer/install.js`