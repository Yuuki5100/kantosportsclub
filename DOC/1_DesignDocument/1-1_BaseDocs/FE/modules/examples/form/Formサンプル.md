// src/pages/user.tsx
import React, { useEffect, useState } from "react";

import SideMenu from "../../components/composite/sideMenu/SideMenu";
import { Role } from "../../components/composite/sideMenu/SideMenuDataRole";
import { Box } from "@mui/material";
import { SIDEBAR_WIDTH, HEADER_HEIGHT } from "../../components/config";

import { useError } from "../../hooks/useError"; // Redux版エラーフック
import { useSnackbar } from "../../hooks/useSnackbar"; // Redux版スナックバーフック
import { useCurrentLanguage } from "../../hooks/useCurrentLanguage"; // Redux版言語状態フック
import apiClient from "../../api/apiClient";
import { handleApiError } from "../../utils/errorHandler";

import TextBox from "../../components/base/input/TextBox";
import TextArea from "../../components/base/input/TextBoxMultiLine";
import DropBox from "../../components/base/input/DropBox";
import DropBoxMultiSelected from "../../components/base/input/DropBoxMultiSelected";
import RadioButton from "../../components/base/input/RadioButton";
import CheckBox from "../../components/base/input/CheckBox";
import AutoComplete from "../../components/base/input/AutoComplete";
import AutoCompleteMultiSelected from "../../components/base/input/AutoCompleteMultiSelected";
import SelectBox from "../../components/base/input/SelectBox";
import { ButtonReject, ButtonNext, ButtonBack, ButtonBase } from "../../components/base/button";
import {Font10, Font12, Font14, Font16, Font18, Font20, Font24, Font30, FontBase,} from "../../components/base/font";

import LoadingSpinner from "../../components/composite/LoadingSpinner";
import ModalWindow from "../../components/composite/ModalWindow";
import Breadcrumb from "../../components/composite/breadcrumb/Breadcrumb";
import ListView from "../../components/composite/listview/ListView";
import { SearchParams } from "../../components/composite/listview/ListViewSearchParams";

const UserPage = () => {
  // サイドメニュー
  const userRole = Role.Role01;

  // Form関連
  const [textValue, setTextValue] = useState("");
  const [numberValue, setNumberValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [emailValue, setEmailValue] = useState("");

  // LoadingSpinner関連
  const [loading, setLoading] = useState(false);
  const handleLoad = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

    // ModalWindows関連
  const [openModal, setOpenModal] = useState(false);
  const openModalHandler = () => {
    setOpenModal(true);
  };
  const closeModalHandler = () => {
    setOpenModal(false);
  };
  const handleButtonClick = (label: string) => {
    console.log(`${label} ボタンがクリックされました`);
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* サイドメニュー（ヘッダーの下に固定） */}
      <SideMenu userRole={userRole} />

      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: `${HEADER_HEIGHT}px`, // ← ヘッダーの高さ分だけ下げる
          ml: `${SIDEBAR_WIDTH}px`, // ← サイドメニューの幅だけ右にずらす
          p: 3,
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,

        }}
      >


        <h1>フォーム（入力フィールド、バリデーション）</h1>



<div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "32px" }}>
<h2>TextBoxの使用例</h2>
{/* テキスト入力 */}
  <TextBox name="textInput" helperText="テキストを入力してください" />

  {/* 初期値あり・非活性 */}
  <TextBox
    name="textDisabled"
    defaultValue="初期値テキスト"
    disabled
    helperText="初期値あり・非活性"
  />

  {/* 数値入力＋単位kg */}
  <TextBox
    name="numberInput"
    type="number"
    unit="kg"
    helperText="体重を入力してください"
  />

  {/* パスワード入力 */}
  <TextBox
    name="passwordInput"
    type="password"
    helperText="パスワードを入力してください"
  />

  {/* メールアドレス入力 */}
  <TextBox
    name="emailInput"
    type="email"
    helperText="メールアドレスを入力してください"
  />

  {/* カスタムスタイル適用 */}
  <TextBox
    name="customStyleInput"
    helperText="カスタムスタイルの例"
    customStyle={{
      backgroundColor: "#f5faff",
      border: "1px solid #90caf9",
      borderRadius: "8px",
    }}
  />
