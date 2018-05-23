import React, {Component} from "react";

export default class AppWrapper extends Component {
  render() {
    return <div className="app-wrapper">{this.props.children}</div>;
  }
}
