import style from '../App.css';
import React, {PureComponent} from 'react';

const defaultContainer = ({children}) => <div className={style['control-panel']}>{children}</div>;

export default class ControlPanel extends PureComponent {
  _renderParametersButton = (parameter, index) => {
    return (
        //TODO check if there's an index
      <div key={`btn-${index}`} className="input">
        <input
          type="radio"
          name="parameter"
          id={`parameter-${index}`}
          //TODO: perhaps better to render layers button differently
          defaultChecked={parameter === '-'}
          onClick={() => this.props.changeParameter(parameter)}
        />
        <label htmlFor={`parameter-${index}`}>{parameter}</label>
      </div>
    );
  };

  _renderLayersButton = (layer, index) => {
    return (
        //TODO check if there's an index
      <div key={`btn-${index}`} className="input" >
        <input 
          type="radio"
          name="layer"
          id={`layer-${index}`}
          //TODO: perhaps better to render layers button differently
          defaultChecked={layer === '-' || layer === 'circles'}
          onClick={() => this.props.changeLayer(layer)}
        />
        <label htmlFor={`layer-${index}`}>{layer}</label>
      </div>
    );
  };

  render() {
    const Container = this.props.containerComponent || defaultContainer;

    return (
        <Container>
        <h3>Airmate</h3>
        <p>Choose a parameter and a layer</p>
        {/* <div className="source-link">
          <a
            href="https://github.com/VyacheslavLukin/AirMate"
            target="_new"
          >
            View Code ↗
          </a>
        </div> */}
        <hr />

        {/* {CITIES.filter(city => city.state === 'California').map(this._renderButton)} */}
        <div style={{display:'flex'}}>
            <span>
                {this.props.parameters ? this.props.parameters.map(this._renderParametersButton) : null}
            </span>
            <span style={{marginLeft: 'auto', marginRight: '2em'}}>
                {this.props.layers ? this.props.layers.map(this._renderLayersButton) : null}
            </span>
        </div>
      </Container>
    );
  }
}