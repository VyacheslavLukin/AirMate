import React from "react";

export default class Navbar extends React.Component {
    render() {
        return (<nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
                <img className="offset-5 col-sm-2 text-align-center" src="/static/img/baum.svg" height="80rem"/>
            </nav>
        );
    }
}