import React from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

export default function RadioButtons(props) {
  const [value, setValue] = React.useState('parameter');

  function handleChange(event) {
    setValue(event.target.value);
    props.changeParameter(event.target.value);
  }

  const buttons = []
  props.parameters.map(parameter => {
    buttons.push( <FormControlLabel style={{margin:'0.25em', height: '1em'}}
    value={parameter}
    control={<Radio color="primary" style={{height:'25px', color: 'red', margin: '1px'}}/>}
    label={parameter}
    // labelPlacement={parameter}
    /> );
  });
  
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend"><h4> Radio buttons test</h4> </FormLabel>
      <RadioGroup aria-label="position" name="position" value={value} onChange={handleChange} > 
        {buttons}
      </RadioGroup>
    </FormControl>
  ); //column="true"
}
