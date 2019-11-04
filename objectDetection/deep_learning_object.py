# Daniel Sealand
# 6 October 2019
# image classification using MobileNet architecture and Single Shot Detector framework
# tutorial from https://www.pyimagesearch.com/2017/09/11/object-detection-with-deep-learning-and-opencv/
import numpy as np
import argparse
import cv2
from imutils.video import VideoStream
import imutils
import time
from firebase import firebase

# define arguments when running file
ap = argparse.ArgumentParser()
ap.add_argument("-p", "--prototxt", required=True, help="path to Caffe 'deploy' prototxt file")
ap.add_argument("-m", "--model", required=True, help="path to pretrained Caffe model")
ap.add_argument("-c", "--confidence", type=float, default = 0.2, help="minimum probability to filter weak detections")
args = vars(ap.parse_args())
firebase = firebase.FirebaseApplication("https://flipper-glob-webpage.firebaseio.com")

# define classification labels that MobileNet SSD was trained on
CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat", "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
           "dog", "horse", "motorbike", "person", "pottedplant", "sheep", "sofa", "train", "tvmonitor"]

# load model from files
print("loading model")
net = cv2.dnn.readNetFromCaffe(args["prototxt"], args["model"])

# create video stream from camera
stream = VideoStream(src=0).start()
time.sleep(2.0)

# display video stream
while True:
    image = stream.read()
    image = imutils.resize(image, width=300)
    
    #image = cv2.imread(args["image"])
    (h, w) = image.shape[:2]
    blob = cv2.dnn.blobFromImage(cv2.resize(image, (300, 300)), 0.007843, (300, 300), 127.5)
    
    net.setInput(blob)
    detections = net.forward()
    
    # loop over the detections
    for detection in detections[0,0,:,:]:
        # extract the confidence (i.e., probability) associated with prediction
        confidence = detection[2]
        label = detection[1]
        count = 0

        # filter out weak detections by ensuring the `confidence` greater than the minimum confidence
        if confidence > args["confidence"] and label == 15:
            count = count + 1
            # compute the (x, y)-coordinates of the bounding box the object
            startX = detection[3] * w
            startY = detection[4] * h
            endX = detection[5] * w
            endY = detection[6] * h
            centroid = ((endX - startX)/2, (endY - startY)/2)
            firebase.put('/count', "value", count)

            # display the prediction
            cv2.rectangle(image, (int(startX), int(startY)), (int(endX), int(endY)), (23,230,210), 2)
                    
    cv2.imshow("frame", image)
    key = cv2.waitKey(1) & 0xFF
    if key == ord("q"):
        break
    
cv2.destroyAllWindows()
stream.stop()  