$content = Get-Content 'src/controllers/RapportController.ts' -Raw  
$content = $content -replace "{ type: 'cette_annee' },\r\n  { type: 'personnalise' }," "{ type: 'cette_annee' },"  
"  { type: 'personnalise' },"  
Set-Content 'src/controllers/RapportController.ts' $content  
