import React, {Suspense} from 'react';
import {Form, Col, Row} from 'react-bootstrap';
import clonedeep from 'lodash.clonedeep';

import * as S from './Types';
import {ParameterForm} from '../UtilityComponents/ParameterForm';
import DownloadButton from '../UtilityComponents/DownloadButton';

const GeneralTooltip = React.lazy(() => import('../UtilityComponents/Tooltips'));

interface shellParametersProps {handleValueChange: any, formLabels : S.formLabelsT, formData: S.formDataT}
export class ShellParameters extends React.PureComponent<shellParametersProps>{
	nameForm = React.createRef<ParameterForm>();
	downloadRef = React.createRef<DownloadButton>();
	handleValueChange = (value, k) => {this.props.handleValueChange(value, k);}
	updateShells() {
		const props = this.props;
		const updateItem = ([key, value] : [S.formsT, S.labelT]): void => {
			value[S.labelI.ref].current!.updateValue(props.formData[key]);
		}
		const run = () => Object.entries(props.formLabels).forEach(updateItem);
		return run();
	}
	updateDownloadJSON = () => {
		const formData = this.props.formData, selectedData = clonedeep(FormData); delete selectedData.colors;
        const url = URL.createObjectURL(new Blob([JSON.stringify(selectedData)], {type: 'text/json;charset=utf-8'}));
        this.downloadRef.current!.update(url, formData.name + '.json');
	}
	addForms = () => {
		const props = this.props;
		const singleForm = ([key, value] : [S.formsT, S.labelT], i) => {
			const name = value[S.labelI.name];
			return (
			<ParameterForm key={i} controlId={key} ref={value[S.labelI.ref]}
				newValue={String(props.formData[key])}
				handleValueChange={this.handleValueChange} 
				type="number" append={value[S.labelI.unit]}
				style={{inputGroup:{width: "50%"}}} ariaLabel={name}>
                    <Suspense fallback={<div>Loading...</div>}>
                        <GeneralTooltip title={name} content={value[S.labelI.description]}>
                            <div>{name}</div>
                        </GeneralTooltip>
                    </Suspense>
			</ParameterForm>);
		}
		const run = () => Object.entries(props.formLabels).map(singleForm); return run();
	}
	render() {
		return(
<>
	<Form>
		{this.addForms()}	
	</Form>
	<Row>
		<Col sm="3"/>
		<Col sm="6">
		<DownloadButton label="Download Raw" updateData={this.updateDownloadJSON} ref={this.downloadRef} style={{width: "100%"}}/>
		</Col>
		<Col sm="3"/>
	</Row>
</>
		);
	}
}

export type ShellParametersT = ShellParameters;

export default ShellParameters;