# VUE 3 Template Project with Vue/CLI v.5.0.8

![REPO-TYPE](https://img.shields.io/badge/repo--type-template-blue?style=for-the-badge&logo=github)

This template project is a start base that help you to create a Microfrontend project with the use of the [Single-spa plug-in](https://single-spa.js.org/docs/ecosystem-vue/#vue-cli).
Use this template and follow this guide.

## Pre-requisites

Before you continue you need to

- have [NPM](https://www.npmjs.com/) installed
- have [NodeJS](https://nodejs.org/) installed (max version 16.20 for fully compatibility)
- have [Vue 3](https://vuejs.org/guide/introduction.html) and [Vue-CLI](https://cli.vuejs.org/guide/installation.html) installed
- have a [GitHub](https://github.com/) account
- use VisualStudio Code or IntelliJ Idea as your development IDE

## Creating an MF from VueJS template project

1. Use the **vuejs-microfrontend-template** project by clicking on button **Use this template** from [GitHub](https://github.com/digital-enabler/vuejs-microfrontend-template.git) and in the next page write a project name with this pattern `demf-[tool_name]`, write also a breaf description and select private type.

2. Now the new project root-config is created on GitHub, clone it on your local environment and make a branch from _main_ to start to work on it.

3. In your local IDE, open the **app/package.json** file and rename the project using the pattern name `@digital-enabler/demf-[tool_name]`

4. Open a **Terminal** window in the project folder and go inside the app folder, then launch the command: `npm install`

> NOTE: When install finished, do not care about the warnings on the versions and vulnerability problems reported, and DO NOT launch the `npm audit fix` or `npm audit fix –force commands`

5. At this point you can start customizing your project in VueJS, installing any additional libraries you need.

6. Once you have completed and verified that all the desired libraries have been correctly configured, you can proceed with its transformation into Microfrontend through the use of the [Single-spa plug-in](https://single-spa.js.org/docs/ecosystem-vue/#vue-cli).

```
vue add single-spa
```

The installation, in addition to installing the plugin, will involve modifying the package.json file and the main.js file to make them compliant with use within a microfrontend.

Alternatively to the command indicated you can use the VueUI browser interface to easily install the plugin: with the server turned off and the project not started, open the plugin section of the UI and look for the plugin _vue-cli-plugin-single-spa_, select it and proceed with the installation, following the instructions on the screen.

> **ATTENTION**: it is possible that during the installation of the plugin through the VueUI not all the imports of your original _main.js_, in particular of the i18n plugin, are reported. If this happens, just re-enter the missing imports, for example:
> `import i18n from "./i18n";`  
> Then invoke it as for the other imports listed by copying the i18n key into the appOptions object.

7. We can now verify the correct installation of the plugin by delivering the microfrontend through the command:

```
npm run serve
```

or by starting the Serve task from VueUI.

8. When the server is started, your microfrontend will be available at the URL _http://localhost:8080_. The page shown will contain the title **"Your Microfrontend is not here"** along with some instructions.

Now your new Microfrontend is ready to be customized and mounted on a root-config project. See [here](https://github.com/digital-enabler/root-config-template#root-config-template) for more information on how to mount your microfrontend on a root-config.

## Using Props

You can use _props_ shared by a _root-config_ project, to be used within the MF in a variety of ways, such as additional external information, so that they are already present at the time the MF is mounted.

Props are data that can be used to initialize and configure the MF from its mount. Generally, props are provided by the root-config and then declared in the route tag that defines the layout and visibility of the MF within the application. See [here](https://github.com/digital-enabler/root-config-template#root-config-template) for more information on how to mount your microfrontend on a root-config.

To use the props in the MF it is necessary to define them within the _main.js_ file in the appropriate props section, as well as in the example:

```
    ...
    const vueLifecycles = singleSpaVue({
      createApp,
      appOptions: {
        render() {
          return h(App, {
            mashupsListConfig: this.mashupsListConfig,
            palette: this.palette,
            realm: this.realm,
          });
        },
      },
      ...
      },
    });
    ...
```

The code shows the declaration of the three props: _mashupsListConfig_, _realm_ and _palette_. These three props must be forwarded in the MF code by adding the corresponding prop definitions within the **App.vue** file, as you usually declare a _prop_ in a VueJS component.

> Specifically _mashupsListConfig_ is an example of a way you can take to get an external configuration json file for use within your application, generally this is called [realm]-[mf_name]-config.json and is located in a storage space separate. The root-config application is programmed to load several configuration files from a specific storage.

## Configuring Vuetify Theme by Digital Enabler color palette

Only after its transformation into Microfrontend through the use of the [Single-spa plug-in](https://single-spa.js.org/docs/ecosystem-vue/#vue-cli),
it is possible to customize this MF application’s default text colors, surfaces, and more. Easily modify your Vuetify theme programmatically in real time by using the prop color palette coming from your _root-config_ project, as explained in the previous paragraph. You need to use a similar piece of code as below:

```
  ...
  handleInstance(app, props) {
    app.use(router);
    app.use(i18n);

    //Vuetify theme color palette
    const palette = props.palette;
    vuetify.theme.computedThemes.value.deTheme.colors.primary = palette.primary;
    vuetify.theme.computedThemes.value.deTheme.colors.secondary = palette.secondary;
    vuetify.theme.computedThemes.value.deTheme.colors.accent = palette.accent;
    vuetify.theme.computedThemes.value.deTheme.colors.error = palette.error;
    vuetify.theme.computedThemes.value.deTheme.colors.info = palette.info;
    vuetify.theme.computedThemes.value.deTheme.colors.success = palette.success;
    vuetify.theme.computedThemes.value.deTheme.colors.warning = palette.warning;
    app.use(vuetify);
  },
  ...
```

At this point you also need to add your modified theme inside your _vuetify.js_ file configuration, as described [here](https://vuetifyjs.com/en/features/theme/). The top code show that the _deTheme_ is modified at runtime so you need to add this theme as Application theme.

## Creating the [realm]-[mf_name]-config.json

There is a way you can take to get an external configuration json file for use within your application and it is throgh the _root-config_ application that is the main access point for every MF, see [here](https://github.com/digital-enabler/root-config-template#root-config-template) for more information.

Generally this file is named [realm]-[mf_name]-config.json and is located in a specific storage space separate. The _root-config_ application can be configured and is programmed to load several configuration files for every MF from the specific storage you set.

In this json file you can set all those static information necessary to your application working, an example could be:

```
{
   "mf": "Sidebar",
   "api": "//localhost:8083/api",
   "storageImgs": "https://storage.digital-enabler.eng.it/imgs",
   "links": [
      {
         "title": "labels.mashups",
         "icon": "mdi-file-tree",
         "link": "/"
      },
      ...
```

In this example you can see various information for your application

- the _"mf"_ key is the name of the microfrontend you need to use to register the configuration file in _root-config_ [here] (<https://github.com/digital-enabler/root-config-template#root-config-template>).

> This is a required key to use this file.

- _"api"_ is the URL if your MF uses external API.
- _"storageImgs"_ is the URL of an external image memory where you can put all your images.
- the _"links"_ in this case are an array of objects describing different links to be used in the application

and so on...

Except the first "mf" key which is mandatory, other information you put in the json file should be all static info you to use inside your application.

When you have finished writing all the necessary information into this file, you need to publish it to a remote repository and register it following the instructions [here](https://github.com/digital-enabler/root-config-template#root-config-template), so that it can be used via the _root-config_ application.

## Building Policy and Methodology

In order to get a build of the microfrontend project as light as possible and with clean and customizable code, in an easy way, even without having to recompile the MF, you need:

- remove any file that is not essential for building the project or that can, in any case, be regenerated during the build itself

- use external storage (e.g. AWS S3, DE MinIO, Github, etc.) for all those static elements such as images and json files

## Lints and fixes files

To find and fix problems in your JavaScript code you can use the **Lint** task inside the VueUI or the equal command line:

```
npm run lint
```

> It is suggested to use this task just before every commit/push to git.

## Build and Deployment

Once you _pushed_ all your code and merged it with the main branch, the Pipeline system will deploy the new microfrontend on the [NPM cloud](https://www.npmjs.com/search?q=digital-enabler) under the Digital-Enabler organization. NPM will store your public compiled code and here you can controll all versions of your MF.

If you go to the free CDN [JSDeliver](https://www.jsdelivr.com/) and try to search _@digital-enabler_ you will obtain the list of microfrontend for Digital Enabler with also the one you have deployed.
Open the detail of one project, and you can see every files contained on it.
Find the file named **app.js** and click the icon on the right side of the line. It will open a menu, select the _Copy URL_ to copy the URL of this file to clipboard.

You will obtain a URL like this one:

```
https://cdn.jsdelivr.net/npm/@digital-enabler/mashups-list@0.0.6/app.js
```

It usually have the pattern:

`https://cdn.jsdelivr.net/npm/@digital-enabler/[MF-project-name]@[MF-version]/app.js`

This is the URL you have to use inside a [root-config](https://github.com/digital-enabler/root-config-template/tree/doc/readme-documentation-guide#file-indexejs) if you want to mount a MF from external source. You can notice the version, so if you want to use a different version you simply can change it.

## Known Issues

For the following dependencies it is necessary to use the versions indicated that are currently the ONLY ones supported by the single-spa plugin used

| Plugin     | Version |
| ---------- | ------- |
| Vue-router | ^4.0.3  |

### This template includes listed dependecies:

    "@mdi/font": "5.9.55",
    "core-js": "^3.8.3",
    "roboto-fontface": "*",
    "vue": "^3.2.13",
    "vue-i18n": "^9.1.0",
    "vue-router": "^4.0.3",
    "vuetify": "^3.0.0",
