#!/usr/bin/env sh

until $(curl --output /dev/null --silent --head --fail http://localhost:8080/health); do
    printf 'waiting for node up\n'
    sleep 5
done

printf 'node is up\n'
node dist/index.js mock $1