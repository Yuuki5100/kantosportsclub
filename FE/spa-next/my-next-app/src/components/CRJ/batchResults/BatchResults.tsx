import { getBaseComboList } from '@/api/services/v1/crj/common/baseComboListService';
import { BatchListRequest, BatchStatus, getBatchStatus } from '@/api/services/v1/crj/common/batchResultService';
import { getBatchTypes } from '@/api/services/v1/crj/common/batchTypeService';
import { AutoComplete, Box, DatePicker, FormRow } from '@/components/base';
import { CRJButton } from '@/components/base/Button/CRJ/CRJButtonBase';
import { OptionInfo } from '@/components/base/Input/OptionInfo';
import { Breadcrumb, ControllableListView } from '@/components/composite';
import { TableState } from '@/components/composite/Listview/ControllableListView';
import { ColumnDefinition, RowDefinition } from '@/components/composite/Listview/ListView';
import { getPageConfig } from '@/config/PageConfig';
import { pageLang } from '@/config/PageLang';
import { BaseComboListResponse } from '@/types/CRJ/BaseComboListResponse';
import { BatchTypeListResponse } from '@/types/CRJ/BatchTypeListResponse';
import { Dayjs } from 'dayjs';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getMessage, MessageCodes } from '@/message';

export type BatchResultsProps = {
  onError?: (message: string) => void;
};

export const BatchResults = (props: BatchResultsProps) => {
  const [selectedBaseCd, setSelectedBaseCd] = useState<string | undefined>('');
  const [selectedBatchName, setSelectedBatchName] = useState<string | undefined>('');
  const [executeBeginDate, setExecuteBeginDate] = useState<Dayjs | undefined>();

  const [tableState, setTableState] = useState<TableState>({
    page: 0,
    rowsPerPage: 10,
    sortParams: {
      sortColumn: '',
      sortOrder: false
    }
  });

  const fetchBatch = async () => {
    const searchConditions: BatchListRequest = {
      base: selectedBaseCd,
      batch: selectedBatchName,
      startDate: executeBeginDate?.toString() ?? '',
      pageNo: tableState.page,
      pageSize: tableState.rowsPerPage,
      sortKey: tableState.sortParams.sortColumn,
      sortOrder: tableState.sortParams.sortOrder,
      baseExtMatFlag: true,
      batchExtMatFlag: true,
    };

    try {
      const response = await getBatchStatus(searchConditions);
      if (response.error || response.data === null) {
        throw new Error(
          getMessage(
            MessageCodes.FETCH_FAILED_WITH_REASON,
            'バッチ実行結果',
            response.error || getMessage(MessageCodes.DATA_NOT_FOUND)
          )
        );
      }
      if (response.data) {
        setBatch(response.data.baseList);
        setTotalCnt(response.data.totalCnt);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Batch status fetch error:', error.message);
        if (props.onError) {
          props.onError(error.message);
        }
      }
    }
  };

  const [batch, setBatch] = useState<BatchStatus[]>([]);
  const [totalCnt, setTotalCnt] = useState<number>(0);

  const router = useRouter();

  useEffect(() => {
    fetchBatch();
  }, [tableState]);


  const tableData: RowDefinition[] = batch?.map<RowDefinition>((value, index) => ({
    cells: [
      {
        id: 'index',
        columnId: 'index',
        cell: index,
        value: index
      },
      {
        id: 'baseName',
        columnId: 'baseName',
        cell: value.baseName,
        value: value.baseName
      },
      {
        id: 'batchName',
        columnId: 'batchName',
        cell: value.batchName,
        value: value.batchName
      },
      {
        id: 'executeBeginDate',
        columnId: 'executeBeginDate',
        cell: value.startDateAndTime,
        value: value.startDateAndTime
      },
      {
        id: 'executeEndDate',
        columnId: 'executeEndDate',
        cell: value.endDateAndTime,
        value: value.endDateAndTime
      },
      {
        id: 'status',
        columnId: 'status',
        cell: value.statusName,
        value: value.statusName
      },
      {
        id: 'error',
        columnId: 'error',
        cell: value.errorMessege,
        value: value.errorMessege
      },
    ]
  })) ?? [];

  /**
   * 検索ボタン押下時のハンドラー
   * 検索条件を更新し、検索を実行する
   * @param baseCd 
   * @param batchName 
   * @param executeBeginDate 
   */
  const onClickHandleButton = () => {
    fetchBatch();
  };

  const columns: ColumnDefinition[] = [{
    id: 'index',
    label: '#',
    display: true,
    sortable: false
  },
  {
    id: 'baseName',
    label: '拠点',
    display: true,
    sortable: true
  }, {
    id: 'batchName',
    label: 'バッチ名',
    display: true,
    sortable: true
  }, {
    id: 'executeBeginDate',
    label: '実行開始日時',
    display: true,
    sortable: true
  }, {
    id: 'executeEndDate',
    label: '実行終了日時',
    display: true,
    sortable: true
  }, {
    id: 'status',
    label: 'ステータス',
    display: true,
    sortable: true
  }, {
    id: 'error',
    label: 'エラー内容',
    display: true,
    sortable: true
  }];

  return <>
    <Box>
      <Breadcrumb
        currentPath={router.pathname}
        pageConfigType={getPageConfig()}
        language={pageLang.ja}
        onLinkClick={(path: string) => router.push(path)}
      />
    </Box>
    <Box sx={{
      mt: 3,
      mb: 2,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      width: '100%'
    }}>
      <CRJButton label={'戻る'} onClick={() => router.push('/common/top-list')} />
    </Box>
    <ControllableListView
      page={tableState.page + 1}
      sortParams={{
        sortColumn: tableState.sortParams.sortColumn,
        sortOrder: tableState.sortParams.sortOrder
      }}
      rowsPerPage={tableState.rowsPerPage}
      rowData={tableData}
      totalRowCount={totalCnt}
      columns={columns}
      onTableStateChange={(newState) => {
        setTableState({
          ...newState,
          page: newState.page - 1
        });
      }}
      searchOptions={{
        title: '検索オプション',
        elements: <SearchCondition
          selectedBaseCd={selectedBaseCd}
          setSelectedBaseCd={setSelectedBaseCd}
          selectedBatchName={selectedBatchName}
          setSelectedBatchName={setSelectedBatchName}
          executeBeginDate={executeBeginDate}
          setExecuteBeginDate={setExecuteBeginDate}
          onClickSearchButton={onClickHandleButton} />
      }}
    />;
  </>
};

