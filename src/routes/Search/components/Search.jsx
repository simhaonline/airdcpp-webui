import React from 'react';
import SearchStore from '../../../stores/SearchStore';
import VirtualTable from '../../../components/table/VirtualTable'
import SocketService from '../../../services/SocketService'
import SearchActions from '../../../actions/SearchActions'

import { DupeEnum, DupeStyle } from '../../../constants/DupeConstants'
import { HistoryEnum } from '../../../constants/HistoryConstants'
import { SEARCH_QUERY_URL } from '../../../constants/SearchConstants'

import HistoryInput from '../../../components/HistoryInput'
import ChildModalMixin from '../../../mixins/ChildModalMixin'

import classNames from 'classnames';
import { Column } from 'fixed-data-table';

import Formatter from '../../../utils/Format';

const SEARCH_PERIOD = 4000;

export default React.createClass({
  mixins: [ChildModalMixin],
  _handleSearch(text) {
    console.log("Searching");

    SearchStore.clear();
    clearTimeout(this._searchTimeout);

    SocketService.post(SEARCH_QUERY_URL, { pattern: text })
      .then(data => {
        this.setState({running:true});
        this._searchTimeout = setTimeout(() => this.setState({running:false}), data.queue_time + SEARCH_PERIOD);
      })
      .catch(error => 
        console.error("Failed to post search: " + error)
      );
  },

  getInitialState() {
    return {
      running: false
    }
  },

  _renderStr(cellData, cellDataKey, rowData) {
    if (cellData === undefined) {
      return cellData;
    }

    return cellData.str;
  },

  _renderName(cellData, cellDataKey, rowData) {
    if (cellData === undefined) {
      return cellData;
    }

    var formatter = (
      <Formatter.FileNameFormatter type={ rowData.type.type }>
        { cellData }
      </Formatter.FileNameFormatter>);

    return <Formatter.DownloadMenu caption={ formatter } id={ rowData.id } handler={ SearchActions.download }/>
  },

  _renderIp(cellData) {
    if (cellData === undefined) {
      return cellData;
    }

    return <Formatter.IpFormatter item={ cellData }/>
  },

  _renderUsers(cellData, cellDataKey, rowData) {
    if (cellData === undefined) {
      return cellData;
    }

    return <Formatter.UserFormatter user={ cellData } directory={ rowData.path }/>
  },

  _rowClassNameGetter(rowData) {
    return DupeStyle(rowData.dupe);
  },

  render() {
    return (
      <div>
        <div className="search-container">
          <div className="search-area">
            <HistoryInput historyId={HistoryEnum.HISTORY_SEARCH} submitHandler={this._handleSearch} running={this.state.running}/>
          </div>
        </div>
        <VirtualTable
          rowClassNameGetter={ this._rowClassNameGetter }
        	defaultSortProperty="relevancy"
          store={ SearchStore }
          defaultSortAscending={false}>
          <Column
            label="Name"
            width={270}
            dataKey="name"
            cellRenderer={ this._renderName }
            flexGrow={5}
          />
          <Column
            label="Size"
            width={100}
            dataKey="size"
            cellRenderer={ Formatter.formatSize }
          />
          <Column
            label="Relevancy"
            width={80}
            dataKey="relevancy"
            cellRenderer={ Formatter.formatDecimal }
          />
          <Column
            label="Connection"
            width={100}
            dataKey="connection"
            cellRenderer={ Formatter.formatConnection }
          />
          <Column
            label="Type"
            width={100}
            dataKey="type"
            cellRenderer={ this._renderStr }
          />
          <Column
            label="Users"
            width={150}
            dataKey="users"
            flexGrow={3}
            cellRenderer={ this._renderUsers }
          />
          <Column
            label="Date"
            width={150}
            dataKey="time"
            cellRenderer={ Formatter.formatDateTime }
          />
          <Column
            label="Slots"
            width={70}
            dataKey="slots"
            cellRenderer={ this._renderStr }
          />
          <Column
            label="IP"
            width={70}
            dataKey="ip"
            cellRenderer={ this._renderIp }
            flexGrow={3}
          />
        </VirtualTable>
      </div>
    );
  }
});
