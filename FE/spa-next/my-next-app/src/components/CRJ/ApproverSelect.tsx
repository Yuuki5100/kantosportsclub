import React from 'react';
import { AutoComplete, FormRow } from '@/components/base';
import { OptionInfo } from '@/components/base/Input/OptionInfo';
import { Mode } from '@/types/CRJ/Mode';
import { useState } from 'react';
import { MessageIds, MessageParamFunction } from '@/message';
import { useAuth } from '@/hooks/useAuth';

export type ApproverSelectProps = {
  /**
   * 承認者一覧
   */
  approvers: OptionInfo[];
  /**
   * 選択された承認者ID
   */
  selectedApproverId?: string;
  /**
   * 選択された承認者IDの変更
   * @param value
   * @returns
   */
  setSelectedApproverId?: (value: string) => void;
  /**
   * 承認者のエラーメッセージ
   */
  approverErrorMessage?: string;
  /**
   * 画面のモード
   */
  mode: Mode;
  /**
   * フィールド名（name属性）
   */
  fieldName?: string;

  /**
   * 承認者選択できるかどうか
   */
  approverSelectable?: boolean;
};

/**
 * 承認者選択コンポーネント
 * 承認者のドロップダウン選択を共通化したコンポーネント
 */
export const ApproverSelect: React.FC<ApproverSelectProps> = ({
  approvers,
  selectedApproverId,
  setSelectedApproverId,
  approverErrorMessage,
  mode,
  fieldName = 'approverSelect',
  approverSelectable,
}) => {
  const { userId, name } = useAuth();
  let approverOptions = [...approvers];
  if (!approverSelectable) {
    approverOptions = [
      ...approvers,
      {
        value: userId as string,
        label: name as string,
      },
    ];
  } else {
    if (approverOptions.find((option) => option.value === selectedApproverId) === undefined) {
      setSelectedApproverId?.('');
    }
  }
  const [approverTouched, setApproverTouched] = useState(false);
  const approverError =
    (approverTouched && selectedApproverId === '') ||
    (selectedApproverId !== '' &&
      approverSelectable &&
      approverOptions.find((option) => option.value === selectedApproverId) === undefined) ||
    (mode !== 'new' && selectedApproverId === '');

  let helperText = '';
  if (approverErrorMessage) {
    helperText = approverErrorMessage;
  } else if (approverOptions.length === 0) {
    helperText = '項目に設定されたマスタ情報がありません。最新のマスタ情報を選択してください。';
  } else {
    if (approverError) {
      helperText = (MessageIds.E008 as MessageParamFunction)('承認者');
    }
  }



  return (
    <FormRow labelAlignment='center' label={'承認者'} required={approverSelectable ? true : undefined}>
      <AutoComplete
        name={fieldName}
        options={approverOptions}
        defaultValue={selectedApproverId}
        onChange={(option) => {
          setSelectedApproverId?.(option ? option.value : '');
        }}
        disabled={!approverSelectable}
        helperText={helperText}
        error={approverError}
        onBlur={() => {
          setApproverTouched(selectedApproverId === '');
        }}
        customStyle={{ marginTop: '0' }}
      />
    </FormRow>
  );
};

/**
 * 承認者選択可能かどうかを判定する
 * モードがview以外の場合は承認者選択可能
 * @param mode 画面モード
 * @returns 承認者選択可能な場合はtrue、そうでない場合はfalse
 */
export const checkApproverSelectable = (mode: Mode): boolean => {
  return mode !== 'view';
};
