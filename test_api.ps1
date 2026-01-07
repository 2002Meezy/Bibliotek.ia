$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    model = "qwen/qwen3-vl-4b"
    messages = @(
        @{
            role = "user"
            content = "Hello, are you working?"
        }
    )
    temperature = 0.7
    stream = $false
} | ConvertTo-Json -Depth 5

Write-Host "Sending Request to LM Studio..."
Write-Host $body

try {
    $response = Invoke-RestMethod -Uri "http://localhost:1234/v1/chat/completions" -Method Post -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "Success!"
    Write-Host ($response | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "Error:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Server Response:"
        Write-Host $reader.ReadToEnd()
    }
}
