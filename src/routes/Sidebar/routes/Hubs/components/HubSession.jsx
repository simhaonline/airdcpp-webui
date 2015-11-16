'use strict';

import React from 'react';

import MessageView from 'routes/Sidebar/components/MessageView';

import HubMessageStore from 'stores/HubMessageStore';
import HubActions from 'actions/HubActions';

import { ActionMenu } from 'components/Menu';
import ActionInput from 'components/semantic/ActionInput';

import TabHeader from 'routes/Sidebar/components/TabHeader';
import Button from 'components/semantic/Button';

import ChatSessionDecorator from 'decorators/ChatSessionDecorator';
import Format from 'utils/Format';

import '../style.css';

const HubActionPrompt = React.createClass({
	propTypes: {
		/**
		 * Message title
		 */
		title: React.PropTypes.node.isRequired,

		/**
		 * Error details
		 */
		content: React.PropTypes.node.isRequired,
	},

	render: function () {
		return (
			<div className="ui icon message hub-action-prompt">
				<h3 className="ui header">
					<i className={ this.props.icon + ' icon'}></i>
					<div className="content">
						{ this.props.title }
					</div>
				</h3>
				{this.props.content}
			</div>
		);
	}
});

const PasswordPrompt = React.createClass({
	_handleSubmit(text) {
		HubActions.password(this.props.hub, text);
	},

	render: function () {
		return (
			<div>
			<ActionInput placeholder="Password" caption="Submit" icon="green play" handleAction={this._handleSubmit}/>
			<p>This usually means that there's a registered account associated with your nick. If you don't remember having a registered account in this hub, there may be someone else using the same nick.</p>
			</div>
		);
	}
});

const RedirectPrompt = React.createClass({
	_handleSubmit() {
		HubActions.redirect(this.props.hub);
	},

	render: function () {
		return (
			<Button
				icon="green play"
				onClick={this._handleSubmit}
				caption={ 'Accept redirect to ' + this.props.hub.connect_state.hub_url }
			/>
		);
	}
});

const HubSession = React.createClass({
	handleClose() {
		HubActions.removeSession(this.props.item.id);
	},

	handleSend(message) {
		HubActions.sendMessage(this.props.item.id, message);
	},

	getMessage() {
		const connectState = this.props.item.connect_state.id;
		if (connectState === 'password') {
			return (
				<HubActionPrompt 
					title="Password required"
					icon="lock"
					content={ <PasswordPrompt hub={this.props.item}/> }
				/>
			);
		} else if (connectState === 'redirect') {
			return (
				<HubActionPrompt 
					title="Redirect requested"
					icon="forward mail"
					content={ <RedirectPrompt hub={this.props.item}/> }
				/>
			);
		}

		return null;
	},

	render() {
		const { identity } = this.props.item;
		const hubMenu = (
			<ActionMenu 
				location={this.props.location} 
				caption={ identity.name } 
				actions={ HubActions } 
				itemData={ this.props.item } 
				ids={ [ 'reconnect', 'favorite' ] }
			/>
		);

		const icon = (
			<Format.HubIconFormatter size="large" hub={this.props.item} />
		);

		//const subHeader = identity.description;

		return (
			<div className="hub-session">
				<TabHeader
					icon={icon}
					title={hubMenu}
					buttonClickHandler={this.handleClose}
					subHeader={ identity.description }
				/>

				{ this.getMessage() }
				<MessageView
					messages={this.props.messages}
					handleSend={this.handleSend}
					location={this.props.location}
				/>
			</div>
		);
	},
});

export default ChatSessionDecorator(HubSession, HubMessageStore, HubActions);
