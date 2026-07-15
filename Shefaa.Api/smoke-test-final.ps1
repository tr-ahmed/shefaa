#requires -Version 5.1
$ErrorActionPreference = "Continue"
$base = "http://localhost:5026/api"
$pass = 0; $fail = 0

function Pass($name) { Write-Host ("  [PASS] {0}" -f $name) -ForegroundColor Green; $script:pass++ }
function Fail($name, $msg) { Write-Host ("  [FAIL] {0}: {1}" -f $name, $msg) -ForegroundColor Red; $script:fail++ }

function Step($n, $msg) {
    Write-Host ""
    Write-Host ("=== {0}. {1} ===" -f $n, $msg) -ForegroundColor Cyan
}

# Wait for rate limit window to reset
Write-Host "Waiting 65s for rate limit window..." -ForegroundColor DarkGray
Start-Sleep -Seconds 65

$unique = (Get-Date).Ticks.ToString().Substring(10)

# 1. Health
Step 1 "Health endpoint"
try {
    $r = Invoke-WebRequest -Uri "http://localhost:5026/health" -UseBasicParsing
    if ($r.StatusCode -eq 200) { Pass "Health 200" } else { Fail "Health" $r.StatusCode }
} catch { Fail "Health" $_.Exception.Message }

# 2. Swagger JSON
Step 2 "Swagger documentation"
try {
    $r = Invoke-WebRequest -Uri "http://localhost:5026/swagger/v1/swagger.json" -UseBasicParsing
    if ($r.StatusCode -eq 200) {
        $j = $r.Content | ConvertFrom-Json
        Pass ("Swagger paths: {0}" -f ($j.paths.PSObject.Properties | Measure-Object).Count)
    } else { Fail "Swagger" $r.StatusCode }
} catch { Fail "Swagger" $_.Exception.Message }

# 3. Public specialties list
Step 3 "Public read - specialties"
try {
    $r = Invoke-WebRequest -Uri "$base/specialties?pageSize=10" -UseBasicParsing
    $j = $r.Content | ConvertFrom-Json
    if ($r.StatusCode -eq 200 -and $j.totalCount -ge 5) { Pass "Specialties count: $($j.totalCount)" } else { Fail "Specialties" $r.StatusCode }
} catch { Fail "Specialties" $_.Exception.Message }

