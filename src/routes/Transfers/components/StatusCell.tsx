import React from 'react';
import classNames from 'classnames';

import Progress from 'components/semantic/Progress';
import { StatusEnum } from 'constants/TransferConstants';

import EncryptionState from 'components/EncryptionState';
import Loader from 'components/semantic/Loader';
import { RowWrapperCellChildProps } from 'components/table/RowWrapperCell';


const getStatusClass = (cellData: API.TransferStatus, rowData: API.Transfer) => {
  const statusId = cellData.id;
  return classNames(
    { 'grey': statusId === StatusEnum.WAITING },
    { 'blue': statusId === StatusEnum.RUNNING && rowData.download },
    { 'red': statusId === StatusEnum.RUNNING && !rowData.download },
    { 'green': statusId === StatusEnum.FINISHED && rowData.download },
    { 'brown': statusId === StatusEnum.FINISHED && !rowData.download },
    { 'red':  statusId === StatusEnum.FAILED },
  );
};

interface StatusCellProps extends RowWrapperCellChildProps<API.TransferStatus, API.Transfer> {

}

const StatusCell: React.SFC<StatusCellProps> = ({ cellData, rowDataGetter }) => {
  if (cellData!.id === StatusEnum.WAITING) {
    return <Loader size="small" inline={ true } text={ cellData!.str }/>;
  }

  if (cellData!.id === StatusEnum.FAILED) {
    return <span className="error">{ cellData!.str }</span>;
  }

  const rowData = rowDataGetter!();
  let caption: React.ReactNode = cellData!.str;
  if (rowData.encryption) {
    caption = (
      <span className="transfer status encryption">
        <EncryptionState encryption={ rowData.encryption }/>
        { caption }
      </span>
    );
  }

  return (
    <Progress 
      className={ getStatusClass(cellData!, rowData) }
      caption={ caption }
      percent={ (rowData.bytes_transferred * 100) / rowData.size }
    />
  );
};

export default StatusCell;