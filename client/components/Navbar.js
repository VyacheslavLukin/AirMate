import React from "react";
import {Link} from "react-router-dom";

export default class Navbar extends React.Component {
    render() {
        return (<nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top navbar-extra">
                <img className="offset-5 col-sm-2 text-align-center" src="/static/img/baum.svg" style={{
                    height: "100%"
                }}/>
                <ul className="navbar-nav mr-auto">
                    <li className="nav-item active">
                        <Link className="nav-link" to="/personal">Personal <span className="sr-only">(current)</span></Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/">Home <span className="sr-only">(current)</span></Link>
                    </li>
                </ul>
            </nav>
        );
    }
}