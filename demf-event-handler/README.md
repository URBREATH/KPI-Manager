# Event Handler microfrontend

### Digital Enabler - Event Handler microfrontend

This Event Handler (EH) handles common errors returned by calls the server, they are:

- some Client error responses (400, 401, 403, 404, 409)
- all generic Server error responses (500–599)

The EH works in the background of the tool in which it is mounted. It remain listening for errors event listed above and make an event dispatch for those events that require a callback action or a user action.

> NOTE: See [here](https://github.com/digital-enabler/root-config-template) on how to mount a microfrontend.

This project is also available from the following [CDN](https://cdn.jsdelivr.net/npm/@digital-enabler/demf-event-handler@latest/app.js).

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

## How to trigger Event Handler

Since the EH listens for any error events with this `error-xyz` event name, whenever you want to alert an error in your application through you can invoke the Event-Handler with this method (or similar) from your calling application:

```js
    setError(err, prevent, actionEv) {
      if (!err || err.response.status >= 500) {
        err = {
          response: {
            status: "500",
            statusText: "server_error",
          },
        };
      }
      document.dispatchEvent(
        new CustomEvent("error-" + err.response.status, {
          detail: {
            preventDefault: prevent | false,
            callbackEvent: actionEv,
            data: err.response,
          },
        })
      );
    },
```

In particular you need to have to set 3 params that should be passed to a CustomEvent inside a dispatchEvent just like the code above.
The `err` param is the whole error object you obtain from the server invocation or something else; `prevent` param is a boolean _true/false_, if it is _true_ tells the EH that if the event is handled its default popup Alert is not be shown as it normally would be if its value is _false_ or not is present; the last param `actionEv` is the action that want be done after the event, and usually it must be a name of an **addEventListener** you want to activate.

> NOTE: the if of the method catch all errors from 500 and upper like a generic 500 error.

The invocation of this method should be something similar:

```js
    // If you not want to arise an Alert popup but you want to run an event *error-login-callback* that will be listened from an event listener with that name.
     ...})
        .catch((err) => {
          this.setError(err, true, "error-login-callback");
        });
    ...

    // If you not want to arise an Alert popup to inform the user of error.
    ...
    .catch((err) => {
          this.setError(err, false);
        });
    ...
```

For more info about CustomEvent you can click [here](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent).

## Configs

To work properly the Event Handler needs an _event-handler-config.json_ file with this settings:

```json
{
  "mf": "Event Handler",
  "api": "https://[generic_api_location]/api"
}
```

This json file must to be stored and setted as described [here](https://github.com/digital-enabler/vuejs-microfrontend-template#vue-js-template-project-with-vuecli-v4515) and also [here](https://github.com/digital-enabler/root-config-template#root-config-template).
