# Persona
> *a character assumed by an author in a written work* – [Merriam-Webster dictionary](https://www.merriam-webster.com/dictionary/persona)



## Web application for gathering and presenting data about life events of creative persons

## Project structure

- Client application (frontend / UI) code is in [front](/front).

- Server application (backend / API) code is in [back](/back).


Both apps are written in modern JavaScript and tested withe the latest LTS versions of [NodeJS](https://nodejs.org/) (v14 and v16). The client needs NodeJS to be built into static bundle, the server runs on NodeJS.

## Deployment

The example script that gets the code from [Github](https://github.com/yaskevich/persona), builds the client app bundle and runs the server is in [deploy-persona.sh](/deploy-persona.sh) file. **Note**: it uses [PM2](https://pm2.keymetrics.io) as a globally installed package, you should install it manually before running the script. Otherwise, you have to modify the code for using `nodemon` or directly `node`, but it is not recommended for production.

### Client application

It is a JavaScript UI application written with [Vue 3](https://v3.vuejs.org) framework and [Element Plus](https://element-plus.org/) component library. Build tool is [Vite](https://vitejs.dev).

#### Internationalization

The client application supports localization, currently **English** and **Russian** locales are provided. The list of supported languages and corresponding translations of UI texts are stored in [i18n.json](/front/src/i18n.json) file. One can easily add a new language, putting new language name to *languages* array and extending an array of every UI element translation with new item in *dictionary* object.

#### Serving client code

At first, install all necessary NodeJS modules: `npm install`

To build the static bundle run:

`npm run build`

To start development and run the app in hot-reload mode:

`npm run dev`

To serve client code locally:

`npm run serve`

### Server application

This is an [ExpressJS](https://expressjs.com/) application that stores data in a database and controls an access to the data with JSON Web Token. User passwords are not stored in the database, just hashes.

The only external dependency of the app is [PostgreSQL](https://www.postgresql.org) server v9.6+. Once it is installed and the database is created, you have to provide environmental variables either via `.env` file, or by putting it in `ecosystem.config.cjs`, or providing them in other way – it depends on how you are going to run the application.

Thus, running with [nodemon](https://www.npmjs.com/package/nodemon):

`nodemon index.js`

With [PM2](https://pm2.keymetrics.io):

`pm2 start ecosystem.config.cjs`

There is a list of the variables, with example values:
```
PGUSER=database_user
PGPASSWORD=......
PGDATABASE=database_name
PGPORT=5432
PORT=8080
JWT_SECRET=test
```

Keep in mind, before running the app one should install all necessary NodeJS modules with `npm install`

### Web-proxy

As a rule, there is more than one application running on a single server, so it is a good practice to set up NodeJS apps so they are covered by frontend web-proxy server such as *Apache* or *Nginx*, working on the same IP, but serving different virtual hosts.

For example, running **Persona** under *Nginx* would require setting up *proxy_pass* directive for *location* like this:

```proxy_pass http://127.0.0.1:8080;```

------

## Resources

The favicon of the client application was generated via [Favicon.io](https://favicon.io) web-service using the following font:

- Font Title: Aleo
- Font Author: Copyright 2018 The Aleo Project Authors (https://github.com/AlessioLaiso/aleo)
- Font Source: http://fonts.gstatic.com/s/aleo/v4/c4mv1nF8G8_s8ArD0D1ogoY.ttf
- Font License: SIL Open Font License, 1.1 (http://scripts.sil.org/OFL)
