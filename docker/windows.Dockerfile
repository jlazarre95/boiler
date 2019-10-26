FROM mcr.microsoft.com/windows/servercore:ltsc2019
RUN md C:\Boiler
COPY . C:\\Boiler
WORKDIR C:\\Boiler
RUN bin\install.cmd
CMD boiler path