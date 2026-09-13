$content = Get-Content 'src/pages/dashboard/merch-pickup/index.tsx'
# Keep lines 1-2, skip lines 3-888 (old commented code + duplicate), keep lines 889+
$kept = $content[0..1] + $content[888..($content.Length - 1)]
Set-Content 'src/pages/dashboard/merch-pickup/index.tsx' -Value $kept
Write-Host "Done. New line count: $($kept.Length)"