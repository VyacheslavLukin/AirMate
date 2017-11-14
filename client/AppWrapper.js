import React, { Component } from "react";

export default class AppWrapper extends Component {
    render() {
        return <div>{this.props.children}</div>;
    }
}
