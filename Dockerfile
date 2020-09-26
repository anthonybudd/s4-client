FROM node:13

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y tor torsocks ntpdate

COPY . /app
WORKDIR /app

RUN npm install

ADD ./torrc /etc/tor/torrc

COPY ./boot /var/boot

ENTRYPOINT ["/bin/sh", "--", "/var/boot"]
