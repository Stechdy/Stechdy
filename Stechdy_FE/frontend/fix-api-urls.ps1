# PowerShell script to fix all hardcoded API URLs

$files = @(
    ".\src\pages\StudyTracker\StudyTracker.jsx",
    ".\src\pages\SlotDetail\SlotDetail.jsx",
    ".\src\pages\SubjectDetail\SubjectDetail.jsx",
    ".\src\components\study\StudyTimer.jsx",
    ".\src\components\payment\PaymentModal.jsx"
)

$rootPath = "D:\Stechdy_done\Stechdy\Stechdy_FE\frontend"

foreach ($file in $files) {
    $filePath = Join-Path $rootPath $file
    
    if (Test-Path $filePath) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        $content = Get-Content -Path $filePath -Raw
        $originalContent = $content
        
        # Replace all localhost:3001/api with ${config.apiUrl}
        $content = $content -replace 'http://localhost:3001/api', '${config.apiUrl}'
        $content = $content -replace '"http://localhost:3001', '`${config.apiUrl.replace('\''/api'\'', '\'\'')}' 
        
        # Check if config import exists
        if ($content -notmatch 'import config from') {
            # Find last import line
            if ($content -match '(?s)(.*)(import .+ from .+;)(.*)') {
                $beforeLast = $matches[1]
                $lastImport = $matches[2]
                $afterLast = $matches[3]
                
                # Add config import after last import
                $newImport = "`nimport config from `"../../config`";"
                $content = $beforeLast + $lastImport + $newImport + $afterLast
            }
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $filePath -Value $content -NoNewline
            Write-Host "✅ Fixed: $file" -ForegroundColor Green
        } else {
            Write-Host "⏭️  No changes needed: $file" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`n✅ All files processed!" -ForegroundColor Green
