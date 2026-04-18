# generate-authors-from-multiple-repos.ps1
param (
    [string]$baseUrl = "http://sys.dev.genesys-eco.jp/svn/snp2",
    [string[]]$subdirs = @("documents", "kun", "navi", "sanpaikun_cron"),
    [string]$outputFile = "authors.txt"
)

$allAuthors = @()

foreach ($subdir in $subdirs) {
    $url = "$baseUrl/$subdir/"
    Write-Host "`n🔍 Fetching SVN log from $url"
    try {
        $log = svn log $url --quiet
    } catch {
        Write-Warning "⚠ Failed to fetch log for $url"
        continue
    }

    $authors = $log | Where-Object { $_ -match "^r\d+" } | ForEach-Object {
        ($_ -split '\|')[1].Trim()
    }

    $allAuthors += $authors
}

# ユニークなユーザー名を抽出して整形
$uniqueAuthors = $allAuthors | Sort-Object -Unique

Write-Host "`n📝 Writing authors to $outputFile"

$uniqueAuthors | ForEach-Object {
    "$_ = $_ <$_@example.com>"  # 仮メールアドレスは後で編集
} | Set-Content $outputFile

Write-Host "`n✅ Completed. authors.txt created with $($uniqueAuthors.Count) users."
