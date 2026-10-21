# Auth microfrontend

### Digital Enabler - Authentication microfrontend

The Auth microfrontend creates a polling system that checks the status of the user session at a certain time interval and notifies with an event if this section has expired.
The Auth works in the background of the tool in which it is mounted.

> NOTE: See [here](https://github.com/digital-enabler/root-config-template) on how to mount a microfrontend and also [here](https://github.com/digital-enabler/vuejs-microfrontend-template/blob/main/README.md#vue-js-template-project-with-vuecli-v4515) to more info about Microfrontend application for Digital Enabler.

This project is also available from the following [CDN](https://cdn.jsdelivr.net/npm/@digital-enabler/auth@latest/app.js).

## Pre-requisites

Before you continue you need to

- have [NPM](https://www.npmjs.com/) installed
- have [NodeJS](https://nodejs.org/) installed
- have [VueJS](https://v2.vuejs.org/v2/guide/) and [Vue-CLI](https://cli.vuejs.org/guide/installation.html) installed
- have a [GitHub](https://github.com/) account
- use VisualStudio Code or IntelliJ Idea as your development IDE

## Project management

### Installation

Open a **Terminal** window in the project folder and go inside the app folder, then launch the command:

```
npm install
```

> NOTE: When install finished, do not care about the warnings on the versions and vulnerability problems reported, and DO NOT launch the `npm audit fix` or `npm audit fix –force commands`

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

> NOTE: Alternatively to the command indicated above you can use the VueUI browser interface

## Configs file

To work properly the Auth needs an _auth-config.json_ file with this settings:

```json
{
  "mf": "Auth",
  "api": "https://[generic_api_location]/api", //Url path to the backend api
}
```
This json file must to be stored and setted as described [here](https://github.com/digital-enabler/vuejs-microfrontend-template#vue-js-template-project-with-vuecli-v4515) and also [here](https://github.com/digital-enabler/root-config-template#root-config-template).

## Exposed listeners

This is a listeners list that you can activate with a _dispatchEvent_ using the relative name exposed.

- **error-login-callback**: calls a method to permit the user to login;
- **logout-callback**: calls a method to logout the user;
