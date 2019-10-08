import math,cv2 #Need to add cv2 dependency
from configure import config
"""
ExtractFrames - Takes two arguments and returns extracted images in a list. 
videoPath - File path of the videos.
videoId - The id or name of the video.
"""
def ExtractFrames(imagePath,videoId):
   

    imagePath = imagePath + '/' + videoId
    vid = cv2.VideoCapture(imagePath) #Get video
    videoHeight = vid.get(4)
    videoWidth = vid.get(3)
    videoFps =  vid.get(5)
    totalVideoFrames = vid.get(7)

    fps = config['processing']['frames']['fps'] 
    width =  config['processing']['frames']['width']
    height = math.trunc((width*( videoHeight/ videoWidth)/2))*2
    ext = '.' + config['processing']['frames']['frameExtension']
    frame = 0
   
    frameInc = (videoFps/fps)/totalVideoFrames #Stores a percentage to determine next frame capture 
    nextFrame = frame * totalVideoFrames #Get actual frame using the percentage
    buffer= [] 

    while frame <= 1:
        vid.set(1,nextFrame)    
        ret,image = vid.read()
        image = cv2.resize(image,(width,height))#Resize image based on the config file
        buffer.append(cv2.imencode(ext, image))#Store images
        frame+=frameInc
        nextFrame = frame * totalVideoFrames 
    return buffer
