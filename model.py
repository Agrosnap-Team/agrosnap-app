import tensorflow as tf
import os
import numpy as np
from PIL import Image
from remove_redanduncy import get_all_images_from_path

model = tf.keras.models.load_model('models/EfficientNetB2-93%.keras')

class_names = ['bacterial_spot', 'early_blight', 'healthy', 'late_blight', 'leaf_mold', 'mosaic_virus',
               'septoria_leaf_spot', 'target_spot', 'twospotted_spider_mite', 'yellow_leaf_curl_virus']


def predict_external_image(image_path):
    img = Image.open(image_path).convert("RGB").resize((260,260))

    img_array = np.asarray(img)
    img_array = np.expand_dims(img_array, axis=0)
    predictions = model.predict(img_array)
    predicted_idx = np.argmax(predictions)
    confidence = np.max(predictions)
    print(f"the all possible : {predictions}")
    top_3 = np.argsort(predictions[0])[-3:][::-1]
    print("Top 3 likely classes:", top_3)

    return class_names[predicted_idx], confidence


# image_to_test = r"C:\Users\aseel\Downloads\late.webp"
image_to_test= get_all_images_from_path(r"C:\Users\aseel\Downloads\bact")
# image_to_test = list(image_to_test)
image_to_test = {r"C:\Users\aseel\Downloads\OIP (4).webp"}
for image in image_to_test:

    if os.path.exists(image):
        disease, conf = predict_external_image(image)
        print(f"The disease is : {disease}")
        print(f"📊 Confifence : {conf * 100:.2f}%")
    else:
        print("The photo does not exist")




