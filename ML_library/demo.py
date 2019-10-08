class image_analyzer:
    import random
    import json
    import os
    import time

    def __init__(self):
        self.data = {}
        self.emos = ['neutral','happy','sad','surprised','fear','disgust','anger','contempt']

    #takes a path to an image, stores feature vector for that image in self.data
    #sleep_time: the number of seconds to sleep (delay)
    def analyze(self, img_path, sleep_time = 0.0):
        feats = [self.random.random() for x in self.emos]
        #normalize
        feats = [x/sum(feats) for x in feats]
        self.data[img_path] = {x:f for x, f in zip(self.emos, feats)}
        #sleep (delay)
        self.time.sleep(sleep_time)
        #self.os.remove(img_path)
        return


    #takes a list of paths to images, stores feature vector for those images in self.data
    #sleep_time: the number of seconds to sleep (delay)
    def analyze_batch(self, img_paths, sleep_time = 0.0):
        for img_path in img_paths:
            feats = [self.random.random() for x in self.emos]
            #normalize
            feats = [x/sum(feats) for x in feats]
            self.data[img_path] = {x:f for x, f in zip(self.emos, feats)}
            #sleep (delay)
            self.time.sleep(sleep_time)
            #self.os.remove(img_path)
        return

    #returns the JSON object
    def get_features(self):
        return self.data

    #prints the JSON object
    def print_features(self):
        print(self.json.dumps(self.data))