</div>

<div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "48px" }}>
  <h2>TextBoxMultiLine（TextArea）の使用例</h2>

  {/* シンプルな使用例（オプションなし） */}
  <TextArea name="simpleTextArea" />

  {/* 非活性。デフォルトの文字あり */}
  <TextArea
    name="disabledTextArea"
    defaultValue="ここは非活性です。文字エリア文字エリア文字エリア"
    disabled
  />

  {/* maxLength = 1000 */}
  <TextArea
    name="limitedTextArea"
    maxLength={1000}
    defaultValue="最大1000文字まで入力できます"
  />
</div>

{/* ▼ DropBox 使用例 ▼ */}
<div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "48px" }}>
  <h2>DropBox（ドロップダウン）の使用例</h2>

  {/* 1. シンプル：選択肢が10個 */}
  <DropBox
    name="simpleDropdown"
    defaultOptions={[
      { value: "opt1", label: "選択肢1" },
      { value: "opt2", label: "選択肢2" },
      { value: "opt3", label: "選択肢3" },
      { value: "opt4", label: "選択肢4" },
      { value: "opt5", label: "選択肢5" },
      { value: "opt6", label: "選択肢6" },
      { value: "opt7", label: "選択肢7" },
      { value: "opt8", label: "選択肢8" },
      { value: "opt9", label: "選択肢9" },
      { value: "opt10", label: "選択肢10" },
    ]}
    helperText="シンプルな10個の選択肢"
  />

  {/* 2. 3番目が選択できない */}
  <DropBox
    name="disabledOptionDropdown"
    defaultOptions={[
      { value: "opt1", label: "選択肢1" },
      { value: "opt2", label: "選択肢2" },
      { value: "opt3", label: "選択肢3", disabled: true }, // ← ここが選択不可
      { value: "opt4", label: "選択肢4" },
    ]}
    helperText="3番目の選択肢は無効化されています"
  />

  {/* 3. 非活性、4番目が選択されている */}
  <DropBox
    name="readonlyDropdown"
    selectedValue="opt4"
    defaultOptions={[
      { value: "opt1", label: "選択肢1" },
      { value: "opt2", label: "選択肢2" },
      { value: "opt3", label: "選択肢3" },
      { value: "opt4", label: "選択肢4" },
    ]}
    disabled
    helperText="これは非活性です（選択肢4が選択中）"
  />
</div>


{/* ▼ DropBoxMultiSelected 使用例 ▼ */}
<div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "48px" }}>
  <h2>DropBoxMultiSelected（複数選択ドロップダウン）の使用例</h2>

  {/* パターン①：シンプル（選択肢10個、未選択） */}
  <DropBoxMultiSelected
    name="multiSimple"
    defaultOptions={[
      { value: "opt1", label: "選択肢1" },
      { value: "opt2", label: "選択肢2" },
      { value: "opt3", label: "選択肢3" },
      { value: "opt4", label: "選択肢4" },
      { value: "opt5", label: "選択肢5" },
      { value: "opt6", label: "選択肢6" },
      { value: "opt7", label: "選択肢7" },
      { value: "opt8", label: "選択肢8" },
      { value: "opt9", label: "選択肢9" },
      { value: "opt10", label: "選択肢10" },
    ]}
    helperText="シンプルな10個の選択肢"
  />

  {/* パターン②：3番目が選択できない */}
  <DropBoxMultiSelected
    name="multiDisabledOption"
    defaultOptions={[
      { value: "opt1", label: "選択肢1" },
      { value: "opt2", label: "選択肢2" },
      { value: "opt3", label: "選択肢3", disabled: true }, // ← ここが選択不可
      { value: "opt4", label: "選択肢4" },
      { value: "opt5", label: "選択肢5" },
    ]}
    helperText="3番目は選択不可"
  />

  {/* パターン③：非活性、初期選択あり（4番目と6番目） */}
  <DropBoxMultiSelected
    name="multiReadonly"
    selectedValues={["opt4", "opt6"]}
    defaultOptions={[
      { value: "opt1", label: "選択肢1" },
      { value: "opt2", label: "選択肢2" },
      { value: "opt3", label: "選択肢3" },
      { value: "opt4", label: "選択肢4" },
      { value: "opt5", label: "選択肢5" },
      { value: "opt6", label: "選択肢6" },
    ]}
    disabled
    helperText="4番目と6番目が選択された非活性のドロップダウン"
  />
