import numpy as np
import os
from configure import config
from pymongo import MongoClient
from bson.objectid import ObjectId
# Connect to MongoDB on localhost by default (but allow overrides via env vars)
mongo_client = MongoClient(os.getenv('MONGODB_HOST', 'localhost'))
db = mongo_client[config['mongo']['dbName']]

def predictor(q1, q2, graph, model, featureID, fps):
    while True:
        # list to store information
        q2_size = q2.qsize()
        videoIDs = []
        frame_nums = []
        faces = []

        # if there are no faces, there is nothing to predict
        # insert w/e we got previously into mongo
        no_face = True
        for i in range(q2_size):
            img_info = q2.get()
            videoID = img_info['videoID']
            frame_num = img_info['frame_num']
            face_num = img_info['face_num']
            face = img_info['face']

            # Add the fps that this was processed at. But only add once per video
            if int(frame_num) == 1:
                db['videos'].update_one({
                    "_id": ObjectId(videoID)
                }, {
                    "$set": {
                        "fps": fps
                    }
                })

            os.remove(img_info['path'])
            # if no face
            if face_num == -1:
                db['predictions'].insert_one({
                    "videoID": videoID,
                    "frame_num": frame_num,
                    "prediction": None,
                    "featureID": featureID
                })
                continue
            # there is a face, append info into appropriate lists
            no_face = False
            videoIDs.append(videoID)
            frame_nums.append(frame_num)
            faces.append(face)
        # nothing to predict if there are no face
        if no_face:
            continue
        # predict emotion based on the face and insert them into mongo
        else:
            imgs = np.array(faces)
            with graph.as_default():
                pred = model.predict(imgs)
            for videoID, frame_num, prediction in zip(videoIDs, frame_nums, pred):
                put_in_mongo = {
                    "videoID": videoID,
                    "frame_num": frame_num,
                    "prediction": prediction.tolist(),
                    "featureID": featureID
                }
                #print(put_in_mongo, "placed in put_in_mongo")
                db['predictions'].insert_one(put_in_mongo)
