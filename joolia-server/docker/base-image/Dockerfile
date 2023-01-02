FROM node:12.18.0-stretch

COPY ./5072E1F5_rsa.pub /root

RUN apt-get -y update && \
    apt-key add /root/5072E1F5_rsa.pub && \
    echo 'deb http://repo.mysql.com/apt/debian stretch mysql-5.7' > /etc/apt/sources.list.d/mysql.list && \
    apt-get -y update && \
    apt-get -y install mysql-client --allow-unauthenticated
