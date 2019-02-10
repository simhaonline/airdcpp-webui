'use strict';

import React from 'react';
import { matchPath } from 'react-router-dom';
import { 
  configRoutes, mainRoutes, secondaryRoutes, logoutItem, 
  parseMenuItems, parseMenuItem, RouteItemClickHandler 
} from 'routes/Routes';

import SectionedDropdown from 'components/semantic/SectionedDropdown';
import MenuSection from 'components/semantic/MenuSection';

import History from 'utils/History';
import IconPanel from 'components/main/navigation/IconPanel';
import { Location } from 'history';
import { Translation } from 'react-i18next';
import { translate } from 'utils/TranslationUtils';

import * as UI from 'types/ui';


interface MainNavigationMobileProps {
  onClose: () => void;
  location: Location;
  visible: boolean;
}

class MainNavigationMobile extends React.Component<MainNavigationMobileProps> {
  c: HTMLDivElement;
  componentDidMount() {
    const settings = {
      context: '#mobile-layout',
      transition: 'overlay',
      mobileTransition: 'overlay',
      onHidden: this.props.onClose,
    };

    $(this.c).sidebar(settings);
  }

  componentDidUpdate(prevProps: MainNavigationMobileProps) {
    if (this.props.visible !== prevProps.visible) {
      if (this.props.visible) {
        $(this.c).sidebar('show');
      } else {
        $(this.c).sidebar('hide');
      }
    }
  }

  onClickSecondary: RouteItemClickHandler = (url, evt) => {
    evt.preventDefault();

    const isActive = matchPath(this.props.location.pathname, {
      path: url,
      //exact: url !== '/',
    });

    if (!isActive) {
      History.push(url);
    }

    this.onClick(url, evt);
  }

  onClick: RouteItemClickHandler = (url, evt) => {
    $(this.c).sidebar('hide');
  }

  render() {
    return (
      <Translation>
        { t => (
          <div 
            ref={ c => this.c = c! }
            id="mobile-menu" 
            className="ui right vertical inverted sidebar menu"
          >
            { parseMenuItems(mainRoutes, this.onClick) }
            <SectionedDropdown 
              caption={ translate('More...', t, UI.SubNamespaces.NAVIGATION) }
              captionIcon="ellipsis horizontal caption" 
              className="right fluid" 
              triggerIcon=""
            >
              <MenuSection>
                { parseMenuItems(configRoutes, this.onClick) }
              </MenuSection>
              <MenuSection>
                { parseMenuItem(logoutItem) }
              </MenuSection>
            </SectionedDropdown>

            <div className="separator"/>

            { parseMenuItems(secondaryRoutes, this.onClickSecondary) }
            <IconPanel/>
          </div>
        ) }
      </Translation>
    );
  }
}

export default MainNavigationMobile;
