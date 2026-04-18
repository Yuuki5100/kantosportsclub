import { Font20, FormRow } from '@/components/base';
import TextArea from '@/components/base/Input/TextBoxMultiLine';
import { deleteFlgText } from '@/components/CRJ/deleteFlgText';
import { RegisterStatusNames } from '@/const/CRJ/RegisterStatusNames';
import { CommonInfo } from '@/types/CRJ/CommonInfo';
import { Mode } from '@/types/CRJ/Mode';
import { Role } from '@/types/CRJ/Role';
import { Card } from '@/components/base';
import type { SxProps, Theme } from '@/components/base';
import { deleteReasonTextAreaDisabled } from './actionAllowed';

export type CommonInfoAreaProps = CommonInfo & {
  /**
   * 削除理由set用関数
   * @param value
   * @returns
   */
  setDeleteReason?: (value: string) => void;
  /**
   * ユーザーの権限
   * 権限区分
   * - `none`: なし
   * - `view`: 参照
   * - `update`: 更新
   * - `approve`: 承認
   */
  role: Role;
  /**
   * 画面のモード
   */
  mode: Mode;
  /**
   * 承認者が自身に割り当てられているかどうか
   *
   * approveモードのときのみ使用
   *
   * それ以外はundefinedにすること
   */
  assignedToMe?: boolean;

  /**
   * トラン
   */
  isTran: boolean;

  /**
   * 削除情報表示
   */
  deleteInfoVisible: boolean;

  /**
   * Cardのカスタムスタイル
   */
  sx?: SxProps<Theme>;
};

export const CommonInfoArea = (props: CommonInfoAreaProps) => {
  return (
    <Card sx={{ ...props.sx, paddingLeft: '16px', paddingRight: '16px', marginBottom: '16px' }}>
      <Font20>共通情報</Font20>
      <FormRow labelAlignment='center' label={'識別ID'}>{props.id}</FormRow>
      <FormRow labelAlignment='center' label={'ステータス'}>{RegisterStatusNames[props.registerStatus]}</FormRow>
      {props.deleteInfoVisible
        && <>
            <FormRow labelAlignment='center' label={'削除済フラグ'}>{deleteFlgText(props.deleteFlg)}</FormRow>
            <FormRow label={'削除理由'}>
              <TextArea
                rows={3}
                value={props.deleteReason}
                onChange={(e) => props.setDeleteReason?.(e.target.value)}
                name={'deleteReason'}
                customStyle={{
                  width: '100%',
                }}
                disabled={deleteReasonTextAreaDisabled(
                  props.role,
                  props.registerStatus,
                  props.mode,
                  props.isTran
                )}
                maxLength={100}
              />
            </FormRow>
          </>}
      <br />
      <FormRow labelAlignment='center' label={'作成者'}>{props.createdBy}</FormRow>
      <FormRow labelAlignment='center' label={'作成日時'}>{props.createdAt}</FormRow>
      <br />
      <FormRow labelAlignment='center' label={'更新者'}>{props.updatedBy}</FormRow>
      <FormRow labelAlignment='center' label={'更新日時'}>{props.updatedAt}</FormRow>
    </Card>
  );
};
