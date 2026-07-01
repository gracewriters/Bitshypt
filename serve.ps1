$root = Get-Location
$prefix = 'http://localhost:8080/'
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try {
    $listener.Start()
    Write-Host "Serving $root at $prefix"
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        Start-Job -ScriptBlock {
            param($ctx, $rt)
            $req = $ctx.Request
            $res = $ctx.Response
            $localPath = $req.Url.LocalPath.TrimStart('/')
            if ([string]::IsNullOrEmpty($localPath)) { $localPath = 'index.html' }
            $filePath = Join-Path $rt $localPath
            if (-not (Test-Path $filePath)) {
                $res.StatusCode = 404
                $buf = [Text.Encoding]::UTF8.GetBytes('404 Not Found')
                $res.ContentLength64 = $buf.Length
                $res.OutputStream.Write($buf,0,$buf.Length)
                $res.OutputStream.Close()
                return
            }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($ext) {
                '.html' { $ct='text/html' }
                '.css'  { $ct='text/css' }
                '.js'   { $ct='application/javascript' }
                '.json' { $ct='application/json' }
                '.png'  { $ct='image/png' }
                '.jpg'  { $ct='image/jpeg' }
                '.jpeg' { $ct='image/jpeg' }
                '.svg'  { $ct='image/svg+xml' }
                '.webp' { $ct='image/webp' }
                '.ico'  { $ct='image/x-icon' }
                '.txt'  { $ct='text/plain' }
                default { $ct='application/octet-stream' }
            }
            $res.ContentType = $ct
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes,0,$bytes.Length)
            $res.OutputStream.Close()
        } -ArgumentList ($context, $root) | Out-Null
    }
} catch {
    Write-Host "Server stopped: $_"
} finally {
    if ($listener -and $listener.IsListening) { $listener.Stop() }
}
