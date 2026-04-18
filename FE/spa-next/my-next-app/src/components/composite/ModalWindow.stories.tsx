import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import ModalWithButtons from "./ModalWindow";
import { ButtonBase } from "../base/Button";

const meta = {
  title: "Composite/ModalWindow",
  component: ModalWithButtons,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: { type: "boolean" },
      description: "モーダルの開閉状態",
    },
    title: {
      control: { type: "text" },
      description: "モーダルのタイトル",
    },
    width: {
      control: { type: "text" },
      description: "モーダルの幅（例: '600px', '80%'）",
    },
    height: {
      control: { type: "text" },
      description: "モーダルの高さ（例: '400px', '50vh'）",
    },
    showCloseButton: {
      control: { type: "boolean" },
      description: "閉じるボタンの表示/非表示",
    },
    footerChildren: {
      control: false,
      description: "カスタムフッターコンテンツ（ReactNode）",
    },
  },
} satisfies Meta<typeof ModalWithButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基本的なモーダル
export const Default: Story = {
  args: {
    open: false,
    onClose: () => {},
    title: "基本的なモーダル",
    children: <p>これは基本的なモーダルウィンドウの内容です。</p>,
    buttons: [
      {
        label: "確認",
        onClick: () => console.log("確認がクリックされました"),
        color: "primary" as const,
      },
    ],
    showCloseButton: true,
    width: "600px",
    height: "400px",
  },
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <ButtonBase label="モーダルを開く" onClick={() => setOpen(true)} />
        <ModalWithButtons
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        >
          <p>これは基本的なモーダルウィンドウの内容です。</p>
        </ModalWithButtons>
      </>
    );
  },
};

// 複数ボタンのモーダル
export const MultipleButtons: Story = {
  args: {
    open: false,
    onClose: () => {},
    title: "確認ダイアログ",
    children: (
      <>
        <p>この操作を実行しますか？</p>
        <p>この操作は取り消すことができません。</p>
      </>
    ),
    buttons: [
      {
        label: "保存",
        onClick: () => console.log("保存がクリックされました"),
        color: "success" as const,
      },
      {
        label: "キャンセル",
        onClick: () => console.log("キャンセルがクリックされました"),
        color: "secondary" as const,
      },
      {
        label: "削除",
        onClick: () => console.log("削除がクリックされました"),
        color: "error" as const,
      },
    ],
    showCloseButton: false,
    width: "700px",
    height: "450px",
  },
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <ButtonBase label="確認ダイアログを開く" onClick={() => setOpen(true)} />
        <ModalWithButtons
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        >
          <p>この操作を実行しますか？</p>
          <p>この操作は取り消すことができません。</p>
        </ModalWithButtons>
      </>
    );
  },
};

