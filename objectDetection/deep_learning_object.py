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

# define arguments when running file
ap = argparse.ArgumentParser()
ap.add_argument("-i", "--image", required=True, help="path to image file")
ap.add_argument("-p", "--prototxt", required=True, help="path to Caffe 'deploy' prototxt file")
ap.add_argument("-m", "--model", required=True, help="path to pretrained Caffe model")
ap.add_argument("-c", "--confidence", type=float, default = 0.2, help="minimum probability to filter weak detections")
args = vars(ap.parse_args())

# define classification labels that MobileNet SSD was trained on
CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat", "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
           "dog", "horse", "motorbike", "person", "pottedplant", "sheep", "sofa", "train", "tvmonitor"]
COLORS = np.random.uniform(0, 255, size=(len(CLASSES), 3))

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
    for i in np.arange(0, detections.shape[2]):
        # extract the confidence (i.e., probability) associated with prediction
        confidence = detections[0, 0, i, 2]

        # filter out weak detections by ensuring the `confidence` greater than the minimum confidence
        if confidence > args["confidence"]:
            # extract the index of the class label from the then compute the (x, y)-coordinates of the bounding box the object
            idx = int(detections[0, 0, i, 1])
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            (startX, startY, endX, endY) = box.astype("int")
            centroid = ((endX - startX)/2, (endY - startY)/2)

            # display the prediction
            label = "{}: {:.2f}%".format(CLASSES[idx], confidence * 100)
            cv2.rectangle(image, (startX, startY), (endX, endY), COLORS[idx], 2)
            y = startY - 15 if startY - 15 > 15 else startY + 15
            cv2.putText(image, label, (startX, y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, COLORS[idx], 2)
        
        
    cv2.imshow("frame", image)
    key = cv2.waitKey(1) & 0xFF
    if key == ord("q"):
        break
    
cv2.destroyAllWindows()
stream.stop()