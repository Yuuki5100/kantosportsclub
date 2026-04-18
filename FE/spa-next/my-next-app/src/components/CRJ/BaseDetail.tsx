import { Font20, FormRow, RadioButton, TextBox } from '@/components/base';
import DetailContainer from '@/components/CRJ/DetailContainer';
import { Mode } from '@/types/CRJ/Mode';
import { RegisterStatus } from '@/types/CRJ/RegisterStatus';
import { Role } from '@/types/CRJ/Role';
import { Card } from '@/components/base';
import { useState } from 'react';

export const BaseDetailContent = () => {
  return (
    <Card sx={{ paddingLeft: '16px', paddingRight: '16px', marginBottom: '16px' }}>
      <Font20>拠点情報</Font20>
      <FormRow label="拠点CD" required>
        <TextBox name={'baseCd'} disabled></TextBox>
      </FormRow>
      <FormRow label="拠点名" required>
        <TextBox name={'baseName'}></TextBox>
      </FormRow>
      <FormRow label="略称名">
        <TextBox name={'shortBaseName'}></TextBox>
      </FormRow>
      <FormRow label="郵便番号" required>
        〒<TextBox name={'addressNo'} customStyle={{ width: '200px' }}></TextBox>
      </FormRow>
      <FormRow label="住所" required>
        <TextBox name={'address'}></TextBox>
      </FormRow>
      <FormRow label="電話番号" required>
        <TextBox name={'telNo'}></TextBox>
      </FormRow>
      <FormRow label="FAX番号" required>
        <TextBox name={'fax'}></TextBox>
      </FormRow>
      <FormRow label="拠点区分" required>
        <RadioButton
          name="baseType"
          options={[
            { value: 'headOffice', label: '本社' },
            { value: 'office', label: '事業所' },
            { value: 'businessOffice', label: '営業所' },
          ]}
        />
      </FormRow>
    </Card>
  );
};

type BaseDetailProps = {
  role: Role;
  registerStatus: RegisterStatus;
  assignedToMe?: boolean;
  applicableInfoHidden: boolean;
}

export const BaseDetail = (props: BaseDetailProps) => {
  const [approveComment, setApproveComment] = useState<string>('');
  const [applicableComment, setApplicableComment] = useState<string>('');
  const [mode, setMode] = useState<Mode>('view');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [applicableMode, setApplicableMode] = useState<Mode>('view');
  const [deleteReason, setDeleteReason] = useState<string>('');

  return (
    <DetailContainer
      role={props.role}
      registerStatus={props.registerStatus}
      mode={mode}
      assignedToMe={props.assignedToMe}
      approveComment={approveComment}
      setApproveComment={setApproveComment}
      id={'12345'}
      deleteFlg={false}
      deleteReason={deleteReason}
      setDeleteReason={setDeleteReason}
      createdAt={'2025/05/01 00:00:00'}
      createdBy={'2025/05/01 00:00:00'}
      updatedAt={'2025/05/01 00:00:00'}
      updatedBy={'2025/05/01 00:00:00'}
      menuId={'baseDetail'}
      applicableInfoHidden={props.applicableInfoHidden}
      onEditClick={() => setMode('edit')}
      onBackClick={() => {
        setMode('view');
      } }
      applicableComment={applicableComment}
      setApplicableComment={setApplicableComment}
      onRefNewClick={() => {
        setMode('refNewEdit');
      }}
      onApplicableEditClick={() => setApplicableMode('edit')} loginUser={{
        value: '',
        label: '',
        disabled: undefined
      }}    >
      <BaseDetailContent />
    </DetailContainer>
  );
};
