@echo off
set PROJECT_PATH=%cd%
npm --prefix %~dp0/.. run --silent start -- %*