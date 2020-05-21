import React from 'react';
import Button from 'react-bootstrap/Button';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

import Collapse from 'react-bootstrap/Collapse';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import * as T from 'commonTypes';
import {ParameterForm} from 'ParameterForm';

class CalculationRadio extends React.Component<{settings: T.settingsT}, {value: number}>{
    constructor(props){
        super(props);
        this.state = {value: this.props.settings.calculationSettings.calculationMethod};
    }
    setCalcMethod = (event) => {
        const value = parseInt(event.target.value);
        this.props.settings.calculationSettings.calculationMethod = value;
        this.setState({value: parseInt(event.target.value)});
    }
    render(){
        return(
            <ToggleButtonGroup toggle vertical type="radio" name="radio" value={this.state.value}>
                <ToggleButton onChange={this.setCalcMethod} type="radio" value={0}>
                Adams-Bashforth 5
                </ToggleButton>
                <ToggleButton onChange={this.setCalcMethod} type="radio" value={1}>
                Forward Euler
                </ToggleButton>
                <ToggleButton onChange={this.setCalcMethod} type="radio" value={2}>
                Runge-Kutta 2
                </ToggleButton>
                <ToggleButton onChange={this.setCalcMethod} type="radio" value={3}>
                Runge-Kutta 4
                </ToggleButton>
            </ToggleButtonGroup>
        );
    }
}

interface settingsBarState{open: boolean}
interface settingsBarProps{
    settings: T.settingsT,
}
export class SettingsBar extends React.Component<settingsBarProps, settingsBarState>{
    state = {open : true}; 
    valueIndex : number = 0; values : Readonly<Array<string>> = ["Hide: ", "Show: "]; // 0: Hide 1: Show
    toggleCollapse = () => {
        if(this.state.open){
            this.valueIndex = 1;
        }else{
            this.valueIndex = 0;
        }
        this.setState((current) => {return {open: !current.open}});
    }
    forms = {
        graphs : {
            distance : [
                ['min', 'Minimum Distance (m)'], ['max', 'Maximum Distance (m)'], ['stepSize', 'Step Size (m)']
            ]
        },
        calculations : [
            ['min', 'Minimum Launch Angle (°)'], ['max', 'Maximum Launch Angle (°)'], ['timeStep', 'Calculation Time Step (s)']
        ]
    }
    calcSettingsFinder = (id) => {
        if(id === 'timeStep'){
            return this.props.settings.calculationSettings.timeStep;
        }else{
            return this.props.settings.calculationSettings.launchAngle[id];
        }
    }
    setCalcMethod = (event) => {
        console.log(event);
    }
    render(){
        const handleGraphChange = (value: string, id: string) => {
            var numValue : number | undefined;
            if(value === ''){
                numValue = undefined;
            } else{
                numValue = parseFloat(value);
            }
            console.log(id, numValue);
            this.props.settings.distance[id] = numValue; 
        }
        const generateGraphForm = () => {
            return this.forms.graphs.distance.map((value, i) => {
                return(
                    <ParameterForm newValue={String(this.props.settings.distance[value[0]])} controlId={value[0]} key={i}
                    label={value[1]} type="number" handleValueChange={handleGraphChange}/>
                );
            });
        }
        const handleCalculationChange = (value: string, id: string) : void | string => {
            if(value === ''){return 'error';}
            const numValue = parseFloat(value);
            if(id === 'timeStep'){
                if(numValue <= 0){return 'error';}
                this.props.settings.calculationSettings.timeStep = numValue;
            }else{
                this.props.settings.calculationSettings.launchAngle[id] = numValue;
            }
        }
        const generateCalculationForm = () => {
            return this.forms.calculations.map((value, i) => {
                return(
                    <ParameterForm newValue={String(this.calcSettingsFinder(value[0]))} controlId={value[0]} key={i}
                    label={value[1]} type="number" handleValueChange={handleCalculationChange} labelWidth={6}/>
                );
            });
        }
        const handleRoundingChange = (value: string, id: string) : void | string => {
            let numValue : number | null = parseInt(value);
            if(numValue < 0){return 'error';} if(value === ''){numValue = null;}
            this.props.settings.format.rounding = numValue; 
        } 
        const handleShortNames = (event) => {
            this.props.settings.format.shortNames = event.target.checked;
        }

        let shortNamesDefault : string[] | undefined = undefined;
        if(this.props.settings.format.shortNames){
            shortNamesDefault=["0"];
        }
        return(<>
            <Button style={{width: "100%", paddingTop: "0.6rem", paddingBottom: "0.6rem", height: "3rem"}}
                    onClick={this.toggleCollapse}
                    aria-controls="collapseSettings"
                    aria-expanded={this.state.open}
                    className={this.state.open === true ? 'active' : ''}
                >{this.values[this.valueIndex] + 'Settings'}</Button>
            <Collapse in={this.state.open}><div id="collapseSettings">
                <Container style={{maxWidth: '100%'}}><Row>
                    <Col sm="6" style={{padding: 0}}>
                        <h3>Graphs</h3>
                        <Row>
                        <Col style={{paddingRight: 0}}>
                        <h4>Range Axis</h4>
                        {generateGraphForm()}
                        </Col>
                        <Col style={{padding: 0}}>
                        <h4>Labeling</h4>
                        <ToggleButtonGroup type="checkbox" vertical defaultValue={shortNamesDefault}>
                            <ToggleButton value="0" onChange={handleShortNames}>Short Names</ToggleButton>
                        </ToggleButtonGroup>
                        <ParameterForm newValue={String(this.props.settings.format.rounding)} controlId="rounding" label="Tooltip Rounding"
                        type="number" handleValueChange={handleRoundingChange} labelWidth={4}/>
                        </Col>
                        </Row>
                    </Col>
                    <Col style={{padding: 0}}>
                        <h3>Calculations</h3>
                        <Row>
                        <Col style={{padding: 0}}>
                        <h4>Numerical Parameters</h4>
                        {generateCalculationForm()}
                        </Col>
                        <Col sm="4" style={{paddingRight: 0, paddingLeft: 0}}>
                        <h4>Numerical Method</h4>
                        <CalculationRadio settings={this.props.settings}/>
                        </Col>
                        </Row>
                    </Col>
                </Row></Container>
            </div></Collapse> 
        </>);
    }
}

export default SettingsBar;