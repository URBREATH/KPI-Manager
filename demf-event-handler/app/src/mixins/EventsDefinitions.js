export default {
  data() {
    return {};
  },
  methods: {
    // Handles error events dispatched from other components or mixins.
    // If preventDefault is false, updates component state with error details.
    // If a callbackEvent is provided, triggers the corresponding action.
    functionEventAction(e) {
      // Event Prevent default false
      if (!e.detail.preventDefault) {
        this.activation = true;
        this.statusText = e.detail.data.statusText;
        // Added 'or' because calls with status 500 customize the response.
        this.statusMessage = e.detail.data?.data?.message || "";
        this.statusCode = e.detail.data.status;
      }
      // Callback event: triggers a custom action if specified
      if (e.detail.callbackEvent) {
        this.actionEvent(e.detail.callbackEvent);
      }
    },

    /** DISPATCHERS **/
    // Dispatches a custom event with the given action name.
    // Used to trigger follow-up actions after error handling.
    actionEvent(action) {
      document.dispatchEvent(
        new CustomEvent(action, {
          detail: { callbackEvent: action },
        }),
      );
    },
  },
  mounted() {
    /** LISTENERS **/

    /* CLIENT Errors */
    // Listener for 400 Bad Request
    // The server cannot process the request due to a client error
    document.addEventListener(
      "error-400",
      function (event) {
        this.functionEventAction(event);
      }.bind(this),
    );
    // Listener for 401 Unauthorized
    // The client must authenticate itself to get the requested response.
    document.addEventListener(
      "error-401",
      function (event) {
        this.functionEventAction(event);
      }.bind(this),
    );
    // Listener for 403 Forbidden
    // The client does not have access rights to the content, that is, it is unauthorized.
    document.addEventListener(
      "error-403",
      function (event) {
        this.functionEventAction(event);
      }.bind(this),
    );
    // Listener for 404 Not Found
    // The server can not find the requested resource. The URL is not recognized. In an API, mean that the endpoint is valid but the resource itself does not exist.
    document.addEventListener(
      "error-404",
      function (event) {
        this.functionEventAction(event);
      }.bind(this),
    );
    // Listener for 409 Conflict
    // This response is sent when a request conflicts with the current state of the server.
    document.addEventListener(
      "error-409",
      function (event) {
        this.functionEventAction(event);
      }.bind(this),
    );
    // Listener for 422 Conflict
    // This response is sent when a request conflicts with the current state of the server.
    document.addEventListener(
      "error-422",
      function (event) {
        this.functionEventAction(event);
      }.bind(this),
    );
    /* SERVER Errors */
    // Listener for 500s Internal Server Error
    document.addEventListener(
      "error-500",
      function (event) {
        this.functionEventAction(event);
      }.bind(this),
    );
  },
};
