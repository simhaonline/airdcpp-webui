import update from 'react-addons-update';

import MessageUtils from 'utils/MessageUtils';
import UrgencyUtils from 'utils/UrgencyUtils';

const SessionStoreDecorator = function (store, actions, urgencyMappings) {
	let sessions = [];
	let activeSession = null;

	actions.sessionChanged.listen(id => {
		activeSession = id;
	});

	actions.fetchSessions.completed.listen(data => {
		sessions = data;
		store.trigger(sessions);
	});

	store.getTotalUrgencies = () => {
		return UrgencyUtils.getSessionUrgencies(sessions, urgencyMappings, 'unread_messages');
	};

	store.getItemUrgencies = (item) => {
		return UrgencyUtils.toUrgencyMap(item.unread_messages, urgencyMappings);
	};

	store.getSession = (id) => {
		return sessions.find(session => session.id == id);
	};

	store.getSessions = () => {
		return sessions;
	};

	store.getActiveSession = () => activeSession;

	store._onSessionCreated = (data) =>	{
		sessions = update(sessions, { $push: [ data ] });
		store.trigger(sessions);
	};

	store._onSessionUpdated = (data, id) => {
		const session = store.getSession(id);
		if (!session) {
			console.error('Update received for a non-existing session', id);
			return;
		}

		// Active tab?
		if (data.unread_messages && id === activeSession) {
			data = MessageUtils.checkUnread(data, actions, id);
		}

		sessions[sessions.indexOf(session)] = update(session, { $merge: data });
		store.trigger(sessions);
	};

	store._onSessionRemoved = (data) => {
		const index = sessions.indexOf(store.getSession(data.id));
		sessions = update(sessions, { $splice: [ [ index, 1 ] ] });
		store.trigger(sessions);
	};

	return store;
};

export default SessionStoreDecorator;
