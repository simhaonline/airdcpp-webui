import React from 'react';

import WebUserConstants from 'constants/WebUserConstants';
import WebUserActions from 'actions/WebUserActions';

import ActionButton from 'components/ActionButton';
import WebUserDialog from 'routes/Settings/routes/System/components/users/WebUserDialog';

import DataProviderDecorator, { DataProviderDecoratorChildProps } from 'decorators/DataProviderDecorator';

import { ActionMenu } from 'components/menu';
import { formatRelativeTime } from 'utils/ValueFormat';

import * as API from 'types/api';
import * as UI from 'types/ui';

import { SettingSectionChildProps } from 'routes/Settings/components/SettingSection';


interface WebUserRowProps {
  user: API.WebUser;
  settingsT: UI.ModuleTranslator;
}

const WebUserRow: React.FC<WebUserRowProps> = ({ user, settingsT }) => (
  <tr>
    <td>
      <ActionMenu 
        caption={ <strong>{ user.username }</strong> }
        actions={ WebUserActions } 
        itemData={ user }
        contextElement="#setting-scroll-context"
      />
    </td>
    <td>
      { user.permissions.indexOf(API.AccessEnum.ADMIN) !== -1 ? 
          settingsT.translate('Administrator') : 
          user.permissions.length
      }
    </td>
    <td>
      { user.active_sessions }
    </td>
    <td>
      { formatRelativeTime(user.last_login) }
    </td>
  </tr>
);

interface WebUsersPageProps extends SettingSectionChildProps {

}

interface WebUsersPageDataProps extends DataProviderDecoratorChildProps {
  users: API.WebUser[];
}

class WebUsersPage extends React.Component<WebUsersPageProps & WebUsersPageDataProps> {
  static displayName = 'WebUsersPage';

  render() {
    const { users, settingsT } = this.props;
    const { translate } = settingsT;
    return (
      <div>
        <ActionButton 
          actions={ WebUserActions }
          actionId="create"
        />
        <table className="ui striped table">
          <thead>
            <tr>
              <th>{ translate('Username') }</th>
              <th>{ translate('Permissions') }</th>
              <th>{ translate('Active sessions') }</th>
              <th>{ translate('Last logged in') }</th>
            </tr>
          </thead>
          <tbody>
            { users.map(user => (
              <WebUserRow 
                key={ user.username }
                user={ user }
                settingsT={ settingsT }
              />
            )) }
          </tbody>
        </table>
        <WebUserDialog
          settingsT={ settingsT }
        />
      </div>
    );
  }
}

export default DataProviderDecorator(WebUsersPage, {
  urls: {
    users: WebUserConstants.USERS_URL,
  },
  onSocketConnected: (addSocketListener, { refetchData }) => {
    addSocketListener(WebUserConstants.MODULE_URL, WebUserConstants.ADDED, () => refetchData());
    addSocketListener(WebUserConstants.MODULE_URL, WebUserConstants.UPDATED, () => refetchData());
    addSocketListener(WebUserConstants.MODULE_URL, WebUserConstants.REMOVED, () => refetchData());
  },
});