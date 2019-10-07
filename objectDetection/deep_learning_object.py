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

