from PIL import Image
import json
import numpy as np
import matplotlib.pyplot as plt
from pprint import pprint

# Load and resize the image
image_path = 'test_images.jpg'
resized_image_path = 'resized_image.jpg'
desired_size = (192, 192)

image = Image.open(image_path)
resized_image = image.resize(desired_size)
# resized_image.save(resized_image_path)

# Load the JSON file
json_path = 'test.json'

keypoints = [
    {
      "name": 'nose',
      "value": 0,
    },
    {
      "name": 'left eye',
      "value": 1,
    },
    {
      "name": 'right eye',
      "value": 2,
    },
    {
      "name": 'left ear',
      "value": 3,
    },
    {
      "name": 'right ear',
      "value": 4,
    },
    {
      "name": 'left shoulder',
      "value": 5,
    },
    {
      "name": 'right shoulder',
      "value": 6,
    },
    {
      "name": 'left elbow',
      "value": 7,
    },

    {
      "name": 'right elbow',
      "value": 8,
    },
    {
      "name": 'left wrist',
      "value": 9,
    },
    {
      "name": 'right wrist',
      "value": 10,
    },
    {
      "name": 'left hip',
      "value": 11,
    },
    {
      "name": 'right hip',
      "value": 12,
    },
    {
      "name": 'left knee',
      "value": 13,
    },
    {
      "name": 'right knee',
      "value": 14,
    },
    {
      "name": 'left ankle',
      "value": 15,
    },
    {
      "name": 'right ankle',
      "value": 16,
    },
  ]

mapping = {}
for i in keypoints:
    mapping[i['value']+1] = i['name']

with open(json_path, 'r') as json_file:
    data = json.load(json_file)

# # Use the loaded image and JSON data as needed
# # ...
# print(data)

# print(mapping)

# Convert the resized image to a numpy array
resized_image_array = np.array(resized_image)

# print(resized_image_array.shape)

lst_keypoints_dct = {}
for i in data:
    lst_keypoints_dct[mapping[int(i)]] = [data[i]['x'], data[i]['y'], data[i]['score']]

pprint(lst_keypoints_dct)
    


def make_pred(img, keypoints_dict, label):
    plt.figure(figsize=(15, 5))
    plt.subplot(1, 3, 1)
    plt.title('Original Image')
    plt.imshow(img[0])
    plt.subplot(1, 3, 2)
    plt.imshow(img[0])
    plt.title('Pose')
    plt.axis('off')
    for i in range(13):
        plt.scatter(keypoints_dict[label[i]][1],keypoints_dict[label[i]][0],color='green')

    connections = [
        ('nose', 'left eye'), ('left eye', 'left ear'), ('nose', 'right eye'), ('right eye', 'right ear'),
        ('nose', 'left shoulder'), ('left shoulder', 'left elbow'), ('left elbow', 'left wrist'),
        ('nose', 'right shoulder'), ('right shoulder', 'right elbow'), ('right elbow', 'right wrist'),
        ('left shoulder', 'left hip'), ('right shoulder', 'right hip'), ('left hip', 'right hip'),
        ('left hip', 'left knee'), ('right hip', 'right knee')
    ]

    for start_key, end_key in connections:
        if start_key in keypoints_dict and end_key in keypoints_dict:
            start_point = keypoints_dict[start_key][:2]  # Take first two values
            end_point = keypoints_dict[end_key][:2]      # Take first two values
            plt.plot([start_point[1], end_point[1]], [start_point[0], end_point[0]], linewidth=2)
    
    plt.subplot(1, 3, 3)
    plt.imshow((img[0]/255)/255)
    plt.title('Only Pose Image')
    for start_key, end_key in connections:
        if start_key in keypoints_dict and end_key in keypoints_dict:
            start_point = keypoints_dict[start_key][:2]  # Take first two values
            end_point = keypoints_dict[end_key][:2]      # Take first two values
            plt.plot([start_point[1], end_point[1]], [start_point[0], end_point[0]], linewidth=2)


label = ["nose", "left eye", "right eye", "left ear", "right ear", "left shoulder", "right shoulder", "left elbow", "right elbow", "left wrist", "right wrist", "left hip", "right hip", "left knee", "right knee", "left ankle", "right ankle"]

make_pred(resized_image_array, lst_keypoints_dct, label)