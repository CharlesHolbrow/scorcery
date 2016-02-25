FROM ubuntu:14.04

# software-properties-common includes add-apt-repository
RUN apt-get update && apt-get install -y \
  software-properties-common \
  build-essential \
  xvfb \
  curl

# install node 5.x
RUN curl -sL https://deb.nodesource.com/setup_5.x | bash && \
  apt-get install -y nodejs

# musescore
RUN sudo add-apt-repository ppa:mscore-ubuntu/mscore-stable && \
  apt-get update && apt-get install -y musescore

COPY ./application /application
WORKDIR /application
# RUN npm install

EXPOSE 8080
CMD bash