</div>


{/* ▼ RadioButton 使用例 ▼ */}
<div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "48px" }}>
  <h2>RadioButton（ラジオボタン）の使用例</h2>

  {/* パターン①：シンプルなラジオボタン */}
  <RadioButton
    name="radioSimple"
    options={[
      { value: "a", label: "選択肢A" },
      { value: "b", label: "選択肢B" },
      { value: "c", label: "選択肢C" },
    ]}
    helperText="シンプルな3択ラジオボタン"
  />

  {/* パターン②：3番目の選択肢だけ非活性 */}
  <RadioButton
    name="radioWithDisabledOption"
    options={[
      { value: "a", label: "選択肢A" },
      { value: "b", label: "選択肢B" },
      { value: "c", label: "選択肢C（選べません）", disabled: true },
    ]}
    helperText="3番目の選択肢は無効化されています"
  />

  {/* パターン③：全体が非活性、初期値あり */}
  <RadioButton
    name="radioDisabled"
    selectedValue="b"
    disabled
    options={[
      { value: "a", label: "選択肢A" },
      { value: "b", label: "選択肢B（選択中）" },
      { value: "c", label: "選択肢C" },
    ]}
    helperText="選択肢Bが選択された状態で、全体が非活性です"
  />

  {/* パターン④：横並び、最大3列に制限 */}
  <RadioButton
    name="radioRowLayout"
    options={[
      { value: "1", label: "1番" },
      { value: "2", label: "2番" },
      { value: "3", label: "3番" },
      { value: "4", label: "4番" },
      { value: "5", label: "5番" },
      { value: "6", label: "6番" },
    ]}
    direction="row"
    maxColumns={3}
    helperText="横並び（最大3列）のラジオボタン"
  />
</div>

{/* ▼ CheckBox 使用例 ▼ */}
<div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "48px" }}>
  <h2>CheckBox（チェックボックス）の使用例</h2>

  {/* パターン①：シンプルな複数選択 */}
  <CheckBox
    name="checkSimple"
    options={[
      { value: "a", label: "項目A" },
      { value: "b", label: "項目B" },
      { value: "c", label: "項目C" },
    ]}
    helperText="複数選択可能なシンプルチェックボックス"
  />

  {/* パターン②：3番目の選択肢だけ非活性 */}
  <CheckBox
    name="checkWithDisabledOption"
    options={[
      { value: "a", label: "項目A" },
      { value: "b", label: "項目B" },
      { value: "c", label: "項目C（選択不可）", disabled: true },
    ]}
    helperText="3番目の選択肢は無効化されています"
  />

  {/* パターン③：非活性、2つ選択された状態で表示 */}
  <CheckBox
    name="checkDisabled"
    selectedValues={["a", "c"]}
    disabled
    options={[
      { value: "a", label: "項目A" },
      { value: "b", label: "項目B" },
      { value: "c", label: "項目C" },
    ]}
    helperText="選択済みの状態で全体を非活性にしています"
  />

  {/* パターン④：横並び、最大2列表示 */}
  <CheckBox
    name="checkRowLayout"
    selectedValues={["1", "4"]}
    options={[
      { value: "1", label: "選択肢1" },
      { value: "2", label: "選択肢2" },
      { value: "3", label: "選択肢3" },
      { value: "4", label: "選択肢4" },
    ]}
    direction="row"
    maxColumns={2}
    helperText="横並び・2列で表示されるチェックボックス"
  />
