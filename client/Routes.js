import * as React from "react";
import {Switch} from "react-router-dom";
import AppWrapper from "./AppWrapper";
import IndexPage from "./components/IndexPage";
import PersonalPage from "./components/PersonalPage";

export const routes = (
    <AppWrapper>
        <Switch>
            <IndexPage path="/"/>
            <PersonalPage path="/personal"/>
        </Switch>
    </AppWrapper>
);
