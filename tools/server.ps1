param(
    [int]$Port = 8080,
    [string]$Root = "$PSScriptRoot\.."
)

$resolvedRoot = (Resolve-Path $Root).Path
Write-Output "SAMGEC local server running at: http://localhost:$Port/"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")

try {
    $listener.Start()
} catch {
    Write-Error "Failed to start listener on port $Port : $_"
    exit 1
}

$mimeTypes = @{
    ".html"   = "text/html; charset=utf-8"
    ".htm"    = "text/html; charset=utf-8"
    ".css"    = "text/css; charset=utf-8"
    ".js"     = "application/javascript; charset=utf-8"
    ".json"   = "application/json; charset=utf-8"
    ".png"    = "image/png"
    ".jpg"    = "image/jpeg"
    ".jpeg"   = "image/jpeg"
    ".webp"   = "image/webp"
    ".gif"    = "image/gif"
    ".svg"    = "image/svg+xml"
    ".ico"    = "image/x-icon"
    ".mp4"    = "video/mp4"
    ".webm"   = "video/webm"
    ".woff"   = "font/woff"
    ".woff2"  = "font/woff2"
    ".ttf"    = "font/ttf"
    ".xml"    = "application/xml; charset=utf-8"
    ".txt"    = "text/plain; charset=utf-8"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath)
        if ($rawUrl -eq "/" -or $rawUrl -eq "") {
            $relPath = "index.html"
        } else {
            $relPath = $rawUrl.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
        }

        $fullPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($resolvedRoot, $relPath))

        if (-not $fullPath.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
            $response.StatusCode = 403
            $bytes = [System.Text.Encoding]::UTF8.GetBytes("403 Forbidden")
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.Close()
            continue
        }

        if ([System.IO.Directory]::Exists($fullPath)) {
            $candidateIndex = [System.IO.Path]::Combine($fullPath, "index.html")
            if ([System.IO.File]::Exists($candidateIndex)) {
                $fullPath = $candidateIndex
            }
        } elseif (-not [System.IO.File]::Exists($fullPath)) {
            if ([System.IO.File]::Exists("$fullPath.html")) {
                $fullPath = "$fullPath.html"
            }
        }

        if ([System.IO.File]::Exists($fullPath)) {
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.ContentType = $mime
            $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.StatusCode = 200

            try {
                $fileStream = [System.IO.File]::OpenRead($fullPath)
                $response.ContentLength64 = $fileStream.Length
                $fileStream.CopyTo($response.OutputStream)
                $fileStream.Close()
            } catch {
                # Client connection closed
            }
        } else {
            $response.StatusCode = 404
            $notFoundFile = [System.IO.Path]::Combine($resolvedRoot, "404.html")
            if ([System.IO.File]::Exists($notFoundFile)) {
                $response.ContentType = "text/html; charset=utf-8"
                $bytes = [System.IO.File]::ReadAllBytes($notFoundFile)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        }

        $response.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
