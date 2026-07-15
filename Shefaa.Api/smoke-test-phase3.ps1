#requires -Version 5.1
$ErrorActionPreference = "Stop"
$base = "http://localhost:5026/api"

function Step($n, $msg) {
    Write-Host ""
    Write-Host ("=== {0}. {1} ===" -f $n, $msg) -ForegroundColor Cyan
}

$unique = (Get-Date).Ticks.ToString().Substring(10)

# Login admin
$adminResp = Invoke-WebRequest -Uri "$base/auth/login" -Method POST -ContentType "application/json" `
    -Body '{"email":"admin@shefaa.local","password":"Admin@1234"}' -UseBasicParsing
$adminToken = ($adminResp.Content | ConvertFrom-Json).data.accessToken

# Use existing clinic from previous run
$clinicResp = Invoke-WebRequest -Uri "$base/clinics?pageSize=1" -UseBasicParsing
$clinicId = ($clinicResp.Content | ConvertFrom-Json).items[0].id
Write-Host ("Using clinic id = {0}" -f $clinicId)

# Create doctor
$docJson = @{
    email = "dr.tamer.$unique@example.com"
    password = "Tamer@1234"
    firstName = "Tamer"
    lastName = "Mostafa"
    userType = 2
    gender = 1
    specialtyId = 2
    licenseNumber = "EG-DERM-$unique"
    yearsOfExperience = 10
    defaultConsultationFee = 350
    defaultAppointmentDurationMinutes = 30
} | ConvertTo-Json -Compress
$docResp = Invoke-WebRequest -Uri "$base/doctors" -Method POST -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $adminToken" } -Body $docJson -UseBasicParsing
$doc = ($docResp.Content | ConvertFrom-Json).data
Write-Host ("Doctor created id = {0}" -f $doc.id)

# Login as the doctor (for doctor-only endpoints)
$docLogin = Invoke-WebRequest -Uri "$base/auth/login" -Method POST -ContentType "application/json" `
    -Body "{`"email`":`"dr.tamer.$unique@example.com`",`"password`":`"Tamer@1234`"}" -UseBasicParsing
$docToken = ($docLogin.Content | ConvertFrom-Json).data.accessToken

# Test 1: Forgot password (returns 200 even for non-existent)
Step 1 "Forgot password (should always 200)"
$forgot = Invoke-WebRequest -Uri "$base/auth/forgot-password" -Method POST -ContentType "application/json" `
    -Body "{`"email`":`"dr.tamer.$unique@example.com`"}" -UseBasicParsing
Write-Host ("  Status: {0}" -f $forgot.StatusCode)
Write-Host ("  Body: {0}" -f $forgot.Content.Substring(0, [Math]::Min(150, $forgot.Content.Length)))

# Test 2: Forgot password for unknown email (still 200)
Step 2 "Forgot password unknown email (should still 200)"
$forgot2 = Invoke-WebRequest -Uri "$base/auth/forgot-password" -Method POST -ContentType "application/json" `
    -Body '{"email":"doesnotexist@example.com"}' -UseBasicParsing
Write-Host ("  Status: {0}" -f $forgot2.StatusCode)

# Test 3: Time off
Step 3 "Doctor adds time off (tomorrow 10:00-12:00)"
$tomorrow = (Get-Date).AddDays(1).Date
$startOff = $tomorrow.AddHours(10).ToString('yyyy-MM-ddTHH:mm:ss')
$endOff = $tomorrow.AddHours(12).ToString('yyyy-MM-ddTHH:mm:ss')
$timeOffJson = @{
    startAt = "$startOff"
    endAt = "$endOff"
    reason = "Personal leave"
    isFullDay = $false
} | ConvertTo-Json -Compress
$to = Invoke-WebRequest -Uri "$base/doctors/$($doc.id)/time-off" -Method POST -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $docToken" } -Body $timeOffJson -UseBasicParsing
Write-Host ("  Status: {0}, msg: {1}" -f $to.StatusCode, ($to.Content | ConvertFrom-Json).message)

# Verify slots tomorrow now reflect the time-off
Step 4 "Available slots after time-off"
$tomStr = $tomorrow.ToString('yyyy-MM-dd')
$slots = Invoke-WebRequest -Uri "$base/doctors/$($doc.id)/available-slots?date=$tomStr" -UseBasicParsing
$slotsArr = $slots.Content | ConvertFrom-Json
Write-Host ("  Total: {0}, Available: {1}" -f $slotsArr.Count, ($slotsArr | Where-Object isAvailable).Count)

# Test 5: Reports - Dashboard
Step 5 "Dashboard report (admin)"
$dash = Invoke-WebRequest -Uri "$base/reports/dashboard" -Headers @{ Authorization = "Bearer $adminToken" } -UseBasicParsing
$dashData = $dash.Content | ConvertFrom-Json
Write-Host ("  TotalPatients: {0}, TotalDoctors: {1}, TotalClinics: {2}, TotalAppointments: {3}" -f `
    $dashData.totalPatients, $dashData.totalDoctors, $dashData.totalClinics, $dashData.totalAppointments)
