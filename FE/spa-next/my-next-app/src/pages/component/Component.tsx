import React, { useState } from "react";

import TextBox from "@/components/base/Input/TextBox";
import TextArea from "@/components/base/Input/TextBoxMultiLine";
import DropBox from "@/components/base/Input/DropBox";
import DropBoxMultiSelected from "@/components/base/Input/DropBoxMultiSelected";
import RadioButton from "@/components/base/Input/RadioButton";
import CheckBox from "@/components/base/Input/CheckBox";
import AutoComplete from "@/components/base/Input/AutoComplete";
import AutoCompleteMultiSelected from "@/components/base/Input/AutoCompleteMultiSelected";
import SelectBox from "@/components/base/Input/SelectBox";
import DatePicker from '@/components/base/Input/DatePicker';
import FormRow from '@/components/base/Input/FormRow';


import {
  ButtonReject,
  ButtonNext,
  ButtonBack,
  ButtonAction,
  IconButtonBase,
} from "@/components/base/Button";

import { Font20 } from "@/components/base/Font";
import LoadingSpinner from "@/components/composite/LoadingSpinner";
import ModalWindow from "@/components/composite/ModalWindow";
import { Dayjs } from 'dayjs';
import { useSnackbar } from '@/hooks/useSnackbar';
import { SnackbarType } from '@/slices/snackbarSlice';
import { ModalWithButtons } from '@/components/composite';
import { TooltipWrapper } from '@/components/base/utils';
import DeleteIcon from '@mui/icons-material/Delete';


