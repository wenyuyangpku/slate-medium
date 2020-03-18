import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { Provider } from "react-redux";
import * as serviceWorker from "./serviceWorker";
import { Switch, Route, BrowserRouter as Router } from "react-router-dom";

import Home from "./components/home";
import NewBlog from "./components/newBlog";

import store from "./reducer/store";

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Switch>
        <Route exact path="/">
          <Home></Home>
        </Route>
        <Route exact path="/new-blog">
          <NewBlog></NewBlog>
        </Route>
      </Switch>
    </Router>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
