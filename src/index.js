import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import ApolloClient from "./ApolloClient";

ReactDOM.render(
  <React.StrictMode>
    <ApolloClient >
      <App />
    </ApolloClient >
  </React.StrictMode>,
  document.getElementById("root")
);
