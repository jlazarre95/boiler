@echo off

docker stop boiler & docker rm boiler & docker build -f docker/%1.Dockerfile -t boiler . && docker run --name boiler boiler