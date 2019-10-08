# import the necessary packages
from keras.utils import np_utils
from ..preprocessing import AspectAwarePreprocessor
import numpy as np
import h5py
import cv2

class DatasetGenerator:
    def __init__(self, imgs, batchSize, preprocessors=None,
        aug=None, classes=4):
        # store the batch size, preprocessors, and data augmentor,
        # whether or not the labels should be binarized, along with
        # the total number of classes
        self.batchSize = batchSize
        self.preprocessors = preprocessors
        self.aug = aug

        # open the HDF5 database for reading and determine the total
        # number of entries in the database
        self.db = imgs
        self.numImages = len(imgs)

    def read_imgs(self, imgs):
        aap = AspectAwarePreprocessor(256, 256)
        arr = []
        for img in imgs:
          try:
            im = cv2.imread(img)
            im = aap.preprocess(im)
            
          except Exception as expt:
            print("Unable to load Image: {} \n{}".format(img, expt))
            continue
          arr.append(im)
        return arr

    def generator(self, passes=np.inf):
        # initialize the epoch count
        epochs = 0

        # keep looping infinitely -- the model will stop once we have
        # reach the desired number of epochs
        while epochs < passes:
            # loop over the HDF5 dataset
            for i in np.arange(0, self.numImages, self.batchSize):
                # extract the images and labels from the HDF dataset

                images = self.db[i: i + self.batchSize]
                imgPaths = images
                images = self.read_imgs(images)
                #labels = self.db["labels"][i: i + self.batchSize]


                # check to see if our preprocessors are not None
                if self.preprocessors is not None:
                    # initialize the list of processed images
                    procImages = []

                    # loop over the images
                    for image in images:
                        # loop over the preprocessors and apply each
                        # to the image
                        for p in self.preprocessors:
                            image = p.preprocess(image)

                        # update the list of processed images
                        procImages.append(image)

                    # update the images array to be the processed
                    # images
                    images = np.array(procImages)

                # if the data augmenator exists, apply it
                if self.aug is not None:
                    (images, labels) = next(self.aug.flow(images,
                        labels, batch_size=self.batchSize))

                # yield a tuple of images and labels
                yield (images, imgPaths)

            # increment the total number of epochs
            epochs += 1

    def close(self):
        # close the database
        self.db.close()
