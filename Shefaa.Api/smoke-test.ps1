#requires -Version 5.1
$ErrorActionPreference = "Stop"
$base = "http://localhost:5026/api"

function Step($n, $msg) {
    Write-Host ""
    Write-Host ("=== {0}. {1} ===" -f $n, $msg) -ForegroundColor Cyan
}

Step 1 "Admin login"
$adminResp = Invoke-WebRequest -Uri "$base/auth/login" -Method POST -ContentType "application/json" `
    -Body '{"email":"admin@shefaa.local","password":"Admin@1234"}' -UseBasicParsing
$admin = $adminResp.Content | ConvertFrom-Json
$adminToken = $admin.data.accessToken
Write-Host ("  Admin: {0} ({1})" -f $admin.data.user.fullName, $admin.data.user.email)

Step 2 "Create clinic"
$clinicJson = @{
    name = "Shefaa Main Clinic"
    nameAr = "Shefaa Main Clinic AR"
    address = "10 Tahrir St, Cairo"
    city = "Cairo"
    governorate = "Cairo"
    phoneNumber = "+201234567890"
    email = "main@shefaa.local"
} | ConvertTo-Json -Compress
$clinicResp = Invoke-WebRequest -Uri "$base/clinics" -Method POST -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $adminToken" } -Body $clinicJson -UseBasicParsing
$clinic = ($clinicResp.Content | ConvertFrom-Json).data
Write-Host ("  Clinic id = {0}, name = {1}" -f $clinic.id, $clinic.name)

Step 3 "Create doctor profile (specialty id = 1)"
$unique = (Get-Date).Ticks.ToString().Substring(10)
$docJson = @{
    email = "dr.hany.$unique@example.com"
    password = "Hany@1234"
    firstName = "Hany"
    lastName = "Salem"
    userType = 2
    gender = 1
    specialtyId = 1
    licenseNumber = "EG-CARDIO-$unique"
    yearsOfExperience = 15
    defaultConsultationFee = 500
    defaultAppointmentDurationMinutes = 30
} | ConvertTo-Json -Compress
$docResp = Invoke-WebRequest -Uri "$base/doctors" -Method POST -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $adminToken" } -Body $docJson -UseBasicParsing
$doc = ($docResp.Content | ConvertFrom-Json).data
Write-Host ("  Doctor id = {0}, name = {1}, specialty = {2}" -f $doc.id, $doc.fullName, $doc.specialtyName)

Step 4 "Add doctor schedule (Mon-Fri 09:00-17:00)"
foreach ($d in 1..5) {
    $schedJson = @{ dayOfWeek = $d; startTime = "09:00"; endTime = "17:00"; slotDurationMinutes = 30; clinicId = $clinic.id } | ConvertTo-Json -Compress
    $r = Invoke-WebRequest -Uri ("$base/doctors/" + $doc.id + "/schedules") -Method POST -ContentType "application/json" `
        -Headers @{ Authorization = "Bearer $adminToken" } -Body $schedJson -UseBasicParsing
    Write-Host ("  Day {0} -> {1}" -f $d, $r.StatusCode)
}

Step 5 "Available slots tomorrow"
$tomorrow = (Get-Date).AddDays(1).Date.ToString('yyyy-MM-dd')
$slotsUrl = "$base/doctors/$($doc.id)/available-slots?date=$tomorrow" + "&clinicId=$($clinic.id)"
$slotsResp = Invoke-WebRequest -Uri $slotsUrl -UseBasicParsing
$slots = $slotsResp.Content | ConvertFrom-Json
Write-Host ("  Total: {0}, Available: {1}" -f $slots.Count, ($slots | Where-Object isAvailable).Count)
$firstSlot = $slots | Where-Object isAvailable | Select-Object -First 1

Step 6 "Register patient"
$patJson = @{
    email = "sara.$unique@example.com"
    password = "Sara@1234"
    firstName = "Sara"
    lastName = "Ali"
    userType = 1
    gender = 2
} | ConvertTo-Json -Compress
$patResp = Invoke-WebRequest -Uri "$base/auth/register" -Method POST -ContentType "application/json" -Body $patJson -UseBasicParsing
$pat = $patResp.Content | ConvertFrom-Json
$patToken = $pat.data.accessToken
Write-Host ("  Patient: {0}" -f $pat.data.user.fullName)

Step 7 "Book appointment at first available slot"
$startDt = [datetime]$firstSlot.start
$startStr = $startDt.ToString('yyyy-MM-ddTHH:mm:ss')
$bookJson = @{
    doctorId = $doc.id
    clinicId = $clinic.id
    scheduledStart = "$startStr"
    reasonForVisit = "Routine checkup"
} | ConvertTo-Json -Compress
$bookResp = Invoke-WebRequest -Uri "$base/appointments" -Method POST -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $patToken" } -Body $bookJson -UseBasicParsing
$appt = ($bookResp.Content | ConvertFrom-Json).data
Write-Host ("  Confirmation: {0}, Status: {1}" -f $appt.confirmationCode, $appt.status)
Write-Host ("  Scheduled: {0} to {1}" -f $appt.scheduledStart, $appt.scheduledEnd)

Step 8 "Patient appointment list"
$listResp = Invoke-WebRequest -Uri "$base/appointments" -Headers @{ Authorization = "Bearer $patToken" } -UseBasicParsing
$list = $listResp.Content | ConvertFrom-Json
Write-Host ("  totalCount = {0}" -f $list.totalCount)

Step 9 "Available slots after booking"
$slotsResp2 = Invoke-WebRequest -Uri $slotsUrl -UseBasicParsing
$slots2 = $slotsResp2.Content | ConvertFrom-Json
Write-Host ("  Available after: {0}" -f ($slots2 | Where-Object isAvailable).Count)

Step 10 "Patient notifications"
$notifResp = Invoke-WebRequest -Uri "$base/notifications" -Headers @{ Authorization = "Bearer $patToken" } -UseBasicParsing
$notifs = $notifResp.Content | ConvertFrom-Json
Write-Host ("  Notifications totalCount = {0}" -f $notifs.totalCount)
foreach ($n in $notifs.items) {
    Write-Host ("    [{0}] {1}: {2}" -f $n.type, $n.title, $n.message)
}

Write-Host ""
Write-Host "=== SMOKE TEST PASSED ===" -ForegroundColor Green