FROM node:8
RUN mkdir /usr/local/src/boiler
COPY . /usr/local/src/boiler
WORKDIR /usr/local/src/boiler
RUN bin/install
CMD boiler path