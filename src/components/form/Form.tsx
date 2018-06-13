import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';

import NotificationActions from 'actions/NotificationActions';

import { normalizeSettingValueMap, parseDefinitions, parseFieldOptions } from 'utils/FormUtils';
import t from 'utils/tcomb-form';

import './style.css';

const TcombForm = t.form.Form;


export type FormFieldSettingHandler = (key: string, definitions: API.SettingDefinition[], formValue: UI.FormValue) => void;
export type FormSaveHandler = (changedFields: UI.FormValueMap, allFields: UI.FormValueMap) => Promise<void>;
export type FormFieldChangeHandler = (key: string, formValue: UI.FormValueMap, valueChanged: boolean) => void | Promise<API.SettingValueMap>;
export type FormSourceValueUpdateHandler = (sourceValue: UI.FormValueMap) => void;

export interface FormProps {
  fieldDefinitions: API.SettingDefinition[];
  value: API.SettingValueMap;
  onSave: FormSaveHandler;
  onSourceValueUpdated?: FormSourceValueUpdateHandler;
  onFieldSetting?: FormFieldSettingHandler;
  onFieldChanged?: FormFieldChangeHandler;
  title?: string;
  className?: string;
}

interface State {
  error: APISocket.ErrorFull | null;
  formValue: UI.FormValueMap;
}

class Form extends React.Component<FormProps> {
  static propTypes = {
    /**
		 * Form items to list
		 */
    fieldDefinitions: PropTypes.array.isRequired,

    /**
		 * Optional callback for appending field settings
		 * Receives the field key, field definitions and the current form value as parameters
		 */
    onFieldSetting: PropTypes.func,

    /**
		 * Called when the form is saved
		 * Receives the changed fields as parameter
		 * Must return promise
		 */
    onSave: PropTypes.func.isRequired,

    /**
		 * Optional callback that is called when a field value was changed
		 * Receives the field key, current form value value and boolean whether the field value is different from the source value
		 * The function may return a promise containing new setting objects to be set as user selections
		 */
    onFieldChanged: PropTypes.func,

    /**
		 * Optional callback that is called when the settings are received from the server
		 * Receives the new source value object as parameter
		 */
    onSourceValueUpdated: PropTypes.func,

    /**
		 * Source value to use for initial data
		 * If no value is provided, the initial value is initialized
		 * with the default one from definitions
		 */
    value: PropTypes.object,

    /**
		 * Header for the form
		 */
    title: PropTypes.node,
  };

  static contextTypes = {
    onFieldChanged: PropTypes.func,
    router: PropTypes.object.isRequired,
  };

  state: State = {
    error: null,
    formValue: {},
  };

  sourceValue: UI.FormValueMap;
  form: any;

  setSourceValue = (value: API.SettingValueMap) => {
    this.sourceValue = this.mergeFields(this.state.formValue, value);

    if (this.props.onSourceValueUpdated) {
      this.props.onSourceValueUpdated(this.sourceValue);
    }
  };

  componentDidMount() {
    this.setSourceValue(this.props.value);
  }

  UNSAFE_componentWillReceiveProps(nextProps: FormProps) {
    if (nextProps.value !== this.props.value) {
      this.setSourceValue(nextProps.value);
    }
  }

  // Merge new fields into current current form value
  mergeFields = (formValue: UI.FormValueMap, updatedFields: API.SettingValueMap): UI.FormValueMap => {
    const mergedValue = {
      ...formValue, 
      ...normalizeSettingValueMap(updatedFields, this.props.fieldDefinitions)
    };

    this.setState({ 
      formValue: mergedValue 
    });

    return mergedValue;
  };

  onFieldChanged = (value: UI.FormValueMap, valueKey: string, kind: string) => {
    const key = valueKey[0];
    if (kind) {
      // List action
      if (kind === 'add') {
        // Set default fields for the newly added value
        const fieldDef = this.props.fieldDefinitions.find(def => def.key === key);
        if (!!fieldDef && !!fieldDef.definitions) {
          const list = value[key];
          if (!!list) {
            const listItemPos = valueKey[1];
            list[listItemPos] = normalizeSettingValueMap(list[listItemPos], fieldDef.definitions);
          }
        }
      }
    } else {
      // Make sure that we have the converted value for the custom 
      // change handler (in case there are transforms for this field) 
      const result = this.form.getComponent(valueKey[0]).validate();
      value[key] = result.value;

      if (this.props.onFieldChanged) {
        const promise = this.props.onFieldChanged(key, value, !isEqual(this.sourceValue[key], value[key]));
        if (!!promise) {
          promise
            .then(
              updatedFields => this.mergeFields(value, updatedFields), 
              error => NotificationActions.apiError('Failed to update values', error)
            );
        }
      }

      if (this.context.onFieldChanged) {
        this.context.onFieldChanged(key, value, !isEqual(this.sourceValue[key], value[key]));
      }
    }

    this.setState({ 
      formValue: value 
    });
  };

  // Handle an API error
  onSaveFailed = (error: APISocket.Error) => {
    if (error.code === 422) {
      this.setState({ 
        error: error.json,
      });
    } else {
      NotificationActions.apiError('Failed to save the form', error);
    }

    throw error;
  };

  // Reduces an object of current form values that don't match the source data
  reduceChangedValues = (formValue: UI.FormValueMap, changedValues: UI.FormValueMap, valueKey: string) => {
    if (!isEqual(this.sourceValue[valueKey], formValue[valueKey])) {
      changedValues[valueKey] = formValue[valueKey];
    }

    return changedValues;
  };

  // Calls props.onSave with changed form values
  save = () => {
    const validatedFormValue: UI.FormValueMap = this.form.getValue();
    if (validatedFormValue) {
      // Get the changed fields
      const settingKeys = Object.keys(validatedFormValue);
      const changedFields = settingKeys.reduce(
        this.reduceChangedValues.bind(this, validatedFormValue), 
        {}
      );

      return this.props.onSave(changedFields, validatedFormValue)
        .catch(this.onSaveFailed);
    }

    return Promise.reject(new Error('Validation failed'));
  };

  // Reduces an array of field setting objects by calling props.onFieldSetting
  fieldOptionReducer = (reducedOptions: { [key: string]: any }, fieldDefinitions: API.SettingDefinition) => {
    reducedOptions[fieldDefinitions.key] = parseFieldOptions(fieldDefinitions);

    if (this.props.onFieldSetting) {
      this.props.onFieldSetting(fieldDefinitions.key, reducedOptions[fieldDefinitions.key], this.state.formValue);
    }

    return reducedOptions;
  };

  // Returns an options object for Tcomb form
  getFieldOptions = () => {
    const options = {
      // Parent handlers
      fields: this.props.fieldDefinitions.reduce(this.fieldOptionReducer, {}),
    };

    // Do we have an error object from the API?
    // Show the error message for the respective field
    const { error } = this.state;
    if (!!error) {
      options.fields[error.field] = {
        ...options.fields[error.field],
        error: error.message,
        hasError: true,
      };
    }

    return options;
  };

  render() {
    const { title, fieldDefinitions, className } = this.props;
    const { formValue } = this.state;
    return (
      <div className={ classNames('form', className) }>
        { !!title && (
          <div className="ui form header">
            { title } 
          </div>
        ) }
        <TcombForm
          ref={ (c: any) => this.form = c }
          type={ parseDefinitions(fieldDefinitions) }
          options={ this.getFieldOptions() }
          value={ formValue }
          onChange={ this.onFieldChanged }
          context={ {
            ...this.context,
          } }
        />
      </div>);
  }
}

export default Form;