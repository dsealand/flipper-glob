# Daniel Sealand
# 6 October 2019
# image classification using MobileNet architecture and Single Shot Detector framework
# tutorial from https://www.pyimagesearch.com/2017/09/11/object-detection-with-deep-learning-and-opencv/
import numpy as np
import argparse
import cv2

# define arguments when running file
ap = argparse.ArgumentParser()
ap.add_argument("-i", "--image", required=TRUE, help="path to image file")
ap.add_argument("-p", "--prototxt", required=TRUE, help="path to Caffe 'deploy' prototxt file")
ap.add_argument("-m", "--model", required=TRUE, help="path to pretrained Caffe model")
ap.add_argument("-c", "--conficence", type=float, default = 0.2, help="minimum probability to filter weak detections")
args = vars(ap.parse_args())

# define classification labels that MobileNet SSD was trained on
CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat", "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
           "dog", "horse", "motorbike", "person", "pottedplant", "sheep", "sofa", "train", "tvmonitor"]
COLORS = np.random.uniform(0, 255, size=(len(CLASSES), 3))

# load model from files
print("loading model")
net = cv2.dnn.readNetFromCaffe(args["prototxt"], args["model"])

# load image from file and prepare blob
image = cv2.imread(args["image"])
(h, w) = image.shape[:2]
blob = cv2.dnn.blobFromImage(cv2.resize(image, (300, 300)), 0.007843, (300, 300), 127.5)

# pass blob through neural net and get classifications/predictions
print("detecting objects")
net.setInput(blob)
detections = net.forward()