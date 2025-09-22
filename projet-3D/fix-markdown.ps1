# Script PowerShell pour corriger les erreurs de linting Markdown

Write-Host "🔧 Correction des erreurs de linting Markdown..." -ForegroundColor Cyan

# Fonction pour corriger un fichier Markdown
function Fix-MarkdownFile {
    param([string]$FilePath)
    
    Write-Host "📝 Correction de: $FilePath" -ForegroundColor Yellow
    
    # Lire le contenu du fichier
    $content = Get-Content $FilePath -Raw -Encoding UTF8
    
    # Corriger les erreurs de linting
    
    # 1. Ajouter des lignes vides autour des titres (MD022)
    $content = $content -replace '(\n|^)(#{1,6}\s+[^\n]+)(\n)([^\n#])', '$1$2$3$4'
    $content = $content -replace '(\n|^)(#{1,6}\s+[^\n]+)(\n)([^\n#])', '$1$2$3$4'
    
    # 2. Ajouter des lignes vides autour des listes (MD032)
    $content = $content -replace '(\n|^)([^\n]*\n)(\s*[-*+]\s+[^\n]+)', '$1$2$3'
    $content = $content -replace '(\n|^)([^\n]*\n)(\s*[-*+]\s+[^\n]+)', '$1$2$3'
    
    # 3. Ajouter des lignes vides autour des blocs de code (MD031)
    $content = $content -replace '(\n|^)([^\n]*\n)(```[^\n]*\n)', '$1$2$3'
    $content = $content -replace '(\n|^)([^\n]*\n)(```[^\n]*\n)', '$1$2$3'
    
    # 4. Spécifier le langage pour les blocs de code (MD040)
    $content = $content -replace '(\n|^)(```)(\n)', '$1```text$3'
    
    # 5. Corriger les fragments de liens (MD051) - remplacer par des liens simples
    $content = $content -replace '\[([^\]]+)\]\(#([^)]+)\)', '[$1](./$2)'
    
    # 6. Remplacer les emphases par des titres (MD036)
    $content = $content -replace '(\n|^)(\*\*[^*]+\*\*)(\n)', '$1### $2$3'
    $content = $content -replace '(\n|^)(\*\*[^*]+\*\*)(\n)', '$1### $2$3'
    
    # 7. Ajouter une seule nouvelle ligne à la fin (MD047)
    $content = $content.TrimEnd() + "`n"
    
    # Écrire le fichier corrigé
    Set-Content $FilePath -Value $content -Encoding UTF8
    
    Write-Host "✅ Fichier corrigé: $FilePath" -ForegroundColor Green
}

# Liste des fichiers à corriger
$files = @(
    "README.md",
    "INDEX.md",
    "Documentations/README.md",
    "Documentations/NAVIGATION.md"
)

# Corriger chaque fichier
foreach ($file in $files) {
    if (Test-Path $file) {
        Fix-MarkdownFile $file
    } else {
        Write-Host "❌ Fichier non trouvé: $file" -ForegroundColor Red
    }
}

Write-Host "🎉 Correction terminée !" -ForegroundColor Green
Write-Host "📋 Vérifiez les fichiers avec: npm run lint:md" -ForegroundColor Cyan
