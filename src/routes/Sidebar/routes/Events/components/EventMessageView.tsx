import React from 'react';

import Loader from 'components/semantic/Loader';

import Message from 'components/semantic/Message';
import MessageView from 'components/messages/MessageView';

import '../style.css';

import * as UI from 'types/ui';
import { TFunction } from 'i18next';
import { translate } from 'utils/TranslationUtils';


interface EventMessagesProps {
  messages: UI.MessageListItem[];
  t: TFunction;
}

const EventMessageView: React.FC<EventMessagesProps> = ({ messages, t }) => {
  if (!messages) {
    return <Loader text={ translate('Loading messages', t, UI.Modules.EVENTS) }/>;
  }

  if (messages.length === 0) {
    return (
      <Message 
        description={ translate('No messages to show', t, UI.Modules.EVENTS) }
      />
    );
  }

  return (
    <MessageView 
      className="events"
      messages={ messages }
      t={ t }
    />
  );
};

export default EventMessageView;