const ComponentPage = () => {
  const [loading, setLoading] = useState(false);
  const handleLoad = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  const [openModal, setOpenModal] = useState(false);
  const openModalWindowHandler = () => setOpenModal(true);
  const closeModalHandler = () => setOpenModal(false);
  const handleButtonClick = (label: string) => {
    console.log(`${label} ボタンがクリックされました`);
  };

  const [openModalWithButtons, setOpenModalWithButtons] = useState(false);
  const openModalWithButtonsHandler = () => setOpenModalWithButtons(true);
  const closeModalWithButtonsHandler = () => setOpenModalWithButtons(false);

  const [currentDate, setCurrentDate] = useState<Dayjs | undefined>(undefined);
  const [currentDateDisabled, setCurrentDateDisabled] = useState<boolean>(false);

  const [minDate, setMinDate] = useState<Dayjs | undefined>(undefined);
  const [maxDate, setMaxDate] = useState<Dayjs | undefined>(undefined);

  const snackbar = useSnackbar();
  const [snackBarInput, setSnackBarInput] = useState<string>('');
  const [snackBarTypeInput, setSnackBarTypeInput] = useState<SnackbarType>('SUCCESS');

  const [clearButtonTextBoxValue, setClearButtonTextBoxValue] = useState<string>('');

  return (
    <>
      <h1>フォームサンプル</h1>

      <TextBox name="text1" helperText="テキストを入力" />
      <div>
        <h2>クリアボタン・ツールチップ付き</h2>
        <TooltipWrapper title="ツールチップ付きテキストボックス">
          <TextBox name="text1" helperText="テキストを入力" value={clearButtonTextBoxValue} onChange={e => setClearButtonTextBoxValue(e.currentTarget.value)} clearButton/>
        </TooltipWrapper>
      </div>
      <TextArea name="area1" />
      <DropBox
        name="drop"
        options={[
          { value: "1", label: "選択肢1" },
          { value: "2", label: "選択肢2" },
        ]}
      />
      <DropBoxMultiSelected
        name="multiDrop"
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
        setSelectedValues={(selectedValues) => console.log("選択された値:", selectedValues)}
      />
      <RadioButton
        name="radio"
        options={[
          { value: "yes", label: "はい" },
          { value: "no", label: "いいえ" },
        ]}
      />
      <CheckBox
        name="check"
        options={[
          { value: "1", label: "項目1" },
          { value: "2", label: "項目2" },
        ]}
      />
      <AutoComplete
        name="auto"
        options={[
          { label: "りんご", value: "apple" },
          { label: "ばなな", value: "banana" },
        ]}
      />
      <AutoCompleteMultiSelected
        name="multiAuto"
        options={[
          { label: "A", value: "a" },
          { label: "B", value: "b" },
        ]}
      />
      <SelectBox
        name="select"
        options={[
          { value: "x", label: "X" },
          { value: "y", label: "Y" },
        ]}
      />
      <div style={{ marginTop: "48px" }}>
        <h2>日付選択</h2>
        <div>
          <input type='checkbox' name='disabledCurrentDate' checked={currentDateDisabled} onClick={() => setCurrentDateDisabled(!currentDateDisabled)} />
          <label htmlFor='disabledCurrentDate'>無効化</label>
        </div>
        <DatePicker value={currentDate} disabled={currentDateDisabled} onChange={(newValue) => setCurrentDate(newValue)}/>
      </div>
      <div style={{ marginTop: "48px" }}>
        <h2>日付選択（入力制限付き）</h2>
        <DatePicker label='日付from' value={minDate} maxDate={maxDate} onChange={(newValue) => setMinDate(newValue)}/>
        <DatePicker label='日付to' value={maxDate} minDate={minDate} onChange={(newValue) => setMaxDate(newValue)}/>
      </div>
      <div style={{ marginTop: "48px" }}>
        <ButtonNext onClick={() => console.log("次へ")} />
        <ButtonBack onClick={() => console.log("戻る")} />
        <ButtonReject onClick={() => console.log("削除")} />
        <ButtonAction label="実行" onClick={() => console.log("実行")} />
      </div>

      <div>
        <h2>複数行のフォーム</h2>
        <FormRow label={'1行目'}>
          <TextBox
            name="text1"
            helperText="ヘルパーテキスト"
            error />
        </FormRow>
        <FormRow label={'2行目'}>
          <TextBox
            name="text1"
            helperText='aaaaa'
          />
        </FormRow>
        <FormRow label={'複数'}>
          <DatePicker label='日付1' />
          <DatePicker label='日付2' />
        </FormRow>
      </div>

      <Font20 sx={{ color: 'primary.main' }}>サンプルテキスト</Font20>

      <div style={{ marginTop: "48px" }}>
        <h2>LoadingSpinnerの使用例</h2>
        <ButtonAction label="ローディング開始" onClick={handleLoad} />
        <LoadingSpinner open={loading} />
      </div>

      <div>
        <h2>TooltipWrapper</h2>
        <FormRow label={'ツールチップ付きボタン'}>
          <TooltipWrapper title="ツールチップ">
            <IconButtonBase>
              <DeleteIcon />
            </IconButtonBase>
          </TooltipWrapper>
        </FormRow>
        <FormRow label={'ツールチップ付きボタン2'}>
          <TooltipWrapper title="ツールチップ">
            <ButtonAction label="ツールチップ付きボタン" onClick={() => {}}/>
          </TooltipWrapper>
        </FormRow>
        <FormRow label={'ツールチップ付きドロップボックス'}>
          <TooltipWrapper title="ツールチップ付きドロップボックス">
            <DropBox
              name="drop"
              options={[
                { value: "1", label: "選択肢1" },
                { value: "2", label: "選択肢2" },
              ]}
            />
          </TooltipWrapper>
        </FormRow>
        <FormRow label={'ツールチップ付きラジオボタン'}>
          <TooltipWrapper title="ツールチップ付きラジオボタン">
            <RadioButton
              name="radio"
              options={[
                { value: "yes", label: "はい" },
                { value: "no", label: "いいえ" },
              ]}
            />
          </TooltipWrapper>
        </FormRow>
        <FormRow label={'ツールチップ付きテキストボックス'}>
          <TooltipWrapper title="ツールチップ付きテキストボックス">
            <TextBox
              name="ツールチップ付きテキストボックス"
              helperText='aaaaa'
              />
          </TooltipWrapper>
        </FormRow>
      </div>
      <div style={{ marginTop: "48px" }}>
        <h2>モーダルウィンドウの使用例</h2>
        <h3>ModalWindow</h3>
        <ButtonAction label="モーダルを開く" onClick={openModalWindowHandler} />
        <ModalWindow
          open={openModal}
          onClose={closeModalHandler}
          title="モーダルタイトル"
          buttons={[
            {
              label: "確認",
              onClick: () => handleButtonClick("確認"),
              color: "success",
            },
            {
              label: "戻る",
              onClick: () => handleButtonClick("戻る"),
              color: "info",
            },
            {
              label: "拒否",
              onClick: () => handleButtonClick("拒否"),
              color: "error",
            },
          ]}
          showCloseButton
        >
          <div>この操作を実行しますか？</div>
        </ModalWindow>
        <h3>ModalWithButtons</h3>
        <ButtonAction label="モーダルを開く" onClick={openModalWithButtonsHandler} />
        <ModalWithButtons
          open={openModalWithButtons}
          onClose={closeModalWithButtonsHandler}
          title="モーダルウィンドウのタイトル"
          buttons={[
            {
              label: "確認",
              onClick: () => handleButtonClick("確認"),
              color: "success",
            },
            {
              label: "戻る",
              onClick: () => handleButtonClick("戻る"),
              color: "info",
            },
            {
              label: "拒否",
              onClick: () => handleButtonClick("拒否"),
              color: "error",
            },
          ]}
          showCloseButton
        >
          <div>この操作を実行しますか？</div>
        </ModalWithButtons>
      </div>
      <div>
        <h2>Snackbarテスト</h2>
        <FormRow label={'メッセージ'}>
          <TextBox
            name="snackBarInput"
            onChange={(e) => setSnackBarInput(e.target.value)}
          />
        </FormRow>
        <FormRow label={'メッセージ(改行あり)'}>
          <TextArea
            name="snackBarInput"
            onChange={(e) => setSnackBarInput(e.target.value)}
          />
        </FormRow>
        <FormRow label={'タイプ'}>
          <DropBox
            name="snackBarType"
            options={[
              { value: "SUCCESS", label: "成功" },
              { value: "ERROR", label: "エラー" },
              { value: "ALERT", label: "警告" },
            ]}
            selectedValue={snackBarTypeInput}
            onChange={(e) => setSnackBarTypeInput(e.target.value as SnackbarType)}
          />
        </FormRow>
        <ButtonAction label="開く" onClick={() => snackbar.showSnackbar(snackBarInput, snackBarTypeInput)} />
        <ButtonReject onClick={() => snackbar.hideSnackbar()} />
      </div>
    </>
  );
};

export default ComponentPage;
