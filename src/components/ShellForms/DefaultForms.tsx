import React, {useState} from 'react';
import {Button, Form, Popover, OverlayTrigger, Col} from 'react-bootstrap';
import * as T from '../commonTypes';
import * as S from './Types';

function UpgradeSingle({active, name, img_target, onClick} : 
	{active: boolean, name: string, img_target: [string, string], onClick: () => void}){
	return (
	<figure onClick={() => {onClick()}}>
		<img src={`${process.env.PUBLIC_URL}/upgrades/${img_target[active?1:0]}.png`} alt={name}/>
		<figcaption>{name}</figcaption>
	</figure>);
}

function UpgradeColumn({column, value, rows_max, img_target, sendValue} : 
	{column: [string, string, any][], value: number, rows_max: number, img_target: [string, string], sendValue: (index: number) => void}){
	const [value_state, setValue] = useState(value);
	const changeSelected = (index: number) => {
		if (value_state !== index){
			sendValue(index);
			setValue(index);
		}
	}

	return (
		<div>
			{column.map((row, i: number) => {
				const name = row[1];
				return (
					<UpgradeSingle 
					key={i}
					active={i === value_state} 
					name={name} 
					img_target={img_target} 
					onClick={() => {changeSelected(i)}}/>
				);	
			})}
			{
				Array(rows_max - column.length).fill(<div style={{height: '60px', width: '60px'}}></div>)
			}
		</div>
	);
}

const upgrade_order = ['_Artillery', '_Hull', '_Torpedoes', '_Suo', '_Engine'];
const upgrade_img_src_table = Object.freeze({
	'_Artillery': ['icon_module_Artillery', 'icon_module_Artillery_installed'],
	'_Hull': ['icon_module_Hull', 'icon_module_Hull_installed'],
	'_Torpedoes': ['icon_module_Torpedoes', 'icon_module_Torpedoes_installed'],
	'_Suo': ['icon_module_Suo', 'icon_module_Suo_installed'],
	'_Engine': ['icon_module_Engine', 'icon_module_Engine_installed'] 
});

const UpgradeTable = React.forwardRef((
	{upgrades, values}: {upgrades: Record<string, [string, string, any][]>, values: Record<string, number>}, 
	ref) => {

	const upgrade_lists = Object.entries(upgrades);
	const rows_max: number = (()=>{
		let rows_max_current = 0;
		upgrade_lists.forEach(([type, data]) => {
			rows_max_current = Math.max(rows_max_current, data.length);
		});
		return rows_max_current;
	})();
	upgrade_lists.sort((a, b) => upgrade_order.indexOf(a[0]) - upgrade_order.indexOf(b[0]));
	
	const updateValue = (type: string, value: number) => {values[type] = value;}
	
	console.log('Rendering');
	return (
		<div style={{columnCount: upgrade_lists.length}}>
		{upgrade_lists.map(([type, data], i) => {
			console.log(type, data);
			return (
				<UpgradeColumn 
				key={i}
				column={data} 
				value={0} 
				rows_max={rows_max}
				img_target={upgrade_img_src_table[type]} 
				sendValue={(index: number) => {updateValue(type, index);}}
				/>
			);
		})}
		</div>
	);
});

interface defaultFormProps{
	controlId: string, keyProp: number, ariaLabel : string, children : string | JSX.Element, 
	defaultValue: string, defaultOptions: string[], defaultValues: string[], onChange: Function,
}
interface defaultFormState{
	options: string[], values: string[], value: string
}
export class DefaultForm extends React.PureComponent<defaultFormProps, defaultFormState> {
	public static defaultProps = {
		defaultValue : "", defaultOptions: [],
	}
	form = React.createRef<HTMLSelectElement>();
	state = {
		options: this.props.defaultOptions, values: this.props.defaultValues,
		value: this.props.defaultValue
	};
	handleChange = (event) => {
		event.stopPropagation();
		const newValue = event.target.value;
		this.setState((current) => {
			return {...current, value: newValue};
		});
		this.props.onChange(newValue, this.props.controlId);
	}
	updateOptions = (newOptions: string[], newValues: string[], newValue: string) => {
		this.setState(current => {
			return {options: newOptions, values: newValues, value: newValue};
		});
	}
	private addOptions = () => {
		const {state} = this;
		const singleOption = (option,i) => {
			return (
				<option aria-label={option} key={i} value={state.values[i]}>
					{option}
				</option>
			);
		}
		return () => state.options.map(singleOption);
	}
	render(){
		const {props} = this;
		return (
			<Form.Group className="form-inline" style={{marginBottom: ".25rem"}}>
				<Form.Label column sm="3">{props.children}</Form.Label>
				<Form.Control as="select" 
					aria-label={props.ariaLabel}
					onChange={this.handleChange} 
					ref={this.form} 
					style={{width: "70%"}} 
					value={this.state.value}>
					{this.addOptions()()}
				</Form.Control>
			</Form.Group>
		);
	}
	//componentDidUpdate(){}
}

