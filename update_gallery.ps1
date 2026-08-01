$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$xlsx = Join-Path $root 'paintings.xlsx'
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
try {
  $book = $excel.Workbooks.Open($xlsx)
  $jobs = @(
    @{ Sheet='Oil Paintings'; Output='oil-data.js' },
    @{ Sheet='Watercolors'; Output='watercolor-data.js' }
  )
  foreach ($job in $jobs) {
    $sheet = $book.Worksheets.Item($job.Sheet)
    $used = $sheet.UsedRange
    $headers = @{}
    for ($c=1; $c -le $used.Columns.Count; $c++) { $headers[$sheet.Cells.Item(1,$c).Text] = $c }
    $items = @()
    for ($r=2; $r -le $used.Rows.Count; $r++) {
      $file = $sheet.Cells.Item($r,$headers['File Name']).Text
      if ([string]::IsNullOrWhiteSpace($file)) { continue }
      $items += [ordered]@{
        no = $sheet.Cells.Item($r,$headers['No.']).Value2
        file = $file
        title = $sheet.Cells.Item($r,$headers['Title']).Text
        year = $sheet.Cells.Item($r,$headers['Year']).Text
        size = $sheet.Cells.Item($r,$headers['Size']).Text
        medium = $sheet.Cells.Item($r,$headers['Medium']).Text
        category = $sheet.Cells.Item($r,$headers['Category']).Text
        description = $sheet.Cells.Item($r,$headers['Description']).Text
        status = $sheet.Cells.Item($r,$headers['Artwork Status']).Text
      }
    }
    $json = $items | ConvertTo-Json -Depth 5
    [IO.File]::WriteAllText((Join-Path $root $job.Output), "window.GALLERY_DATA = $json;`r`n", (New-Object Text.UTF8Encoding($false)))
  }
  $book.Close($false)
} finally {
  $excel.Quit()
  [Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}
Write-Host 'Gallery data updated successfully.' -ForegroundColor Green