type SearchConditionProps = {
  selectedBaseCd: string | undefined;
  setSelectedBaseCd: (selectedBaseCd: string | undefined) => void;
  selectedBatchName: string | undefined;
  setSelectedBatchName: (selectedBatchName: string | undefined) => void;
  executeBeginDate: Dayjs | undefined
  setExecuteBeginDate: (executeBeginDate: Dayjs | undefined) => void;
  onClickSearchButton: () => void;
  onError?: (message: string) => void;
};

const SearchCondition = (props: SearchConditionProps) => {
  const { onError } = props;
  const [bases, setBases] = useState<BaseComboListResponse>();
  const [batches, setBatches] = useState<BatchTypeListResponse[]>();

  useEffect(() => {
    (async () => {
      try {
        const response = await getBaseComboList('1');
        if (response.result === 'Failed' || response.data === null) {
          throw new Error(
            getMessage(MessageCodes.FETCH_FAILED_WITH_REASON, '承認者', response.message)
          );
        }
        if (response.data)
          setBases(response.data);

        const batchResponse = await getBatchTypes();
        if (batchResponse.result === 'Failed' || batchResponse.data === null) {
          throw new Error(
            getMessage(MessageCodes.FETCH_FAILED_WITH_REASON, 'バッチ種別', batchResponse.message)
          );
        }
        if (batchResponse.data) {
          // BatchType[]をBatchTypeListResponse[]に変換
          const batchTypes = batchResponse.data.map(batch => ({
            batchName: batch.batchName,
            displayName: batch.displayName
          }));
          setBatches(batchTypes);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Base combo list fetch error:', error.message);
          if (onError) {
            onError(error.message);
          }
        }
      }
    })();

  }, [onError]);

  return (
    <Box sx={{ width: '100%' }}>
      <FormRow
        label={'拠点'}
        labelAlignment='center'
        rowCustomStyle={{
          width: '100%',
          alignItems: 'center'
        }}
      >
        <AutoComplete
          name={'base-select'}
          options={bases?.map<OptionInfo>(x => ({ label: x.baseName, value: x.baseCd })) ?? []}
          onChange={(value) => props.setSelectedBaseCd(value?.value)}
          customStyle={{
            width: '100%',
            mt: 0
          }} />
      </FormRow>
      <FormRow
        label={'バッチ'}
        labelAlignment='center'
        rowCustomStyle={{
          width: '100%',
          alignItems: 'center'
        }}
      >
        <AutoComplete
          name={'batch-select'}
          options={batches?.map<OptionInfo>(x => ({ label: x.displayName, value: x.batchName })) ?? []}
          onChange={(value) => props.setSelectedBatchName(value?.value)}
          customStyle={{
            width: '100%',
            mt: 0
          }} />
      </FormRow>
      <FormRow
        label={'実行開始日'}
        labelAlignment='center'
        rowCustomStyle={{
          alignItems: 'center',
          '& > div:last-child': {
            marginTop: '0px'
          }
        }}
      >
        <DatePicker
          value={props.executeBeginDate}
          onChange={props.setExecuteBeginDate}
          customStyle={{ width: '100%', mt: 0 }} />
      </FormRow>
      <CRJButton
        label={'検索'}
        onClick={props.onClickSearchButton}
      />
    </Box>);
}