</div>

{/* ▼ AutoComplete 使用例（選択肢10個） ▼ */}
<div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "48px" }}>
  <h2>AutoComplete（オートコンプリート）の使用例</h2>

  {/* パターン①：シンプルなオートコンプリート */}
  <AutoComplete
    name="autoSimple"
    options={[
      { label: "りんご", value: "apple" },
      { label: "みかん", value: "orange" },
      { label: "ぶどう", value: "grape" },
      { label: "バナナ", value: "banana" },
      { label: "もも", value: "peach" },
      { label: "いちご", value: "strawberry" },
      { label: "メロン", value: "melon" },
      { label: "キウイ", value: "kiwi" },
      { label: "パイナップル", value: "pineapple" },
      { label: "すいか", value: "watermelon" },
    ]}
    helperText="果物10種類の中から選択できます"
  />

  {/* パターン②：初期値あり（バナナ） */}
  <AutoComplete
    name="autoWithDefault"
    defaultValue="banana"
    options={[
      { label: "りんご", value: "apple" },
      { label: "みかん", value: "orange" },
      { label: "ぶどう", value: "grape" },
      { label: "バナナ", value: "banana" },
      { label: "もも", value: "peach" },
      { label: "いちご", value: "strawberry" },
      { label: "メロン", value: "melon" },
      { label: "キウイ", value: "kiwi" },
      { label: "パイナップル", value: "pineapple" },
      { label: "すいか", value: "watermelon" },
    ]}
    helperText="初期値として「バナナ」が選択されています"
  />

  {/* パターン③：無効化された状態 */}
  <AutoComplete
    name="autoDisabled"
    defaultValue="melon"
    disabled
    options={[
      { label: "りんご", value: "apple" },
      { label: "みかん", value: "orange" },
      { label: "ぶどう", value: "grape" },
      { label: "バナナ", value: "banana" },
      { label: "もも", value: "peach" },
      { label: "いちご", value: "strawberry" },
      { label: "メロン", value: "melon" },
      { label: "キウイ", value: "kiwi" },
      { label: "パイナップル", value: "pineapple" },
      { label: "すいか", value: "watermelon" },
    ]}
    helperText="選択肢は固定され、変更できません"
  />

  {/* パターン④：エラーメッセージ表示あり */}
  <AutoComplete
    name="autoError"
    options={[
      { label: "東京", value: "tokyo" },
      { label: "大阪", value: "osaka" },
      { label: "名古屋", value: "nagoya" },
      { label: "福岡", value: "fukuoka" },
      { label: "札幌", value: "sapporo" },
      { label: "広島", value: "hiroshima" },
      { label: "仙台", value: "sendai" },
      { label: "神戸", value: "kobe" },
      { label: "京都", value: "kyoto" },
      { label: "那覇", value: "naha" },
    ]}
    errorMessage="都市名を選択してください"
  />

  {/* パターン⑤：選択変更時に console に出力 */}
  <AutoComplete
    name="autoWithChange"
    options={[
      { label: "英語", value: "en" },
      { label: "日本語", value: "ja" },
      { label: "中国語", value: "zh" },
      { label: "スペイン語", value: "es" },
      { label: "フランス語", value: "fr" },
      { label: "ドイツ語", value: "de" },
      { label: "韓国語", value: "ko" },
      { label: "イタリア語", value: "it" },
      { label: "ポルトガル語", value: "pt" },
      { label: "ロシア語", value: "ru" },
    ]}
    helperText="言語を選択すると console に出力されます"
    onChange={(val) => console.log("選択された言語：", val)}
  />
</div>

