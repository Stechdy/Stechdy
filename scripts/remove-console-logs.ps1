# Script to remove all console.log/error/warn/info/debug/table statements from React files
param(
    [string]$Path = "d:\Stechdy_done\Stechdy\Stechdy_FE\frontend\src"
)

$filesProcessed = 0
$linesRemoved = 0

# Get all JS/JSX/TS/TSX files except test files
$files = Get-ChildItem -Path $Path -Recurse -Include *.js,*.jsx,*.ts,*.tsx -Exclude *.test.js

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remove single-line console statements (console.log, console.error, etc.)
    # Matches lines that only contain console statements with optional leading whitespace
    $content = $content -replace '(?m)^\s*console\.(log|error|warn|info|debug|table)\([^;]*\);?\s*$\r?\n?', ''
    
    # Remove console statements that are part of a line but standalone
    $content = $content -replace '\s*console\.(log|error|warn|info|debug|table)\([^)]*\);?', ''
    
    if ($content -ne $originalContent) {
        $linesBefore = ($originalContent -split "`n").Count
        $linesAfter = ($content -split "`n").Count
        $removed = $linesBefore - $linesAfter
        
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesProcessed++
        $linesRemoved += $removed
        Write-Host "✅ Processed: $($file.FullName) - Removed $removed console statement(s)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "Files processed: $filesProcessed" -ForegroundColor Yellow
Write-Host "Console statements removed: $linesRemoved" -ForegroundColor Yellow
Write-Host ""
Write-Host "Done!" -ForegroundColor Green
