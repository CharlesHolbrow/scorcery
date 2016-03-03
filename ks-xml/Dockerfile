# This image contains a development environment for working with
# Python 3, Anaconda, Jupyter Notebooks, and music21
#
# The default command runs a Jupyter notebook server by default.
#
# $ docker run -P -ti -v ~/docker/conda/test/:/test/ charlesholbrow/kinetic-scores
FROM continuumio/anaconda3


# conda installs
RUN conda install \
  jupyter \
  numpy \
  matplotlib \
  pip \
  scipy

# pip install
RUN pip install \
  music21


# Add Tini. Tini operates as a process subreaper for jupyter. This prevents
# kernel crashes.
ENV TINI_VERSION v0.6.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /usr/bin/tini
RUN chmod +x /usr/bin/tini
ENTRYPOINT ["/usr/bin/tini", "--"]

COPY ./application /application
WORKDIR /application

EXPOSE 8888 5000
# CMD /bin/bash
CMD ["jupyter", "notebook", "--port=8888", "--no-browser", "--ip=0.0.0.0"]
