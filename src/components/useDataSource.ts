import { useState, useEffect } from 'react';
import { DataSource } from './DataSource';
import { DataSourceState } from './types';

export function useDataSource(dataSource: DataSource) {
  const [state, setState] = useState<DataSourceState>(dataSource.getState());

  useEffect(() => {
    const handleUpdate = (newState: DataSourceState) => {
      setState(newState);
    };

    dataSource.addListener(handleUpdate);
    dataSource.start();

    return () => {
      dataSource.stop();
    };
  }, [dataSource]);

  return state;
}