// 長いコンテンツのモーダル（スクロール確認用）
export const LongContent: Story = {
  args: {
    open: false,
    onClose: () => {},
    title: "利用規約",
    children: (
      <div>
        <h3>第1条（目的）</h3>
        <p>
          本利用規約（以下「本規約」といいます。）は、当社が提供するサービス（以下「本サービス」といいます。）の利用条件を定めるものです。
        </p>
        <p>
          ユーザーの皆さま（以下「ユーザー」といいます。）には、本規約に従って、本サービスをご利用いただきます。
        </p>
        
        <h3>第2条（適用）</h3>
        <p>
          本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
        </p>
        <p>
          当社は本サービスに関し、本規約のほか、ご利用にあたってのルール等、各種の定め（以下「個別規定」といいます。）をすることがあります。
        </p>
        
        <h3>第3条（利用登録）</h3>
        <p>
          本サービスにおいては、登録希望者が本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
        </p>
        
        <h3>第4条（ユーザーIDおよびパスワードの管理）</h3>
        <p>
          ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。
        </p>
        <p>
          ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。
        </p>
        
        <h3>第5条（利用料金および支払方法）</h3>
        <p>
          ユーザーは、本サービスの有料部分の対価として、当社が別途定め、本ウェブサイトに表示する利用料金を、当社が指定する方法により支払うものとします。
        </p>
        
        <h3>第6条（禁止事項）</h3>
        <p>
          ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
        </p>
        <ul>
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>当社、本サービスの他のユーザー、または第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
          <li>当社のサービスの運営を妨害するおそれのある行為</li>
          <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
          <li>不正アクセスをし、またはこれを試みる行為</li>
          <li>他のユーザーに成りすます行為</li>
          <li>当社のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
          <li>当社、本サービスの他のユーザーまたは第三者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為</li>
          <li>その他、当社が不適切と判断する行為</li>
        </ul>
      </div>
    ),
    buttons: [
      {
        label: "同意する",
        onClick: () => console.log("同意されました"),
        color: "success" as const,
      },
      {
        label: "同意しない",
        onClick: () => console.log("同意されませんでした"),
        color: "error" as const,
      },
    ],
    showCloseButton: true,
    width: "800px",
    height: "600px",
  },
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <ButtonBase label="利用規約を開く" onClick={() => setOpen(true)} />
        <ModalWithButtons
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        >
          <div>
            <h3>第1条（目的）</h3>
            <p>
              本利用規約（以下「本規約」といいます。）は、当社が提供するサービス（以下「本サービス」といいます。）の利用条件を定めるものです。
            </p>
            <p>
              ユーザーの皆さま（以下「ユーザー」といいます。）には、本規約に従って、本サービスをご利用いただきます。
            </p>
            
            <h3>第2条（適用）</h3>
            <p>
              本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
            </p>
            <p>
              当社は本サービスに関し、本規約のほか、ご利用にあたってのルール等、各種の定め（以下「個別規定」といいます。）をすることがあります。
            </p>
            
            <h3>第3条（利用登録）</h3>
            <p>
              本サービスにおいては、登録希望者が本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
            </p>
            
            <h3>第4条（ユーザーIDおよびパスワードの管理）</h3>
            <p>
              ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。
            </p>
            <p>
              ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。
            </p>
            
            <h3>第5条（利用料金および支払方法）</h3>
            <p>
              ユーザーは、本サービスの有料部分の対価として、当社が別途定め、本ウェブサイトに表示する利用料金を、当社が指定する方法により支払うものとします。
            </p>
            
            <h3>第6条（禁止事項）</h3>
            <p>
              ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
            </p>
            <ul>
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当社、本サービスの他のユーザー、または第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
              <li>当社のサービスの運営を妨害するおそれのある行為</li>
              <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
              <li>不正アクセスをし、またはこれを試みる行為</li>
              <li>他のユーザーに成りすます行為</li>
              <li>当社のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
              <li>当社、本サービスの他のユーザーまたは第三者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ul>
          </div>
        </ModalWithButtons>
      </>
    );
  },
};

// 小さいモーダル
export const SmallModal: Story = {
  args: {
    open: false,
    onClose: () => {},
    title: "削除確認",
    children: (
      <>
        <p>本当に削除しますか？</p>
        <p style={{ color: "red", fontWeight: "bold" }}>
          この操作は取り消すことができません。
        </p>
      </>
    ),
    buttons: [
      {
        label: "削除",
        onClick: () => console.log("削除されました"),
        color: "error" as const,
      },
    ],
    showCloseButton: true,
    width: "400px",
    height: "250px",
  },
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <ButtonBase label="削除確認を開く" onClick={() => setOpen(true)} color="error" />
        <ModalWithButtons
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        >
          <p>本当に削除しますか？</p>
          <p style={{ color: "red", fontWeight: "bold" }}>
            この操作は取り消すことができません。
          </p>
        </ModalWithButtons>
      </>
    );
  },
};

