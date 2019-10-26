@echo off

bin\install-nodejs.cmd ^
    && bin\refreshenv.cmd ^
    && md C:\Program Files\Boiler ^
    && xcopy /s . "C:\Program Files\Boiler\" ^
    && cd C:\Program Files\Boiler ^
    && npm install ^
    && npm run build ^
    && md %USERPROFILE%\Boiler ^
    && setx PATH "%PATH%;C:\Program Files\Boiler\bin" ^
    && IF "%BOILER_PATH%" == "" setx BOILER_PATH %USERPROFILE%\Boiler