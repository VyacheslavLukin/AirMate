import style from '../App.css';
import React, {PureComponent} from 'react';

const onClick = e => {
  e.stopPropagation();
}

const defaultContainer = ({children}) => <div onClick={onClick} 
className='card'
>{children}</div>;

export default class ControlPanel extends PureComponent {
  _renderParametersButton = (parameter, index) => {
    return (
      <div key={`btn-${index}`} className="input" 
      >
        <input
          type="radio"
          name="parameter"
          id={`parameter-${index}`}
          defaultChecked={parameter === '-'}
          onClick={() => {  this.props.changeParameter(parameter)} }
        />
        <label htmlFor={`parameter-${index}`}>{parameter}</label>
      </div>
    );
  };

  _renderLayersButton = (layer, index) => {
    return (
      <div key={`btn-${index}`} className="input" >
        <input 
          type="radio"
          name="layer"
          id={`layer-${index}`}
          defaultChecked={layer === '-' || layer === 'circles'}
          onClick={() => { this.props.changeLayer(layer)} }
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
        <hr />
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