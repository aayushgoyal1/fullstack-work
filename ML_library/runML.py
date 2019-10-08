import websocketserver
import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from bson.objectid import ObjectId
from configure import config
import glob
from config import affectnet_config as MLconfig
from pyimagesearch.io import DatasetGenerator
from pyimagesearch.preprocessing import AspectAwarePreprocessor, ImageToArrayPreprocessor, SimplePreprocessor, MeanPreprocessor, CropPreprocessor
import json
import cv2
import imutils
import dlib
import numpy as np
import pandas as pd
from tqdm import tqdm
import queue
import threading
from pymongo import MongoClient
import tensorflow as tf
gpu_options = tf.GPUOptions(allow_growth=True)
sess = tf.Session(config=tf.ConfigProto(gpu_options=gpu_options))
from keras import backend as K
import tensorflow as tf
tf_config = tf.ConfigProto()
tf_config.gpu_options.allow_growth=True
session = tf.Session(config=tf_config)
K.set_session(session)
from keras.models import load_model

# import the files that we are creating threads with
import watcher
import predictor
import preprocess

# This will be the file that is called by docker
if __name__ == '__main__':
    # q1 is a list of frames that needs to be processed
    # after a frame is processed, it will be placed into q2 where it waits to get its value predicted
    q1 = queue.Queue()
    q2 = queue.Queue()

    # Connect to MongoDB on localhost by default (but allow overrides via env vars)
    mongo_client = MongoClient(os.getenv('MONGODB_HOST', 'localhost'))
    db = mongo_client[config['mongo']['dbName']]

    # The current model we're using
    # if changing model, add the new feature names to config.json
    # and update featureID to reflect using that list of feature names
    MODEL_PATH = "../continue.model"
    model = load_model(MLconfig.MODEL_PATH)
    graph = tf.get_default_graph()

    # depending on which model to use, feature names may be different
    # see config.json to include feature names and feature ID to use
    featureID = config["featureID"]

    # create 3 threads, 2 threads for preprocessing frames (preprocessing takes the longest time)
    # 1 thread for predicting frames that are preprocessed
    # note that watcher itself is a thread, so no need to make a thread for it
    p2 = threading.Thread(name='preprocess_2', target=preprocess.preprocess, args=(q1, q2))
    p3 = threading.Thread(name='preprocess_3', target=preprocess.preprocess, args=(q1, q2))
    i = threading.Thread(name='predictor', target=predictor.predictor, args=(q1, q2, graph, model, featureID, config["processing"]["frames"]["fps"]))
    s = threading.Thread(name='server', target=websocketserver.start_server)

    watcher.start_watcher(q1, q2)
    p2.start()
    p3.start()
    i.start()
    s.start()
