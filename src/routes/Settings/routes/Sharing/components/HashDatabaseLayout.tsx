import React from 'react';
import SocketService from 'services/SocketService';
import DataProviderDecorator, { DataProviderDecoratorChildProps } from 'decorators/DataProviderDecorator';

import Checkbox from 'components/semantic/Checkbox';
import Button from 'components/semantic/Button';
import Message from 'components/semantic/Message';

import HashConstants from 'constants/HashConstants';
import LoginStore from 'stores/LoginStore';

import { formatSize } from 'utils/ValueFormat';

import '../style.css';

import * as API from 'types/api';
import * as UI from 'types/ui';

import { ErrorResponse } from 'airdcpp-apisocket';
import { Trans } from 'react-i18next';


interface OptimizeLayoutProps {
  running: boolean;
  startHandler: (verify: boolean) => void;
  settingsT: UI.ModuleTranslator;
}

const OptimizeLayout: React.FC<OptimizeLayoutProps> = (
  { startHandler, running, settingsT }
) => {
  const { toI18nKey, translate } = settingsT;
  const [ verify, setVerify ] = React.useState(false);
  return (
    <div className="optimize-layout">
      <h4 className="header">Maintenance</h4>
      <Message 
        description={ (
          <Trans i18nKey={ toI18nKey('hashDBOptimizeNote') }>
            This operation will delete all hash information for files that aren't currently in share. 
            If you are sharing files from network disks or from a removable storage, 
            make sure that the files are currently shown in share (otherwise they have to be rehashed)
          </Trans>
        ) }
        icon="blue warning"
      />

      <Checkbox 
        caption={ translate('Verify integrity of hash data') } 
        checked={ verify } 
        disabled={ running }
        onChange={ setVerify }
        floating={ true }
      />
      <Button 
        className="optimize-button"
        caption={ translate('Optimize now') }
        icon="gray configure"
        loading={ running } 
        onClick={ () => startHandler(verify) }
      />
    </div>
  );
};


interface SizeRowProps {
  title: string;
  size: number;
}

const SizeRow: React.FC<SizeRowProps> = ({ title, size }) => (
  <div className="ui row compact">
    <div className="three wide column">
      <div className="ui tiny header">
        { title }
      </div>
    </div>
    <div className="twelve wide column">
      { formatSize(size) }
    </div>
  </div>
);

interface HashDatabaseLayoutProps {
  settingsT: UI.ModuleTranslator;
}
interface HashDatabaseLayoutDataProps extends DataProviderDecoratorChildProps {
  status: API.HashDatabaseStatus;
}

class HashDatabaseLayout extends React.Component<HashDatabaseLayoutProps & HashDatabaseLayoutDataProps> {
  handleOptimize = (verify: boolean) => {
    SocketService.post(HashConstants.OPTIMIZE_DATABASE_URL, { verify })
      .catch((error: ErrorResponse) => 
        console.error(`Failed to optimize database: ${error}`)
      );
  }

  render() {
    const { status, settingsT } = this.props;
    const { translate } = settingsT;
    return (
      <div className="ui segment hash-database">
        <h3 className="header">
          { translate('Hash database') }
        </h3>
        <div className="ui grid two column">
          <SizeRow 
            title={ translate('File index size') } 
            size={ status.file_index_size }
          />
          <SizeRow 
            title={ translate('Hash store size') }
            size={ status.hash_store_size }
          />
        </div>
        { LoginStore.hasAccess(API.AccessEnum.SETTINGS_EDIT) && (
          <OptimizeLayout
            running={ status.maintenance_running }
            startHandler={ this.handleOptimize }
            settingsT={ settingsT }
          /> 
        ) }
      </div>
    );
  }
}

export default DataProviderDecorator<HashDatabaseLayoutProps, HashDatabaseLayoutDataProps>(HashDatabaseLayout, {
  urls: {
    status: HashConstants.DATABASE_STATUS_URL,
  },
  onSocketConnected: (addSocketListener, { refetchData }) => {
    addSocketListener(HashConstants.MODULE_URL, HashConstants.DATABASE_STATUS, () => refetchData());
  },
});