// 大きいモーダル（ビューポートの制限確認用）
export const LargeModal: Story = {
  args: {
    open: false,
    onClose: () => {},
    title: "大きなモーダル",
    children: (
      <div style={{ padding: "20px" }}>
        <h2>このモーダルは大きなサイズで設定されています</h2>
        <p>
          幅1200px、高さ800pxに設定されていますが、画面サイズに応じて最大90vw、90vhに制限されます。
        </p>
        <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#f0f0f0" }}>
          <h3>レスポンシブデザイン</h3>
          <p>
            画面サイズが小さい場合でも、モーダルが画面内に収まるように自動的に調整されます。
          </p>
        </div>
      </div>
    ),
    buttons: [
      {
        label: "OK",
        onClick: () => console.log("OKがクリックされました"),
        color: "primary" as const,
      },
    ],
    showCloseButton: true,
    width: "1200px",
    height: "800px",
  },
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <ButtonBase label="大きなモーダルを開く" onClick={() => setOpen(true)} />
        <ModalWithButtons
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        >
          <div style={{ padding: "20px" }}>
            <h2>このモーダルは大きなサイズで設定されています</h2>
            <p>
              幅1200px、高さ800pxに設定されていますが、画面サイズに応じて最大90vw、90vhに制限されます。
            </p>
            <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#f0f0f0" }}>
              <h3>レスポンシブデザイン</h3>
              <p>
                画面サイズが小さい場合でも、モーダルが画面内に収まるように自動的に調整されます。
              </p>
            </div>
          </div>
        </ModalWithButtons>
      </>
    );
  },
};

// インタラクティブな例（フォーム付き）
export const WithForm: Story = {
  args: {
    open: false,
    onClose: () => {},
    title: "ユーザー情報編集",
    children: (
      <form style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label htmlFor="name" style={{ display: "block", marginBottom: "8px" }}>
            名前
          </label>
          <input
            id="name"
            type="text"
            placeholder="山田太郎"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label htmlFor="email" style={{ display: "block", marginBottom: "8px" }}>
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            placeholder="example@email.com"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label htmlFor="bio" style={{ display: "block", marginBottom: "8px" }}>
            自己紹介
          </label>
          <textarea
            id="bio"
            rows={4}
            placeholder="自己紹介を入力してください"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
      </form>
    ),
    buttons: [
      {
        label: "保存",
        onClick: () => console.log("保存されました"),
        color: "success" as const,
      },
      {
        label: "リセット",
        onClick: () => console.log("リセットされました"),
        color: "warning" as const,
      },
    ],
    showCloseButton: true,
    width: "600px",
    height: "500px",
  },
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <ButtonBase label="編集フォームを開く" onClick={() => setOpen(true)} color="primary" />
        <ModalWithButtons
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        >
          <form style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label htmlFor="name" style={{ display: "block", marginBottom: "8px" }}>
                名前
              </label>
              <input
                id="name"
                type="text"
                placeholder="山田太郎"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div>
              <label htmlFor="email" style={{ display: "block", marginBottom: "8px" }}>
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                placeholder="example@email.com"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div>
              <label htmlFor="bio" style={{ display: "block", marginBottom: "8px" }}>
                自己紹介
              </label>
              <textarea
                id="bio"
                rows={4}
                placeholder="自己紹介を入力してください"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>
          </form>
        </ModalWithButtons>
      </>
    );
  },
};

// カスタムフッターの例
export const CustomFooter: Story = {
  args: {
    open: false,
    onClose: () => {},
    title: "カスタムフッター付きモーダル",
    children: (
      <div>
        <h3>カスタムフッターの例</h3>
        <p>
          このモーダルはfooterChildrenプロパティを使用して、
          独自のフッター内容を定義しています。
        </p>
        <p>
          チェックボックスやカスタムレイアウトなど、
          標準のボタン配置では実現できない複雑なフッターを作成できます。
        </p>
        <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
          <p style={{ margin: 0 }}>
            <strong>footerChildrenを使用する利点：</strong>
          </p>
          <ul style={{ marginTop: "8px", marginBottom: 0 }}>
            <li>完全にカスタマイズ可能なフッターレイアウト</li>
            <li>チェックボックスや進捗表示などの追加要素</li>
            <li>条件付きボタンの表示制御</li>
            <li>独自のスタイリング適用</li>
          </ul>
        </div>
      </div>
    ),
    buttons: [], // footerChildrenを使用するのでボタンは不要
    showCloseButton: false,
    width: "700px",
    height: "400px",
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleProcess = () => {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        console.log("処理が完了しました");
      }, 2000);
    };

    return (
      <>
        <ButtonBase label="カスタムフッターモーダルを開く" onClick={() => setOpen(true)} />
        <ModalWithButtons
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          footerChildren={
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input type="checkbox" id="agree" />
                <label htmlFor="agree">利用規約に同意する</label>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <ButtonBase
                  label={isProcessing ? "処理中..." : "実行"}
                  onClick={handleProcess}
                  color="primary"
                  disabled={isProcessing}
                />
                <ButtonBase
                  label="キャンセル"
                  onClick={() => setOpen(false)}
                  color="secondary"
                />
              </div>
            </div>
          }
        >
          <div>
            <h3>カスタムフッターの例</h3>
            <p>
              このモーダルはfooterChildrenプロパティを使用して、
              独自のフッター内容を定義しています。
            </p>
            <p>
              チェックボックスやカスタムレイアウトなど、
              標準のボタン配置では実現できない複雑なフッターを作成できます。
            </p>
            <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
              <p style={{ margin: 0 }}>
                <strong>footerChildrenを使用する利点：</strong>
              </p>
              <ul style={{ marginTop: "8px", marginBottom: 0 }}>
                <li>完全にカスタマイズ可能なフッターレイアウト</li>
                <li>チェックボックスや進捗表示などの追加要素</li>
                <li>条件付きボタンの表示制御</li>
                <li>独自のスタイリング適用</li>
              </ul>
            </div>
          </div>
        </ModalWithButtons>
      </>
    );
  },
};

