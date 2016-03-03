FROM ubuntu:14.04

# software-properties-common includes add-apt-repository
RUN apt-get update && apt-get install -y \
  software-properties-common \
  build-essential \
  xvfb \
  python \
  curl

# install node 5.x
RUN curl -sL https://deb.nodesource.com/setup_5.x | bash && \
  apt-get install -y nodejs

# musescore
RUN sudo add-apt-repository ppa:mscore-ubuntu/mscore-stable && \
  apt-get update && apt-get install -y musescore

COPY ./application /application
WORKDIR /application

# To make it easier to develop in osx, we move the
# ./node_modules directory too the root level,
# /node_path/node_modules with the --prefix option
# When running the app in a docker container, we look for
# npm modules in /node_modules
RUN npm install ./ --prefix /node_path/
ENV NODE_PATH /node_path/node_modules

EXPOSE 3000
CMD bash
