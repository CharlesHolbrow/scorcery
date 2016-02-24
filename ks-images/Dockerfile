FROM node:argon

# apt-get installs
# 
# For some terrible reason, xvfb is required to use mscore from
# the command line in Linux. Command line docs are here:
# https://musescore.org/en/developers-handbook/command-line-options
# Example:
#
# xvfb-run mscore test/Chant.xml -o test/Great.png
RUN apt-get update && apt-get install -y \
  xvfb \
  musescore \
  emacs \
  curl 

COPY ./application /application
WORKDIR /application
RUN npm install
EXPOSE 8080