{/* ▼ AutoCompleteMultiSelected 使用例 ▼ */}
<div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "48px" }}>
  <h2>AutoCompleteMultiSelected（複数選択オートコンプリート）の使用例</h2>

  {/* パターン①：シンプル（オプションなし） */}
  <AutoCompleteMultiSelected
    name="multiSimple"
    options={[
      { label: "りんご", value: "apple" },
      { label: "みかん", value: "orange" },
      { label: "ぶどう", value: "grape" },
      { label: "バナナ", value: "banana" },
      { label: "もも", value: "peach" },
      { label: "いちご", value: "strawberry" },
      { label: "メロン", value: "melon" },
      { label: "キウイ", value: "kiwi" },
      { label: "パイナップル", value: "pineapple" },
      { label: "すいか", value: "watermelon" },
    ]}
    helperText="複数の果物を選択できます（制限なし）"
  />

<AutoCompleteMultiSelected
  name="languages"
  defaultValue={["en", "ja"]}
  options={[
    { label: "英語", value: "en" },
    { label: "日本語", value: "ja" },
    { label: "中国語", value: "zh" },
  ]}
  helperText="対応可能な言語を選択してください"
  onChange={(selected) => console.log("選択された値:", selected)}
/>

  {/* パターン③：全体を非活性化。初期値で選択済み */}
  <AutoCompleteMultiSelected
    name="multiDisabled"
    disabled
    defaultValue={["melon", "watermelon"]}
    options={[
      { label: "りんご", value: "apple" },
      { label: "みかん", value: "orange" },
      { label: "ぶどう", value: "grape" },
      { label: "バナナ", value: "banana" },
      { label: "もも", value: "peach" },
      { label: "いちご", value: "strawberry" },
      { label: "メロン", value: "melon" },
      { label: "キウイ", value: "kiwi" },
      { label: "パイナップル", value: "pineapple" },
      { label: "すいか", value: "watermelon" },
    ]}
    helperText="選択肢は固定されており変更できません"
  />
</div>

{/* ▼ SelectBox 使用例 ▼ */}
<div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "48px" }}>
  <h2>SelectBoxの使用例</h2>

  {/* パターン①：シンプルな複数選択（10件） */}
  <SelectBox
    name="simpleSelect"
    options={[
      { value: "1", label: "選択肢1" },
      { value: "2", label: "選択肢2" },
      { value: "3", label: "選択肢3" },
      { value: "4", label: "選択肢4" },
      { value: "5", label: "選択肢5" },
      { value: "6", label: "選択肢6" },
      { value: "7", label: "選択肢7" },
      { value: "8", label: "選択肢8" },
      { value: "9", label: "選択肢9" },
      { value: "10", label: "選択肢10" },
    ]}
    helperText="10個の選択肢から選べます（内部状態）"
  />

  {/* パターン②：3番目だけ選択不可 */}
  <SelectBox
    name="disableOne"
    options={[
      { value: "a", label: "A項目" },
      { value: "b", label: "B項目" },
      { value: "c", label: "C項目（選択不可）", disabled: true },
      { value: "d", label: "D項目" },
    ]}
    helperText="C項目だけ非活性にしています"
  />

  {/* パターン③：初期選択あり＋全体を非活性化 */}
  <SelectBox
    name="readonly"
    options={[
      { value: "x", label: "X項目" },
      { value: "y", label: "Y項目" },
      { value: "z", label: "Z項目" },
    ]}
    selectedValues={["x", "z"]}
    disabled
    helperText="選択済みですが編集できません（全体非活性）"
  />

  {/* パターン④：カスタムスタイル（高さ・色調整） */}
  <SelectBox
    name="customStyled"
    options={[
      { value: "r", label: "Red" },
      { value: "g", label: "Green" },
      { value: "b", label: "Blue" },
    ]}
    height={100}
    customStyle={{
      backgroundColor: "#f0f4c3",
      border: "1px solid #cddc39",
    }}
    helperText="背景や高さなどカスタマイズ可能です"
  />
</div>

