for ($i = 1; $i -le 15; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:5026/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"nobody@example.com","password":"wrong"}' -UseBasicParsing
        $code = $r.StatusCode
    } catch {
        $ex = $_.Exception.Response
        $code = [int]$ex.StatusCode
    }
    Write-Host ("Attempt {0}: {1}" -f $i, $code)
    Start-Sleep -Milliseconds 30
}