import * as React from "react";
import {Switch} from "react-router-dom";
import AppWrapper from "./AppWrapper";
import IndexPage from "./components/IndexPage";

export const routes = (
  <AppWrapper>
    <Switch>
      <IndexPage path="/" />
    </Switch>
  </AppWrapper>
);
