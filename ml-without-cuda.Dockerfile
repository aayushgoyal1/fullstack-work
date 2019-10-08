FROM tensorflow/tensorflow:latest-py3
ENTRYPOINT [ "/bin/bash", "-c" ]

WORKDIR /uploads

RUN apt-get update && apt-get install -y build-essential cmake curl libsm6 libxext6 libglib2.0-0 libxrender-dev
RUN curl https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh > ~/miniconda.sh
RUN bash ~/miniconda.sh -b -p /miniconda

ADD ML_library/environment.yml /tmp/environment.yml
RUN sed -i 's/tensorflow-gpu/tensorflow/' /tmp/environment.yml
RUN /miniconda/bin/conda env create -f /tmp/environment.yml
ENV PATH /miniconda/envs/ML_Library/bin:/miniconda/bin:$PATH

RUN bash -c "source activate ML_Library && conda uninstall tensorflow mkl intel-openmp"
RUN bash -c "source activate ML_Library && pip install -U pip setuptools numpy mkl"
RUN bash -c "source activate ML_Library && pip install pandas tensorflow scipy"

ADD ML_library /code

COPY config.json /

CMD [ "source activate ML_Library && exec python /code/runML.py" ]