{/* ▼ Button 使用例 ▼ */}
<div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "32px" }}>
<h2>Buttonの使用例</h2>

  <ButtonNext width={200} onClick={() => console.log("決定 clicked")} />
  <ButtonBack width={200}  onClick={() => console.log("戻る clicked")} />
  <ButtonReject width={200} onClick={() => console.log("削除 clicked")} />
  <ButtonBase width={200} label="カスタム" color="success" onClick={() => console.log("カスタム clicked")} />
  <ButtonBase label="なんとか機能を実行する" onClick={() => console.log("なんとか機能を実行する clicked")} width={300} />
</div>

{/* ▼ Font 使用例 ▼ */}
<div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "48px" }}>
  {/* パターン①：FontBase の基本使用（サイズ・太字あり/なし） */}
  <div>
    <h2>Fontの使用例</h2>
    <FontBase>デフォルト（16px, 通常）</FontBase>
    <FontBase bold>太字（16px）</FontBase>
    <FontBase size={14}>14px 通常</FontBase>
    <FontBase size={14} bold>14px 太字</FontBase>
    <FontBase size={20} style={{ color: "blue" }}>
      20px 青文字（styleで指定）
    </FontBase>
  </div>

  {/* パターン②：各サイズ固定フォント（Font10 ～ Font30） */}
  <div>
    <h3>サイズ別フォント（太字固定）</h3>
    <Font10>Font10（10px）</Font10>
    <Font12>Font12（12px）</Font12>
    <Font14>Font14（14px）</Font14>
    <Font16>Font16（16px）</Font16>
    <Font18>Font18（18px）</Font18>
    <Font20>Font20（20px）</Font20>
    <Font24>Font24（24px）</Font24>
    <Font30>Font30（30px）</Font30>
  </div>

  {/* パターン③：className でスタイル拡張 */}
  <div>
    <h3>Tailwind クラスを併用</h3>
    <Font20 className="text-red-500 underline">赤くて下線付きの Font20</Font20>
    <Font14 className="italic text-gray-500">斜体・グレー Font14</Font14>
  </div>

  {/* パターン④：長文での使用例 */}
  <div>
    <h3>長文表示</h3>
    <Font16>
    むかしむかし、あるところに、おじいさんとおばあさんが住んでいました。
    おじいさんは山へしばかりに、おばあさんは川へせんたくに行きました。
    おばあさんが川でせんたくをしていると、ドンブラコ、ドンブラコと、大きな桃が流れてきました。
    </Font16>
  </div>
</div>

{/* ▼ LoadingSpinner 使用例 ▼ */}
<div style={{ marginTop: "48px" }}>
  <h2>LoadingSpinnerの使用例</h2>
  <ButtonBase label="ローディング開始" onClick={handleLoad} />
  <LoadingSpinner open={loading} />
</div>


{/* ▼ ModalWindows 使用例 ▼ */}
<div style={{ marginTop: "48px" }}>
<h2>モーダルウィンドの使用例</h2>
  {/* モーダルを開くボタン */}
  <ButtonBase label="モーダルウィンドを開く" onClick={openModalHandler} />

  {/* モーダル */}
  <ModalWindow
    open={openModal}
    onClose={closeModalHandler}
    title="モーダルウィンドのタイトル"
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
    showCloseButton={true} // 「閉じる」ボタンを表示
  >
    <div>この操作を実行しますか？</div>
  </ModalWindow>
</div>

        {/* ▼ パンくずリスト 使用例 ▼ */}
        <div style={{ marginTop: "48px" }}>

  <h2>パンくずリストの使用例</h2>
  <Breadcrumb /> {/* デフォルトのパンくずリストを使用 */}
  <p>http://localhost:3000/userの場合は「カテゴリ1」として生成している。</p>
  <p>設定ファイル　：　BreadcrumbData.tsx</p>
  <p>id: "home", label: "ホーム", url: "/", isActive: false</p>
  <p>id: "category", label: "カテゴリ", url: "/category", isActive: false, parentId: "home"</p>
  <p>id: "category-1", label: "カテゴリ1", url: "/user", isActive: false, parentId: "category"</p>
</div>



      </Box>
    </Box>
  );
};
export default UserPage;
