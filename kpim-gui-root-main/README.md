# KPIM GUI

![REPO-TYPE](https://img.shields.io/badge/repo--type-template-blue?style=for-the-badge&logo=github)

This template project is a start base that help you to create a Root-Config project for Microfrontend with the use of the [Single-spa plug-in](https://single-spa.js.org/docs/ecosystem-vue/#vue-cli). The **root-config** exists only to start up the _single-spa applications_.
Use this template and follow this guide.

## Pre-requisites

- have [NPM](https://www.npmjs.com/) installed
- have a [GitHub](https://github.com/) account
- use VisualStudio Code or IntelliJ Idea as your development IDE
- Retrieve the URL where the microfrontend (MF) to be added is deployed.
- Using the Add-On Layout Engine in the root-config project (if not already installed).

## Creating a Tool Root-Config from template project

1. Use the **root-config-template** project by clicking on button **Use this template** from [GitHub](https://github.com/digital-enabler/root-config-template.git) and in the next page write a project name with this pattern `[tool_name]-gui`, write also a breaf description and select private type.

2. Now the new project root-config is created on GitHub, clone it on your local environment and make a branch from _main_ to start to work on it.

3. In your local IDE, open the **app/package.json** file and rename the project using the pattern name `@digital-enabler/[tool_name]-gui`; where _tool_name_ is the name of the tool like it is defined in the folder name inside the storage (like it is explained after)

4. Open a **Terminal** window in the project folder and go inside the app folder, then launch the command: `npm install`

> NOTE: When install finished, do not care about the warnings on the versions and vulnerability problems reported, and DO NOT launch the `npm audit fix` or `npm audit fix –force commands`

5. At this point you can start customizing your project and importing any Microfrontend (MF) you need.

## Tenant/Realm and Storage

In the **Digital-Enabler** framework every Tool or Application is focused with a particular **Tenant** or **Realm**. A **Tenant** is intended like a theme that groups a certain number of tools/application and these share the same features that could be colors, images, configurations, users login, authorizations etc...
These features are collected with a main configuration file (_config.json_), one for each Tenant folder, and several others specific configuration files, one for each Microfrontend that compose the Tool: _[realm]\_[tool_name]-config.json_.

All these config files usually are stored in a cloud storage wich is organized with a similar structure:

```
  STORAGE___
            |
            MF-TENANT-1
                |
                |____COMMON
                |____TOOL-1
                |       |_____tool1-import-map.json
                |       |_____mfA-config.json
                |       |_____mfB-config.json
                |       ...
                |____TOOL-2
                |____config.json
                ...
            ...
```

In the same storage and inside every tool name folder it is stored also the _[tool_name_acronym]-import-map.json_ file witch contain the path for all the MFs and the shared resources needed to the tool.

> NOTE: the _common_ folder contains al those MFs configs that are common with several Tools, for example a _common_footer-config.json_

> WARNING: For a local development we suggest to use your own storage (for example under GitHub) with the same structure shown above.
> To do this, in the project template we need to set the location of the **Storage** we want to use in the _root-config_ of our tool simply setting the **STORE_URL ENV variable** and put to _"true"_ the **DEVELOPER_MODE ENV variable** inside a _.env_ file. We can use the already present _.env.template_ file by set inside it the URL for the Storage and then renaming this file simply in _.env_ without the _.template_ extension.
> If this storage isn't set (and it shouldn't be set for a **production environment**) it is used the default Digital-Enabler storage.

## File Index.ejs (Import a microfrontend)

The **index.ejs** file allows you to manage the imports of various MFs, and other necessary resources, within the root-config project. By opening the file located inside the src folder, you have the ability to manage imports in two different ways, but both use at least the [SystemJS plugin](https://github.com/systemjs/systemjs).

### The first method

The first method inserts a script type = "systemjs-importmap" with explicit json code and with an imports object in which there is a key-value series to indicate each individual import.

For example:

```js
<% if (isLocal) { %>
    <script type="systemjs-importmap">
      {
        "imports": {
          "single-spa": "https://cdn.jsdelivr.net/npm/single-spa@5.9.0/lib/system/single-spa.min.js",
          "vue": "https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.min.js",
          "vue-router": "https://cdn.jsdelivr.net/npm/vue-router@3.5.3/dist/vue-router.min.js",
          "vuetify": "https://cdn.jsdelivr.net/npm/vuetify@2.6.5/dist/vuetify.min.js",
          "@digital-enabler/mashups-list": "http://localhost:9091/js/app.js",
          "@digital-enabler/root-config-gui": "http://localhost:9000/demf-root-config.js"
        }
      }
    </script>
<% } %>
```

This script thus defined, under the control of the _isLocal_ variable in the code, allows you to manage the imports of MFs but also of resources, for a local start of the root-config project.

As you can see last two key-value elements refers to local running projects, while the others resources have external references. This is useful when you are developing your local MF, so you can use external references for others resource and use local reference for your developing application.

> WARNING: This section of the index file overwrites the imports that are made with the second method.

### The second method

The second import method involves loading a remote json file called _`import-map.json`_. The name of this file varies by adding as a prefix the acronym of the name of the Tool to which the entire project refers.

For example, for the **Data Mashups Editor** tool whose acronym is **DME**, the file in question will have the following name: _`dme-import-map.json`_

The script with the attribute _type = "systemjs-importmap"_ for its loading, will point to a remote repository where the file is stored, whose content in json code is similar to the local import section described in the first method, with the only difference that the defined imports will all have remote URLs.

Here it is an example:

```json
{
  "imports": {
    "single-spa": "https://cdn.jsdelivr.net/npm/single-spa@5.9.0/lib/system/single-spa.min.js",
    "vue": "https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.min.js",
    "vue-router": "https://cdn.jsdelivr.net/npm/vue-router@3.5.3/dist/vue-router.min.js",
    "vuetify": "https://cdn.jsdelivr.net/npm/vuetify@2.6.5/dist/vuetify.min.js",
    "@digital-enabler/sidebar": "https://cdn.jsdelivr.net/npm/@digital-enabler/sidebar@0.0.10/app.js",
    "@digital-enabler/footer": "https://cdn.jsdelivr.net/npm/@digital-enabler/footer@0.0.9/app.js",
    "@digital-enabler/mashups-list": "https://cdn.jsdelivr.net/npm/@digital-enabler/mashups-list@0.0.6/app.js",
    "@digital-enabler/root-config-gui": "https://mashupsui.dev.dev-digital-enabler.eng.it/dme/demf-root-config.js"
  }
}
```

This file should be stored in a remote repository and accessed by the _index.ejs_ file by script code like this:

```js
<script
  type="systemjs-importmap"
  src="https://.../[mf-name]-import-map.json"
></script>
```

## Editing the _index.ejs_ file (Starting root-config locally)

This file is the access point of your application and its root file. You can start changing the title of you application by finding the code:

```html
<title>[extended_tool_name]</title>
```

and replace the text within title tags with the real extended tool name.

Now find the section of the file that begins with the following code:

```js
<% if (isLocal) { %>
    <script type="systemjs-importmap">
      {
           "imports": {
```

Enter an additional import for the new MF keeping in mind the following pattern:

    "[project_name]": "[URL_deploy]"

Where _project_name_ is the name as it was defined in the _package.json_ file of the MF you want to insert, while _URL_deploy_ is the URL that identifies the web address at which the deployed MF can be reached. See [here](https://github.com/digital-enabler/vuejs-microfrontend-template/tree/feat/adds-readme-guide#vue-js-template-project-with-vuecli-v4515) for more information on how to create a Microfrontend.

For example, to insert the MF with name @digital-enabler/demf-dme-mashup-list, I need to create a line within the imports section:

“@digital-enabler/demf-dme-mashup-list": “<http://localhost:8080/js/app.js>”

In this example the MF I want to insert is deployed locally on the same machine as the root-config.

> WARNING: Make sure you also have the key-value line used to refer to _demf-root-config.js_:
> `"@digital-enabler/root-config-gui":"http://localhost:9000/demf-root-config.js"`
> This reference is used within the _public/main.js_ file to securely load the _demf-root-config.js_ file which starts the entire application.

## Editing the [tool_name]-import-map.json file

The modification of the _import-map.json_ file for uploading imports remotely, must be done on the repository that stores it. In the json file, only MFs whose deployment URL is remote should be added.

> WARNING: A possible local URL into _import-map.json_ will give a console error when loading the microfrontend or the reosurce for the import entered.

> WARNING: Make sure you also have the key-value line used to refer to _demf-root-config.js_:
> `"@digital-enabler/root-config-gui":"https://[remote_application_url]/demf-root-config.js"`
> This reference is used within the _public/main.js_ file to securely load the _demf-root-config.js_ file which starts the entire application.

## File microfrontend-layout.html

The **microfrontend-layout.html** file allows you to manage the entire layout of the application.

The microfrontend tools developed for Digital Enabler use a root-config that uses the [Single-spa Add-On Layout Engine](https://single-spa.js.org/docs/layout-overview) to manage the layout and routing of the application.

With reference to the documentation of the layout engine, to add the html that allows you to view every single mirofrontend mounted by the root-engine, a route tag must be added to the structure of the html that defines the general layout:

```html
<route path="/">
  <application
    name="@digital-enabler/mashups-list"
    props="realm, palette, mashupsListConfig"
  ></application>
</route>
```

The code above shows the _path_ attribute of the _route_ tag, which defines the path that must be present in the browser url for the microfrontend defined in the _application_ tag to be shown on the page. Omitting the path attribute ensures that the MF is always visible when navigating the entire application.

In the _application_ tag, however, we note the _name_ attribute which must have the same label used in the _index.ejs_ file to import the MF, while the _props_ attribute lists the props (see [here]() for more information details) necessary for the correct operation of the MF to be displayed. The definitions of the props, shared with MF, occur in the file **demf-root-config.js**, described in the relevant section of this document.

### Welcome Loader

At beginning of the **microfrontend-layout.html** file there is a commented section with a tag whose id is _loaderApp_: this is a Welcome-Loader and if it is not commented it is shown before loading any MF.

Once it is shown, to hide the loader is need to dispatch an custom event with name "_hide-welcome-loader_": See the **Exposed listeners** section below.

## File demf-root-config.js

The **demf-root-config.js** calls the _start()_ api in order for applications to actually be mounted. Before start is called, applications will be loaded, but not bootstrapped/mounted/unmounted. The reason is to give you control over operations.

In this file we perform all those operations and load all configurations that we need to so that our MF applications have all the necessary data to run properly alone and together with other MFs.

It is important that every tool is customizable in relation with the tenant in wich it is used.
To do this we need to load all those configurations before to run a Tool and its MFs and this is do by the **demf-root-config.js** file.

This file retrieve the tenant in witch the tool is deployed from the browser URL. This URl is predefined and have the tenant specified at its secondo level. If the tenant isn't retrived, for example because you are on a local evironment, it is used the **dev** tenant.

We need to customize this file in the template for use it with our tool and in the retrived tenant.

We need to link the loaded configs to the **props** we want to share with others MFs. See [here](https://github.com/digital-enabler/vuejs-microfrontend-template#vue-js-template-project-with-vuecli-v4515) for more information about _props_.

Locate inside the file a portion of code similar to this:

```js
//Props to share with MFs (see microfrontend-layout.html)
let data = {
  props: {
    palette: realmConfigs.palette,
    realm: tenant,
    footerConfig: mfConfigArray["Footer"],
    sidebarConfig: mfConfigArray["Sidebar"],
    mashupsListConfig: mfConfigArray["Mashups List"],
    eventHandlerConfig: mfConfigArray["Event Handler"],
  },
};
```

In this example code we have a mapping between props and configs:
there is a _props_ object with a key-value serie.
At left _keys_ are the props names you can use in the _microfrontend-layout.html_ file to pass them at each MF, as you saw above.
While at right _values_ are the values you assign to props.
In particular the prop of type named xyzConfig, contain the _[realm]-[mf_name]-config.json_ with all the configs for the specific MF. And the string inside the code `mfConfigArray["String"]` is the value of the _mf_ key you find inside _[realm]-[mf_name]-config.json_, like it is explained [here](https://github.com/digital-enabler/vuejs-microfrontend-template#vue-js-template-project-with-vuecli-v4515).

## Exposed listeners

This is a listeners list that you can find inside _main.js_ file and activate with a _dispatchEvent_ using the relative name exposed.

- **mf-auth-mounted**: this listener intercept the event (after the Auth MF was mounted and let the user to login) then redirects to another configurable page or simply hides Welcome-Loader;
- **hide-welcome-loader**: listen to the Hide-Welcome-Loader event sent by any microfrontend and hides Welcome-Loader;

## Custom Style

You have the possibility to add your custom css styles putting these into the _/public/custom.css_ file.

## Run the project (Local running)

We can now verify the correct installation of the project by running it through the command:

```
npm run start
```

that use the script _start_ inside the package.json file.

When the server is started, your root-config project will be available at the URL _<http://localhost:9000>_. The page shown will contain the title **"Welcome
to your single-spa root config!"** along with some instructions.

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

## Build and Deploy with Pipeline

After pushing and merging this project on GitHub, it will be built and deployed via a CircleCI-based pipeline that will create an image on a remote Docker environment.
You can choose the name of the Docker image by opening the file _.circleci/config.yml_ and find this code:

```
defaults: &defaults
  environment:
    DOCKER_IMAGE: root-config-template-ui
```

Now you have to change the value of **DOCKER_IMAGE** with the name you want for your project image.

> NOTE: Inside the _.circleci_ folder, you find also a _default.conf_ file that is useful to solve a 404 error when you refresh the application page from browser refresh button.
