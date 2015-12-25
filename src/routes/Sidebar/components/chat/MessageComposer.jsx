'use strict';
import React from 'react';


const ENTER_KEY_CODE = 13;

const MessageComposer = React.createClass({
	propTypes: {
		/**
		 * Handles sending of the message. Receives the text as param.
		 */
		handleSend: React.PropTypes.func.isRequired,
		location: React.PropTypes.object.isRequired,
	},

	getStorageKey(props) {
		return 'last_message_' + props.location.pathname;
	},

	saveText() {
		const { text } = this.state;
		sessionStorage.setItem(this.getStorageKey(this.props), text);
	},

	loadState(props) {
		const lastText = sessionStorage.getItem(this.getStorageKey(props));
		return {
			text: lastText ? lastText : '',
		};
	},

	getInitialState: function () {
		return this.loadState(this.props);
	},

	componentWillUnmount() {
		this.saveText();
	},

	componentWillReceiveProps(nextProps) {
		if (nextProps.location.pathname !== this.props.location.pathname) {
			this.saveText();
			this.setState(this.loadState(nextProps));
		}
	},

	render: function () {
		return (
			<div className="ui form">
				<textarea
					resize="none"
					rows="2"
					className="message-composer"
					name="message"
					value={this.state.text}
					onChange={this._onChange}
					onKeyDown={this._onKeyDown}
				/>
				<div className="blue large ui icon button" onClick={ this._sendText }>
					<i className="send icon"></i>
				</div>
			</div>
		);
	},

	_onChange: function (event, value) {
		this.setState({ text: event.target.value });
	},

	_onKeyDown: function (event) {
		if (event.keyCode === ENTER_KEY_CODE) {
			event.preventDefault();
			this._sendText();
		}
	},

	_sendText() {
		var text = this.state.text.trim();
		if (text) {
			this.props.handleSend(text);
		}
		this.setState({ text: '' });
	}
});

export default MessageComposer;