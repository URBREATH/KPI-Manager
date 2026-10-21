# Sidebar microfrontend

Digital Enabler - Sidebar microfrontend

### Digital Enabler - Sidebar microfrontend

The Sidebar microfrontend shows a sidebar with navigation to datasources, mashups, flows, services etc.
The Sidebar works within the DME tool in which it is mounted, and to work correctly it also needs the following microfrontends:[Mashups List](https://github.com/digital-enabler/demf-mashups-list),[Flows List](https://github.com/digital-enabler/demf-flows-list), [Datasources List](https://github.com/digital-enabler/demf-datasources-list) and [Auth] (https://github.com/digital-enabler/demf-auth)

> NOTE: See [here](https://github.com/digital-enabler/root-config-template) on how to mount a microfrontend and also [here](https://github.com/digital-enabler/vuejs-microfrontend-template/blob/main/README.md#vue-js-template-project-with-vuecli-v4515) to more info about Microfrontend application for Digital Enabler.

This project is also available from the following [CDN](https://cdn.jsdelivr.net/npm/@digital-enabler/sidebar@latest/app.js).

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

To work properly the Sidebar Microfrontend needs an _config.json_ file with this settings:

```json
{
  "mf": "Sidebar", // Name of the microfrontend used in root-config -gui.js file
  "api": "https://[generic_api_location]/api", // URL path to the backend api
  "storageImgs": "https://[storage_location]/imgs", // URL path to the images
  "jsonTools": "https://[storage_location]/demo/tools.json", // URL path to populate the list of services at the bottom of the sidebar
  "links": [ // Navigation links
    {
      "title": "labels.mashups", // The title that is in localized value
      "icon": "mdi-file-tree", // Icon next to the title
      "link": "/mashups" // Link that leads to the desired location
    },
    {
      "title": "labels.datasources",
      "icon": "mdi-database",
      "link": "/datasources"
    },
    {
      "title": "labels.flows",
      "icon": "mdi-transit-connection-horizontal",
      "link": "/flows"
    }
  ],
  "favorites": {
    "enabled": false, // Show or hide the favorite services
    "uri": "" // API for the favorite services
  },
  "logo": "/DataMashupEditor.svg", // URL of the logo of the Digital Enabler at the top of the sidebar when the sidebar is expanded
  "miniLogo": "/de-mini.svg", // URL of the mini-logo of the Digital Enabler at the top of the sidebar when the sidebar is collapsed
  "showServicesMenu": true // Show or hide the services menu
}
```



This json file must to be stored and set as described [here](https://github.com/digital-enabler/vuejs-microfrontend-template#vue-js-template-project-with-vuecli-v4515) and also [here](https://github.com/digital-enabler/root-config-template#root-config-template).
