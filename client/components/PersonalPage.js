import React from "react";

export default class IndexPage extends React.Component {
    constructor(state, props) {
        super(state, props);

        this.state = {

        };
    }

    render() {
        return (
            <div className="app-wrapper">
                <div id="map"/>
                <div id="leaflet-buttons-wrapper">
                    <input type="button" className={rawDataClass} value={rawDataValue}
                           onClick={() => {
                               this.toggleButton("showRawData");
                           }}
                    />
                    <input type="button" className={modelDataClass} value={modelDataValue}
                           onClick={() => {
                               this.toggleButton("showModelData");
                           }}
                    />
                </div>
            </div>
        );
    }
}