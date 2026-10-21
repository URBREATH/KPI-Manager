export default {
  methods: {
    //DISPATCHES
    setError(err, prevent, actionEv) {
      if (!err || err.response.status >= 500) {
        err = {
          response: {
            status: "500",
            statusText: "server_error",
          },
        };
      } else {
        document.dispatchEvent(
          new CustomEvent("error-" + err.message, {
            detail: {
              preventDefault: prevent | false,
              callbackEvent: actionEv,
              data: err,
            },
          })
        );
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
  },
};
