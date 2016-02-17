FROM continuumio/anaconda3
# apt-get installs
RUN apt-get update && apt-get install -y \
  build-essential \
  python3-dev \
  musescore \
  git \
  emacs \
  curl \
# conda installs
  && conda install \
  jupyter \
  numpy \
  matplotlib \
  scipy \
# pip install
  && pip install \
  music21


# Add Tini. Tini operates as a process subreaper for jupyter. This prevents
# kernel crashes.
ENV TINI_VERSION v0.6.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /usr/bin/tini
RUN chmod +x /usr/bin/tini
ENTRYPOINT ["/usr/bin/tini", "--"]

# For some terrible reason, xvfb is required to use mscore from
# the command line in Linux. command line docs are here:
# https://musescore.org/en/developers-handbook/command-line-options
# Example:
#
# xvfb-run mscore test/Chant.xml -o test/Great.png

RUN apt-get install -y xvfb

EXPOSE 8888
# CMD /bin/bash
CMD ["jupyter", "notebook", "--port=8888", "--no-browser", "--ip=0.0.0.0"]

# I start my container with:
# docker run -P -ti -v ~/docker/conda/test/:/test/ charlesholbrow/scorcery:0.0.4 bash