## RapidReport 帳票作成 ノウハウ集

## 概要
本ドキュメントは、RapidReportを用いた帳票の作成手順および基本操作、留意点、ノウハウをまとめた設計書です。帳票の新規作成から、テンプレートの活用、よくあるケースへの対応方法までをカバーしており、開発者が効率的に帳票作成を行えるよう支援します。

---
## 1. インストール手順
1. 以下のURLにアクセスします：
https://rapidreport.systembase.co.jp/download__.html
2. 「rapidreport5.18.exe」をクリックします。
3. 任意の場所（例：ダウンロードフォルダ）にファイルを保存します。
4. ダウンロードした rapidreport5.18.exe を実行し、Cドライブ直下など任意のディレクトリにインストールします。

---
## 2. 起動手順
1. 「C:\RapidReport\designer」ディレクトリに移動する
2. 「reportdesigner4.exe」をダブルクリックする。
3.  業務でカスタムな帳票を作成すると思うので、一番左側の空白から作成の「選択」を押下する
4. CSVやDBからデータ入力が求められるが、ここでは一旦不要なため「デザイン開始」を押下する

---
## 3. 操作説明
※このドキュメントでは、手取り足取り解説いたしません。

1. 左上メニューバーの「学習」を押下
2. 「ツアーを開く」を押下
3. 表示される example1.rrtr および example2.rrtr を順に確認・操作してください。※一度にすべてを理解することは出来ないため、必要に応じて何度でも見直すことを推奨します。
4. ツアーで解説してくれない機能も多いので、以下、公式ドキュメントも参考にしてください。
「式の仕様」が特に「式の仕様」は非常に参考になります。
https://rapidreport.systembase.co.jp/howtodevelop.html

---
## 4. RapidReportへのパラメータの渡し方（インタフェース）

 入力値 **（Mapのkeyを元に、RapidReport側で参照します）**
 入力値の作り方については、「7. その他」をご参照ください。
```
ArrayList (size=1)   //mappedData 
└── LinkedHashMap (size=6)
    ├── "startDateOfApplication": LocalDate "2025-07-08"
    ├── "expectedEntryTime": LocalTime "10:00"
    ├── "visitStatusId": "VS000001"
    ├── "affiliation": "株式会社サンプル"
    ├── "visitorName": "田中 太郎"
    └── "visitCategory": "A01"
```

RapidReportへ書き出しを行う処理
``` java
// RapidReportのテンプレートファイル読み込み
CommonReportContext context = generateReportCommon(reportId, "pdf");
// バイナリーファイルを書き出すStreamを指定
ByteArrayOutputStream out = new ByteArrayOutputStream();
// 書き出し処理開始
pdfGenerator.fillTemplate(context.getTemplateFile(), context.getLayout(), mappedData, out);
```

---
## 5. 注意事項
- 「グループ」「コンテント」は、ツアーでも行っている通り「ヘッダー」「ボディー」「フッター」等に分けることを推奨します。理由は、あとからレイアウト調整や集計を行うことが困難になります。
- 「原価計算表」のような小計等の集計を行いたい場合は、ツアーの「example2.rrtr」の「グループ」「コンテント」の構造を**丸パクり**してください。理由は、RapidReport単体では正しく集計が動作しないためです。
- **「小計の総合計」** は、BEのjavaで事前に集計し、RapidReportにパラメータ（変数）を渡すこと。  
  理由は、RapidReportには「グループ横断での集計機能」がないためです。

---
## 6. ノウハウ集
* **✅ 繰り返し同じ項目を出力したい**
  * 「グループ」の「明細」のチェックボックスにチェックを入れてください。入れる際、本当にその階層のグループにチェックを入れるのが正しいのか確認してください。誤った階層に設定すると、レイアウトが崩れて正しく出力されません。

* **✅ 特定の種別ごとに「小計」を挿入したい**
  * 「グループ」のパラメータに「ブレーク条件キー」というモノがありますが、これを使用すると特定のグループ終了時に、特定のコンテントを定期的に挿入することが可能になります。使用例としては、商品を種類分けして、その種別毎に小計行を差し込みたい場合に有効です。

* **✅ 帳票にデータをマッピングしたい**
  * 「ツール」⇒「プレビュー」⇒「データ取得」で、任意の方法でデータを取得する。オススメはCSV。インポートしたヘッダーのカラム名が「レポート」⇒「コンテント」⇒「field」⇒「式」の文字列が同一である必要があります。

* **✅ 余白をmm単位で調整したい**
  * 「メニューバー」⇒「ツール」⇒「設定」⇒「単位」⇒「mm」⇒「余白の数字を任意の値に指定」

---
## 7. その他
おすすめの入力値（mappedData）の作り方

1. yamlファイルを作成し、取得するデータを定義する（例：BE\appserver\src\main\resources\config\reports\010_R01_report.yaml）
``` java
// 4. YAMLのテンプレートファイルを取得して、entityとrepositoryを特定する
    ReportSchema reportSchema = reportTemplateMapper.loadReportTemplate(fileName + "_report");
    List<ReportFieldSchema> map = reportSchema.getMappings();
```

2. DBのテーブル毎にMapをグルーピングする
``` java
    Map<String, List<ReportFieldSchema>> groupedByRepository = map.stream()
        .collect(Collectors.groupingBy(ReportFieldSchema::getRepository));
```
3. グルーピングしたMapの種類分、テーブルからデータを取得する
```java
    for (Map.Entry<String, List<ReportFieldSchema>> entry : groupedByRepository.entrySet()) {
        String repositoryName = entry.getKey(); // e.g. "userRepository"
        JpaRepository<?, ?> repository = (JpaRepository<?, ?>) applicationContext.getBean(repositoryName);
        List<Object> results = (List<Object>) genericEntityReader.findAllEntities(repository);
        List<ReportFieldSchema> fields = entry.getValue(); // YAMLで定義されたフィールド

        for (Object entity : results) {
            Map<String, Object> rowData = new LinkedHashMap<>();

            for (ReportFieldSchema schema : fields) {
                String fieldId = schema.getField(); // YAMLのfieldIdをkeyに使う
                Object value = extractFieldValue(entity, fieldId);
                rowData.put(fieldId, value);
            }

            mappedData.add(rowData);
        }
    }
```

