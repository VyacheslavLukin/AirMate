import React from "react";

class Index extends React.Component {
    render() {
        return (
            <div>
                <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
                    <a className="offset-5 col-sm-2 navbar-brand text-align-center" href="#">
                        <img src="/static/img/baum.svg" height="80px"/>
                    </a>
                    <button className="navbar-toggler" type="button" data-toggle="collapse"
                            data-target="#navbarsExampleDefault"
                            aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"/>
                    </button>
                </nav>

                <main role="main" className="container">
                    <div style={{
                        "paddingTop": "5rem"
                    }}>
                        {/*Map rendering*/}
                        <div id="map"/>
                    </div>
                </main>
            </div>
        );
    }
}

export default App;