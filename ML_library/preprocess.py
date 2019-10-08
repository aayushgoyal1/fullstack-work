import dlib
import json
from pyimagesearch.preprocessing import AspectAwarePreprocessor, ImageToArrayPreprocessor, SimplePreprocessor, MeanPreprocessor, CropPreprocessor
from PIL import Image
from config import affectnet_config as MLconfig
import numpy as np
import math

detector = dlib.get_frontal_face_detector()
means = json.loads(open(MLconfig.DATASET_MEAN).read())
sp = SimplePreprocessor(227, 227)
mp = MeanPreprocessor(means['R'], means['G'], means['B'])
cp = CropPreprocessor(227, 227)
iap = ImageToArrayPreprocessor()
aap = AspectAwarePreprocessor(227, 227)

def outOfBounds(image, d):
    hr, wr = image.shape[:2]
    top,bot,left,right = int(d.top()), int(d.bottom()), int(d.left()), int(d.right())
    if top < 0 or bot < 0 or left < 0 or right < 0:
        return True
    elif top > hr or bot > hr:
        return True
    elif left > wr or right > wr:
        return True
    return False

def resize_width(img, size, resample=Image.LANCZOS):
    try:
        width = size[0]
    except:
        width = size
    img_size = img.size
    if img_size[0] == width:
        return img
    new_height = int(math.ceil((width / img_size[0]) * img_size[1]))
    img.thumbnail((width, new_height), resample)
    return img

CROP_SIZE = 350
# process frame received from q1 to produce image(s) of a face
# if no face is found, then face_num will be -1
def preprocess(q1, q2):
    while True:
        # obtain frame information from q1 and store them in variables
        try:
            frame_info = q1.get(timeout=1)
        except:
            continue
        if frame_info is None:
            continue
        videoID = frame_info['videoID']
        frame_num = frame_info['frame_num']
        frame = frame_info['frame']
        path = frame_info['path']
        npframe = np.asarray(frame)[:, :, [2, 1, 0]]
        oheight, owidth = npframe.shape[:2]

        # resize the frame to specified CROP_SIZE
        img = resize_width(frame.copy(), CROP_SIZE, resample=Image.BILINEAR)
        # we ain't need color in our lives, convert frame to gray
        gray_img = img.convert('L')

        # Image as a numpy array (same format as OpenCV)
        npimg = np.asarray(gray_img)
        height, width = npimg.shape[:2]
        hr, wr = (oheight/height), (owidth/width)

        # detect to see if there is a face
        # nothing to process if there are no faces, face_num will be set to -1
        faces = detector(npimg, 1)
        if len(faces) == 0:
            q2.put({
                "videoID": videoID,
                "frame_num": frame_num,
                "face_num": -1,
                "face": -1,
                "path": path
            })
            continue
        for face_num, d in enumerate(faces):
            if outOfBounds(npimg, d):
                q2.put({
                    "videoID":videoID,
                    "frame_num": frame_num,
                    "face_num": -1,
                    "face":-1,
                    "path":path
                })
                continue
            buf = npframe[int(d.top()*hr):int(hr*d.bottom()),int(d.left()*wr):int(wr*d.right())]
            tmp = aap.preprocess(buf)
            tmp = sp.preprocess(tmp)
            tmp = mp.preprocess(tmp)
            tmp = iap.preprocess(tmp)

            # put the processed img into q2
            q2.put({
                "videoID": videoID,
                "frame_num": frame_num,
                "face_num": face_num,
                "face": tmp,
                "path": path
            })
