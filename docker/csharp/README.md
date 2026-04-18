# C# Family（.NET 8 SDK）

`csharp` family は、Linux コンテナで .NET（Core/5+/6+/8+）を開発するためのテンプレートです。

## 起動

family 切替前に、既存 family を停止してください。

```bash
docker/stack.sh --family modern down
docker/stack.sh --family csharp up
docker/stack.sh --family csharp status
```

## 停止

```bash
docker/stack.sh --family csharp down
```

## SDK 確認

```bash
docker compose --project-name jems-dev-csharp \
  -f docker/compose.base.yml -f docker/compose.family.csharp.yml \
  exec -T csharp-sdk dotnet --info
```

## 代表コマンド

```bash
# 新規ソリューション作成（例）
docker compose --project-name jems-dev-csharp \
  -f docker/compose.base.yml -f docker/compose.family.csharp.yml \
  exec -T csharp-sdk dotnet new sln -n LegacyModernization

# Web API テンプレート作成（例）
docker compose --project-name jems-dev-csharp \
  -f docker/compose.base.yml -f docker/compose.family.csharp.yml \
  exec -T csharp-sdk dotnet new webapi -n ApiServer -o src/ApiServer

# 復元 / ビルド / テスト（例）
docker compose --project-name jems-dev-csharp \
  -f docker/compose.base.yml -f docker/compose.family.csharp.yml \
  exec -T csharp-sdk dotnet restore
docker compose --project-name jems-dev-csharp \
  -f docker/compose.base.yml -f docker/compose.family.csharp.yml \
  exec -T csharp-sdk dotnet build
docker compose --project-name jems-dev-csharp \
  -f docker/compose.base.yml -f docker/compose.family.csharp.yml \
  exec -T csharp-sdk dotnet test
```

## メモ

- ベースラインは `.NET 8 SDK`（`mcr.microsoft.com/dotnet/sdk:8.0`）。
- NuGet キャッシュは `dist/csharp/nuget` に保存されます。
- family は当面排他的運用です。`modern` と `csharp` を同時起動しないでください。
