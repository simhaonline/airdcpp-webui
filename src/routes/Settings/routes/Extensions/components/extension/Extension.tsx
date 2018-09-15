import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Moment from 'moment';

import ExtensionConstants from 'constants/ExtensionConstants';

import ExtensionIcon from 'routes/Settings/routes/Extensions/components/extension/ExtensionIcon';
import ExtensionActionButtons from 'routes/Settings/routes/Extensions/components/extension/ExtensionActionButtons';

//@ts-ignore
import PureRenderMixin from 'react-addons-pure-render-mixin';
import SocketSubscriptionMixin from 'mixins/SocketSubscriptionMixin';

import versionCompare from 'compare-versions';

import 'semantic-ui-css/components/item.min.css';


interface VersionProps {
  title: string;
  className?: string;
  packageInfo?: {
    date?: number;
    version: string;
  };
}

const Version: React.SFC<VersionProps> = ({ title, packageInfo, className }) => {
  if (!packageInfo) {
    return null;
  }

  const publishDate = packageInfo.date ? ` (published ${Moment(packageInfo.date).from(Moment())})` : '';
  return (
    <div className={ className }>
      { (title ? title + ': ' : '') }
      <span> 
        { packageInfo.version + publishDate }
      </span>
    </div>
  );
};

const formatAuthor = (npmPackage?: NpmPackage, installedPackage?: API.Extension) => {
  if (installedPackage && installedPackage.author) {
    return 'by ' + installedPackage.author;
  }

  if (npmPackage) {
    return 'by ' + npmPackage.publisher.username;
  }

  return null;
};

const formatNote = (installedPackage?: API.Extension, npmError?: APISocket.ErrorBase) => {
  if (installedPackage && !installedPackage.managed) {
    return 'Unmanaged extension';
  }

  if (npmError) {
    return `Failed to fetch information from the extension directory: ${npmError.message} (code ${npmError.code})`;
  }

  return 'Non-listed extension';
};


export interface NpmPackage {
  name: string;
  description: string;
  version: string;
  publisher: {
    username: string;
  };
}

export interface ExtensionProps {
  installedPackage?: API.Extension;
  npmPackage?: NpmPackage;
  npmError?: APISocket.ErrorBase;
}

const Extension = createReactClass<ExtensionProps, {}>({
  displayName: 'Extension',
  mixins: [ PureRenderMixin, SocketSubscriptionMixin() ],

  propTypes: {
    npmPackage: PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      version: PropTypes.string.isRequired,
      date: PropTypes.string,
      publisher: PropTypes.shape({
        username: PropTypes.string,
      }),
    }),
    installedPackage: PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      version: PropTypes.string.isRequired,
      author: PropTypes.string,
    }),
  },

  getInitialState() {
    return {
      installing: false,
    };
  },

  onInstallationStarted(data: API.ExtensionInstallEvent) {
    if (data.install_id !== this.props.npmPackage.name) {
      return;
    }

    this.setState({
      installing: true,
    });
  },

  onInstallationCompleted(data: API.ExtensionInstallEvent) {
    if (data.install_id !== this.props.npmPackage.name) {
      return;
    }

    this.setState({
      installing: false,
    });
  },

  onSocketConnected(addSocketListener: any) {
    if (this.props.npmPackage) {
      // tslint:disable-next-line:max-line-length
      addSocketListener(ExtensionConstants.MODULE_URL, ExtensionConstants.INSTALLATION_STARTED, this.onInstallationStarted);
      // tslint:disable-next-line:max-line-length
      addSocketListener(ExtensionConstants.MODULE_URL, ExtensionConstants.INSTALLATION_SUCCEEDED, this.onInstallationCompleted);
      // tslint:disable-next-line:max-line-length
      addSocketListener(ExtensionConstants.MODULE_URL, ExtensionConstants.INSTALLATION_FAILED, this.onInstallationCompleted);
    }
  },

  render() {
    const { npmPackage, installedPackage, npmError }: ExtensionProps = this.props;
    const { installing } = this.state;

    const hasUpdate = !!installedPackage && !!npmPackage && 
      versionCompare(installedPackage.version, npmPackage.version) < 0;

    return (
      <div className="item extension">
        <ExtensionIcon
          installedPackage={ installedPackage }
          hasUpdate={ hasUpdate }
        />
        <div className="content">
          <a className="header">
            { npmPackage ? npmPackage.name : installedPackage!.name }
          </a>
          <div className="meta author">
            { formatAuthor(npmPackage, installedPackage) }
          </div>
          <div className="description">
            <span>{ npmPackage ? npmPackage.description : installedPackage!.description }</span>
          </div>
          <div className="extra version">
            <Version 
              className="npm"
              title="Latest version" 
              packageInfo={ npmPackage }
            />
            <div>
              { !npmPackage && formatNote(installedPackage, npmError) }
            </div>
            <Version 
              className={ npmPackage ? (!hasUpdate ? 'latest' : 'outdated') : undefined }
              title="Installed version" 
              packageInfo={ installedPackage }
            />
          </div>
          <ExtensionActionButtons
            installedPackage={ installedPackage }
            npmPackage={ npmPackage }
            installing={ installing }
            hasUpdate={ hasUpdate }
          />
        </div>
      </div>
    );
  },
});

export default Extension;