FROM mhart/alpine-node:latest

# Move packagejson to container in tmp folder
ADD package.json /tmp/package.json

# Dockerize script to wait postgresql connection is done
RUN apk add --no-cache openssl
ENV DOCKERIZE_VERSION v0.5.0
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

# Installing dependencies
RUN cd /tmp && npm install

# Moving dependencies from tmp folder to project folder
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/


# Setting project folder as workdir
WORKDIR /opt/app

# Adding project files to container project folder
ADD . /opt/app