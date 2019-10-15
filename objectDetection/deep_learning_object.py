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
from imutils.video import FPS
from multiprocessing import Process
from multiprocessing import Queue

# define arguments when running file
ap = argparse.ArgumentParser()
ap.add_argument("-p", "--prototxt", default="MobileNetSSD_deploy.prototxt.txt", help="path to Caffe 'deploy' prototxt file")
ap.add_argument("-m", "--model", default="MobileNetSSD_deploy.caffemodel", help="path to pretrained Caffe model")
ap.add_argument("-c", "--confidence", type=float, default = 0.2, help="minimum probability to filter weak detections")
ap.add_argument("-d", "--detector", required=True, help="choose caffe model or protobuf model")
ap.add_argument("-t", "--tensorflow", default="frozen_inference_graph.pb", help="path to protobuf file")
ap.add_argument("-x", "--pbtxt", default="ssd_mobilenet_v2_coco_2018_03_29.pbtxt", help="path to pbtxt file")
args = vars(ap.parse_args())

# define classification labels that MobileNet SSD was trained on
CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat", "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
           "dog", "horse", "motorbike", "person", "pottedplant", "sheep", "sofa", "train", "tvmonitor"]

# load model from files
print("loading model")
if args["detector"] == "caffe":
    net = cv2.dnn.readNetFromCaffe(args["prototxt"], args["model"])
if args["detector"] == "protobuf":
    net = cv2.dnn.readNetFromTensorflow(args["tensorflow"], args["pbtxt"])

# add threading to object classification
# inputQueue is queue of input frames to be classified
# outputQueue is queue of detections from frames
def classify_frame(net, inputQueue, outputQueue):
    while True:
        if not inputQueue.empty():
            # get detections from frame from inputQueue
            frame = inputQueue.get()
            frame = cv2.resize(frame, (300,300))
            blob = cv2.dnn.blobFromImage(cv2.resize(frame, (300, 300)), 0.007843, (300, 300), 127.5)
            net.setInput(blob)
            detections = net.forward()
            outputQueue.put(detections)

# create thread for detections
inputQueue = Queue(maxsize=1)
outputQueue = Queue(maxsize=1)
detections = None
p = Process(target=classify_frame, args=(net, inputQueue, outputQueue,))
p.daemon = True
p.start()

# create video stream from camera
stream = VideoStream(src=0).start()
time.sleep(2.0)
fps = FPS().start()

while True:
    startTime = time.time()
    frame = stream.read()
    frame = imutils.resize(frame, width=300)
    getStreamTime = time.time()
    
    #image = cv2.imread(args["image"])
    (h, w) = frame.shape[:2]
    
    # put frame in inputQueue if the queue is empty
    if inputQueue.empty():
        inputQueue.put(frame)
        
    # get detections from outputQueue if it is not empty
    if not outputQueue.empty():
        detections = outputQueue.get()
        
    detectionsTime = time.time()
    
    if detections is not None:
        # loop over the detections
        for detection in detections[0,0,:,:]:
            # extract the confidence (i.e., probability) associated with prediction
            confidence = detection[2]
            label = detection[1]

            # filter out weak detections by ensuring the `confidence` greater than the minimum confidence
            if confidence > args["confidence"]:
                # compute the (x, y)-coordinates of the bounding box the object
                startX = detection[3] * w
                startY = detection[4] * h
                endX = detection[5] * w
                endY = detection[6] * h
                centroid = ((endX - startX)/2, (endY - startY)/2)

                # display the prediction
                cv2.rectangle(frame, (int(startX), int(startY)), (int(endX), int(endY)), (23,230,210), 2)
    
    processTime = time.time()
    
    cv2.imshow("frame", frame)
    printTime = time.time()
    
    #print("stream time: ", getStreamTime - startTime)
    #print("detection time: ", detectionsTime - getStreamTime)
    #print("process time: ", processTime - detectionsTime)
    #print("print time: ", printTime - processTime)
    
    # halt if 'q' key is pressed
    key = cv2.waitKey(1) & 0xFF
    if key == ord("q"):
        break
    
    fps.update()

# print FPS results
fps.stop()
print("elapsed time: ", fps.elapsed())
print("avg. FPS: ", fps.fps())

cv2.destroyAllWindows()
stream.stop()  