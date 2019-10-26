REM https://gist.github.com/manuelbieh/4178908

setlocal

set NODEJS_FILENAME=node-v12.12.0-x86.msi
set NODEJS_URL=https://nodejs.org/dist/v12.12.0/%NODEJS_FILENAME%
set NODEJS_DOWNLOAD_LOCATION=C:\

powershell -NoExit -Command "(New-Object Net.WebClient).DownloadFile('%NODEJS_URL%', '%NODEJS_DOWNLOAD_LOCATION%%NODEJS_FILENAME%'); exit;"
msiexec /qn /l* C:\node-log.txt /i %NODEJS_DOWNLOAD_LOCATION%%NODEJS_FILENAME%

endlocal