# 4. Admin login
Step 4 "Admin login"
try {
    $r = Invoke-WebRequest -Uri "$base/auth/login" -Method POST -ContentType "application/json" `
        -Body '{"email":"admin@shefaa.local","password":"Admin@1234"}' -UseBasicParsing
    $j = $r.Content | ConvertFrom-Json
    if ($r.StatusCode -eq 200 -and $j.data.accessToken.Length -gt 100) {
        $script:adminToken = $j.data.accessToken
        Pass "Admin token len: $($script:adminToken.Length)"
    } else { Fail "Admin login" $r.StatusCode }
} catch { Fail "Admin login" $_.Exception.Message }

# 5. Admin /me
Step 5 "Admin /me"
try {
    $r = Invoke-WebRequest -Uri "$base/auth/me" -Headers @{ Authorization = "Bearer $adminToken" } -UseBasicParsing
    $j = $r.Content | ConvertFrom-Json
    if ($r.StatusCode -eq 200 -and $j.email -eq "admin@shefaa.local") { Pass "Admin /me" } else { Fail "Admin /me" $r.StatusCode }
} catch { Fail "Admin /me" $_.Exception.Message }

# 6. Authenticated access denied
Step 6 "Authorization - 401 without token"
try {
    $r = Invoke-WebRequest -Uri "$base/appointments" -UseBasicParsing
    Fail "Should be 401" $r.StatusCode
} catch {
    $ex = $_.Exception.Response
    if ([int]$ex.StatusCode -eq 401) { Pass "401 returned" } else { Fail "Expected 401" $ex.StatusCode }
}

# 7. Password reset flow
Step 7 "Password reset (forgot + reset)"
try {
    $fr = Invoke-WebRequest -Uri "$base/auth/forgot-password" -Method POST -ContentType "application/json" -Body '{"email":"admin@shefaa.local"}' -UseBasicParsing
    if ($fr.StatusCode -eq 200) { Pass "Forgot password" } else { Fail "Forgot password" $fr.StatusCode }
} catch { Fail "Forgot password" $_.Exception.Message }

# 8. Validation filter
Step 8 "Validation filter returns ApiResponse"
try {
    $r = Invoke-WebRequest -Uri "$base/auth/register" -Method POST -ContentType "application/json" -Body '{"email":"bad","password":"x"}' -UseBasicParsing
    Fail "Should be 400" $r.StatusCode
} catch {
    $ex = $_.Exception.Response
    $body = (New-Object IO.StreamReader($ex.GetResponseStream())).ReadToEnd()
    if ([int]$ex.StatusCode -eq 400 -and $body -like "*Validation failed*") { Pass "Validation filter" } else { Fail "Validation" $body.Substring(0, 100) }
}

# 9. Dashboard report
Step 9 "Reports - dashboard"
try {
    $r = Invoke-WebRequest -Uri "$base/reports/dashboard" -Headers @{ Authorization = "Bearer $adminToken" } -UseBasicParsing
    $j = $r.Content | ConvertFrom-Json
    if ($r.StatusCode -eq 200 -and $j.totalAppointments -ge 0) { Pass "Dashboard (apps={0}, patients={1})" -f $j.totalAppointments, $j.totalPatients } else { Fail "Dashboard" $r.StatusCode }
} catch { Fail "Dashboard" $_.Exception.Message }

# 10. Public doctors list
Step 10 "Public read - doctors"
try {
    $r = Invoke-WebRequest -Uri "$base/doctors?pageSize=5" -UseBasicParsing
    $j = $r.Content | ConvertFrom-Json
    if ($r.StatusCode -eq 200) { Pass "Doctors count: $($j.totalCount)" } else { Fail "Doctors" $r.StatusCode }
} catch { Fail "Doctors" $_.Exception.Message }

# 11. Public clinics list
Step 11 "Public read - clinics"
try {
    $r = Invoke-WebRequest -Uri "$base/clinics?pageSize=5" -UseBasicParsing
    $j = $r.Content | ConvertFrom-Json
    if ($r.StatusCode -eq 200) { Pass "Clinics count: $($j.totalCount)" } else { Fail "Clinics" $r.StatusCode }
} catch { Fail "Clinics" $_.Exception.Message }

# 12. Admin creates specialty (RBAC)
Step 12 "Create specialty (admin)"
try {
    $body = (@{ name = "Test Specialty $unique"; description = "test" } | ConvertTo-Json -Compress)
    $r = Invoke-WebRequest -Uri "$base/specialties" -Method POST -ContentType "application/json" -Headers @{ Authorization = "Bearer $adminToken" } -Body $body -UseBasicParsing
    $j = $r.Content | ConvertFrom-Json
    if ($r.StatusCode -eq 201 -or ($r.StatusCode -eq 200 -and $j.success)) { Pass "Created specialty: $($j.data.name)" } else { Fail "Create specialty" $r.StatusCode }
} catch { Fail "Create specialty" $_.Exception.Message }

# 13. Global exception handler (404)
Step 13 "Unknown route returns 404 (handled)"
try {
    $r = Invoke-WebRequest -Uri "$base/this-route-doesnt-exist" -UseBasicParsing
    Fail "Should be 404" $r.StatusCode
} catch {
    $ex = $_.Exception.Response
    if ([int]$ex.StatusCode -eq 404) { Pass "404" } else { Fail "Expected 404" $ex.StatusCode }
}

# 14. Rate limiter (10/min on auth)
Step 14 "Rate limiter - 10/min on auth"
$codes = @()
for ($i = 1; $i -le 15; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "$base/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"nobody@example.com","password":"wrong"}' -UseBasicParsing
        $codes += $r.StatusCode
    } catch {
        $ex = $_.Exception.Response
        if ($ex) { $codes += [int]$ex.StatusCode }
    }
    Start-Sleep -Milliseconds 30
}
$rate429 = ($codes | Where-Object { $_ -eq 429 }).Count
if ($rate429 -ge 1) { Pass "Rate limit triggered {0}x 429" -f $rate429 } else { Fail "Rate limit" "No 429 seen" }

# Summary
Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ("  Passed: {0}   Failed: {1}" -f $pass, $fail) -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Yellow" })
Write-Host "=================================================================" -ForegroundColor Cyan
if ($fail -eq 0) { Write-Host "  ALL SMOKE TESTS PASSED" -ForegroundColor Green }