const dataURL = "https://jcw780.github.io/LiveGameData2/data_upgrades/"

const fetchJsonData = (target) => {
    return fetch(target)
        .then((response) => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
			}
            return response.json();
		})
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
        }
    );
}

const getTier = (str : string) : number => {
	return parseInt(str.substring(
		str.lastIndexOf("(") + 1, str.lastIndexOf(")")
	));
}

enum singleFormIndex {name, ref, queryIndex}
type singleFormT = [string, React.RefObject<DefaultForm>, number]
type defaultFormType = T.defaultFormGeneric<singleFormT>
interface defaultShipsProps {
	sendDefault: Function, reset: Function, formatSettings: T.formatSettingsT
	index: number, keyProp: number, defaultData: S.defaultDataT
}

export class DefaultShips extends React.PureComponent<defaultShipsProps> {
	defaultForms : defaultFormType = Object.seal({
		version:   ['Version'   , React.createRef<DefaultForm>(), 0],
		nation:    ['Nation'    , React.createRef<DefaultForm>(), 1], 
		shipType:  ['Type'      , React.createRef<DefaultForm>(), 2], 
		ship:      ['Ship'      , React.createRef<DefaultForm>(), 3], 
		artillery: ['Artillery' , React.createRef<DefaultForm>(), 4], 
		shellType: ['Shell Type', React.createRef<DefaultForm>(), 5],
	})
	changeForm = async (value: string, id: keyof(defaultFormType)) => {
		//this.defaultForms[id][singleFormIndex.value] = value;
		let queryIndex = this.defaultForms[id][singleFormIndex.queryIndex];
		const {defaultData} = this.props;
		if(queryIndex === 0){
			defaultData.queriedData = await fetchJsonData(
				`${dataURL}${value}_s.json`);
		}
		defaultData[id][S.DefaultDataRowI.value] = value;
		// Now iterative - instead of waiting for rerenders and clogging stack depth
		for(; queryIndex <= 5; ++queryIndex){
			this.postVersion(queryIndex)();
		}
	}
	updateForm = (target: keyof(defaultFormType), options: string[], values: string[]) => {
		const {current} = this.defaultForms[target][singleFormIndex.ref];
		if(current){ 
			//apparently prevents async calls from updating deleted refs I guess...
			//fixes delete ship crash bug
			const targetData = this.props.defaultData[target]
			let newValue = targetData[S.DefaultDataRowI.value];
			if(!values.includes(newValue)){
				if(target !== 'ship') newValue = values[0];
				else{
					const oldOption = targetData[S.DefaultDataRowI.options][
						targetData[S.DefaultDataRowI.values].indexOf(newValue)
					];
					const oldTier = getTier(oldOption);
					let found = false;
					for(const [i, option] of options.entries()) {
						const tier = getTier(option);
						if(oldTier === tier){
							found = true;
							newValue = values[i];
							break;
						}
					}
					if(!found) newValue = values[0];
				}
			}
			targetData[S.DefaultDataRowI.options] = options;
			targetData[S.DefaultDataRowI.values] = values;
			targetData[S.DefaultDataRowI.value] = newValue;
			
			current.updateOptions(options, values, newValue);
		}
	}
	queryVersion = async () => { //probably should be called initialize since it is never called ever again...
		const data = await fetchJsonData(`${dataURL}versions.json`);
		const reversed = data.reverse();
		this.updateForm('version', reversed, reversed);
		this.changeForm(reversed[0], 'version');
	}
	postVersion = (index: number) => {
		const {props} = this;
		const dData = props.defaultData, qDataS = dData.queriedData.ships, 
			DDI = S.DefaultDataRowI.value;
		const queryNation = () => {
			const options = Object.keys(qDataS);
			this.updateForm('nation', options, options);
		}
		//Aggressive length shortening
		const nation = dData.nation[DDI], type = dData.shipType[DDI],
			ship = dData.ship[DDI], artillery = dData.artillery[DDI],
			shellType = dData.shellType[DDI];
		const queryType = () => {
			const options = Object.keys(qDataS[nation]);
			this.updateForm('shipType', options, options);
		}
		const queryShip = () => {
			const ships = qDataS[nation][type];
			const values = Object.keys(ships), options : string[] = [];
			values.sort((a, b) => {return ships[a].Tier - ships[b].Tier});
			if(props.formatSettings.shortNames){
				values.forEach((ship, i) => {options.push(`(${ships[ship].Tier}) ${ships[ship].Name}`);});
			}else{
				values.forEach((ship, i) => {options.push(`(${ships[ship].Tier}) ${ship}`);});
			}
			this.updateForm('ship', options, values);
		}
		const queryArtillery = () => {
			const options = Object.keys(qDataS[nation][type][ship].artillery);
			this.updateForm('artillery', options, options);
		}
		const queryShellType = () => {
			const options = Object.keys(qDataS[nation][type][ship].artillery[artillery].shells);
			this.updateForm('shellType', options, options);
		}
		const sendData = () => {
			const shellName = qDataS[nation][type][ship].artillery[artillery].shells[shellType];
			const dispersionData = {}
			const artilleryData = qDataS[nation][type][ship].artillery[artillery];
			for(const [k,v] of Object.entries(artilleryData)){
				if(k !== 'shells') dispersionData[k] = v;
			}

			let name = ship;
			if(props.formatSettings.shortNames){
				name = qDataS[nation][type][ship].Name
			}

			this.props.sendDefault({...dData.queriedData.shells[shellName], ...dispersionData}, name);
		}
		const queries = [
			queryNation, queryType, queryShip,
			queryArtillery, queryShellType, sendData
		];
		return queries[index];
	}
	private addDefaultForms = () => {
		const {defaultData} = this.props;
		const singleForm = ([name, v] : [keyof(defaultFormType), singleFormT], i) : JSX.Element => {
			const form = defaultData[name], DDI = S.DefaultDataRowI;
			return (
			<DefaultForm key={i} 
				keyProp={this.props.keyProp} 
				controlId={name} 
				ref={v[singleFormIndex.ref]}
				ariaLabel={v[singleFormIndex.name]} 
				onChange={this.changeForm} 
				defaultValue={form[DDI.value]}
				defaultOptions={form[DDI.options]}
				defaultValues={form[DDI.values]}>
				{v[singleFormIndex.name]}
			</DefaultForm>
			);
		}
		//const run = () => Object.entries(this.defaultForms).map(singleForm); return run;
		return <>
			{singleForm(['version', this.defaultForms.version], 0)}
			{singleForm(['nation', this.defaultForms.nation], 1)}
			{singleForm(['shipType', this.defaultForms.shipType], 2)}
			{singleForm(['ship', this.defaultForms.ship], 3)}
			<OverlayTrigger trigger="click" placement="bottom-start" overlay={
				<Popover>
					<Popover.Content>
					<UpgradeTable upgrades={{
                        "_Torpedoes": [
                            [
                                "PWUT401_DD5_TORP_STOCK",
                                "Torped M1913 mod\u00a01",
                                {
                                    "components": {}
                                }
                            ],
                            [
                                "PWUT402_DD5_TORP_TOP",
                                "Torped M1929",
                                {
                                    "components": {}
                                }
                            ]
                        ],
                        "_Suo": [
                            [
                                "PWUS401_DD5_SUO_STOCK",
                                "SUO Mk\u00a05 Mod.\u00a01",
                                {
                                    "components": {
                                        "fireControl": [
                                            "AB1_FireControl"
                                        ]
                                    }
                                }
                            ],
                            [
                                "PWUS402_DD5_SUO_TOP",
                                "SUO Mk\u00a05 Mod.\u00a02",
                                {
                                    "components": {
                                        "fireControl": [
                                            "AB2_FireControl"
                                        ]
                                    }
                                }
                            ]
                        ],
                        "_Engine": [
                            [
                                "PWUE401_DD5_ENG_STOCK",
                                "Propulsion: 36,000 hp",
                                {
                                    "components": {}
                                }
                            ]
                        ],
                        "_Artillery": [
                            [
                                "PWUA402_DD5_ART_TOP",
                                "120 mm/50 Bofors M1924",
                                {
                                    "components": {
                                        "artillery": [
                                            "A1_Artillery",
                                            "B1_Artillery"
                                        ]
                                    }
                                }
                            ]
                        ],
                        "_Hull": [
                            [
                                "PWUH401_DD5_HULL_STOCK",
                                "Visby (A)",
                                {
                                    "components": {
                                        "artillery": [
                                            "A1_Artillery"
                                        ]
                                    }
                                }
                            ],
                            [
                                "PWUH402_DD5_HULL_TOP",
                                "Visby (B)",
                                {
                                    "components": {
                                        "artillery": [
                                            "B1_Artillery"
                                        ]
                                    }
                                }
                            ]
                        ]
                    }} values={{"_Engine": 0, "_Hull": 0, "_Artillery": 0, "_Suo": 0}}
					/>
					</Popover.Content>
				</Popover>
				}
			>
				<Button className="footer-button btn-custom-blue" variant="warning" >
					Ship Upgrades
				</Button>
			</OverlayTrigger>
			{singleForm(['artillery', this.defaultForms.artillery], 4)}
			{singleForm(['shellType', this.defaultForms.shellType], 5)}
		</>;
	}
	render(){
		return(<>{this.addDefaultForms()}</>);
	}
	//componentDidUpdate(){}
}

export default DefaultShips;