Write-Host ("  AppointmentsToday: {0}, ThisWeek: {1}, ThisMonth: {2}" -f `
    $dashData.appointmentsToday, $dashData.appointmentsThisWeek, $dashData.appointmentsThisMonth)
Write-Host ("  Revenue this month: {0}" -f $dashData.estimatedRevenueThisMonth)
Write-Host ("  Statuses: {0}" -f (($dashData.appointmentsByStatus | ForEach-Object { "$($_.status)=$($_.count)" }) -join ", "))

# Test 6: Reports - Top doctors
Step 6 "Top doctors report"
$top = Invoke-WebRequest -Uri "$base/reports/top-doctors?count=5" -Headers @{ Authorization = "Bearer $adminToken" } -UseBasicParsing
$topData = $top.Content | ConvertFrom-Json
Write-Host ("  Top doctor count: {0}" -f $topData.Count)
$topData | Select-Object -First 3 | ForEach-Object {
    Write-Host ("    Dr. {0} ({1}): {2} completed" -f $_.doctorName, $_.specialtyName, $_.completedAppointments)
}

# Test 7: Reports - Monthly revenue
Step 7 "Monthly revenue (last 6 months)"
$rev = Invoke-WebRequest -Uri "$base/reports/revenue/monthly?months=6" -Headers @{ Authorization = "Bearer $adminToken" } -UseBasicParsing
$revData = $rev.Content | ConvertFrom-Json
$revData | ForEach-Object { Write-Host ("    {0}: {1} EGP ({2} appointments)" -f $_.label, $_.revenue, $_.appointmentCount) }

# Test 8: Validation filter (bad request)
Step 8 "Validation filter (invalid email)"
try {
    $badReg = Invoke-WebRequest -Uri "$base/auth/register" -Method POST -ContentType "application/json" `
        -Body '{"email":"not-an-email","password":"x","firstName":"","lastName":""}' -UseBasicParsing
    $badCode = $badReg.StatusCode
    $badBody = $badReg.Content
} catch {
    $resp = $_.Exception.Response
    $badCode = [int]$resp.StatusCode
    $badBody = (New-Object IO.StreamReader($resp.GetResponseStream())).ReadToEnd()
}
Write-Host ("  Status: {0}" -f $badCode)
$badData = $badBody | ConvertFrom-Json
Write-Host ("  Success: {0}, Message: {1}" -f $badData.success, $badData.message)
Write-Host ("  Error count: {0}" -f $badData.errors.Count)

# Test 9: Global exception handler (unknown route)
Step 9 "Global error handler (404 is normal, not a crash)"
try {
    $nf = Invoke-WebRequest -Uri "$base/this-does-not-exist" -UseBasicParsing
    Write-Host ("  Status: {0}" -f $nf.StatusCode)
} catch {
    $resp = $_.Exception.Response
    Write-Host ("  Status: {0}" -f [int]$resp.StatusCode)
}

# Test 10: Rate limiter (try to hammer /auth/login)
Step 10 "Rate limiter on auth (10 rapid attempts - some should be 429)"
$codes = @()
for ($i = 1; $i -le 12; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "$base/auth/login" -Method POST -ContentType "application/json" `
            -Body '{"email":"nobody@example.com","password":"wrong"}' -UseBasicParsing
        $codes += $r.StatusCode
    } catch {
        $resp = $_.Exception.Response
        $codes += [int]$resp.StatusCode
    }
    Start-Sleep -Milliseconds 50
}
Write-Host ("  Status codes from 12 attempts: {0}" -f ($codes -join ", "))

Write-Host ""
Write-Host "=== PHASE 3 SMOKE TEST COMPLETE ===" -ForegroundColor Green