// 進捗表示付きフッターの例
export const FooterWithProgress: Story = {
  args: {
    open: false,
    onClose: () => {},
    title: "ファイルアップロード",
    children: (
      <div>
        <h3>ファイルアップロード</h3>
        <div style={{ 
          marginTop: "20px", 
          padding: "40px", 
          border: "2px dashed #ccc", 
          borderRadius: "8px",
          textAlign: "center",
          backgroundColor: "#fafafa"
        }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
            ファイルをドラッグ＆ドロップ
          </p>
          <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
            または、クリックしてファイルを選択
          </p>
        </div>
        <p style={{ marginTop: "16px", fontSize: "14px", color: "#666" }}>
          対応形式: JPG, PNG, PDF (最大10MB)
        </p>
      </div>
    ),
    buttons: [], // footerChildrenを使用
    showCloseButton: false,
    width: "600px",
    height: "350px",
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = () => {
      setIsUploading(true);
      setProgress(0);
      
      // アップロードのシミュレーション
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            console.log("アップロード完了");
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    };

    const handleClose = () => {
      if (!isUploading) {
        setOpen(false);
        setProgress(0);
      }
    };

    return (
      <>
        <ButtonBase label="アップロードモーダルを開く" onClick={() => setOpen(true)} color="primary" />
        <ModalWithButtons
          {...args}
          open={open}
          onClose={handleClose}
          footerChildren={
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
              {isUploading && (
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "14px", color: "#666" }}>アップロード中...</span>
                    <span style={{ fontSize: "14px", color: "#666" }}>{progress}%</span>
                  </div>
                  <div style={{ 
                    width: "100%", 
                    height: "8px", 
                    backgroundColor: "#e0e0e0", 
                    borderRadius: "4px",
                    overflow: "hidden"
                  }}>
                    <div style={{ 
                      width: `${progress}%`, 
                      height: "100%", 
                      backgroundColor: "#1976d2",
                      transition: "width 0.3s ease-in-out"
                    }} />
                  </div>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <ButtonBase
                  label={isUploading ? "アップロード中..." : (progress === 100 ? "完了" : "アップロード開始")}
                  onClick={handleUpload}
                  color={progress === 100 ? ("success" as const) : ("primary" as const)}
                  disabled={isUploading}
                />
                <ButtonBase
                  label="閉じる"
                  onClick={handleClose}
                  color="secondary"
                  disabled={isUploading}
                />
              </div>
            </div>
          }
        >
          <div>
            <h3>ファイルアップロード</h3>
            <div style={{ 
              marginTop: "20px", 
              padding: "40px", 
              border: "2px dashed #ccc", 
              borderRadius: "8px",
              textAlign: "center",
              backgroundColor: "#fafafa"
            }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
                ファイルをドラッグ＆ドロップ
              </p>
              <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                または、クリックしてファイルを選択
              </p>
            </div>
            <p style={{ marginTop: "16px", fontSize: "14px", color: "#666" }}>
              対応形式: JPG, PNG, PDF (最大10MB)
            </p>
          </div>
        </ModalWithButtons>
      </>
    );
  },
};