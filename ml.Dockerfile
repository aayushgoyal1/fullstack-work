FROM tensorflow/tensorflow:latest-gpu-py3
ENTRYPOINT [ "/bin/bash", "-c" ]

WORKDIR /uploads

RUN apt-get update && apt-get install -y build-essential cmake curl libsm6 libxext6 libglib2.0-0 libxrender-dev libcublas-dev cuda-cublas-dev-10-0 cuda-cusolver-dev-10-0 cuda-curand-dev-10-0
RUN curl https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh > ~/miniconda.sh
RUN bash ~/miniconda.sh -b -p /miniconda

ADD ML_library/environment.yml /tmp/environment.yml
RUN /miniconda/bin/conda env create -f /tmp/environment.yml
ENV PATH /miniconda/envs/ML_Library/bin:/miniconda/bin:$PATH

ADD ML_library /code

COPY config.json /

CMD [ "source activate ML_Library && exec python /code/runML.py" ]
