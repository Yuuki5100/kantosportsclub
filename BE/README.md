脆弱性診断実施コマンド　pjルートで
mvn --% org.owasp:dependency-check-maven:aggregate -Ddependencycheck.autoUpdate=false -DossindexAnalyzerEnabled=false -DfailBuildOnCVSS=11  


mvn --% org.owasp:dependency-check-maven:aggregate `  -Ddependencycheck.autoUpdate=false `  -DossindexAnalyzerEnabled=false `  -DfailBuildOnCVSS=11 `  -Djavax.xml.accessExternalSchema=all `  -Djavax.xml.accessExternalDTD=all

外部スキーマ許可
mvn --% org.owasp:dependency-check-maven:aggregate `
  -Ddependencycheck.autoUpdate=false `
  -DossindexAnalyzerEnabled=false `
  -DfailBuildOnCVSS=11 `
  -Djavax.xml.accessExternalSchema=all `
  -Djavax.xml.accessExternalDTD=all

初回起動時の手順
１，ライブラリのビルド
　cd BE
  cd servercommon
  cd libs

全体ビルドコマンド
mavn clean install -DskipTests

実行コマンド
cd appserver
mvn spring-boot:run
