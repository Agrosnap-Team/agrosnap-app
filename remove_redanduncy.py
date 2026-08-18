# finction for read the folders and imgs
# then the function will store it in a set and return the set
# the set will pass to the hash method
# the hash method will hash all images and store it in a set
# the set is returned and passed it to compare method
# the compare method will check in a specific method is
import os
from pathlib import Path
import hashlib as hl


def get_all_images_from_path(path):
    all_images = set()
    for image in Path(path).rglob("*"):
        if image.is_file() and image.suffix.lower() in [".jpg", ".jpeg",".png",".webp"]:
            all_images.add(str(image))
    return all_images

def hash_all_images(set_of_images):
    hashed_images = {}

    for single_image in set_of_images:
        hash_algo = hl.md5()
        with open(single_image, "rb") as f:
            while chunk := f.read(8192):
                hash_algo.update(chunk)
            the_hashed_image = hash_algo.hexdigest()
            hashed_images[the_hashed_image] = single_image
    return hashed_images

def filter_dataset(new_dataset,old_dataset):
    the_duplicated_images_in_new_dataset = set()
    the_duplicated_images_in_old_dataset = set()
    for single_image in new_dataset.keys():
        if single_image in old_dataset.keys():
            the_duplicated_images_in_new_dataset.add(new_dataset[single_image])
            the_duplicated_images_in_old_dataset.add(old_dataset[single_image])
    return the_duplicated_images_in_new_dataset, the_duplicated_images_in_old_dataset

# def filter_dataset(the_target,dataset):
#     the_duplicated_images ={}
#     #dataset is already hashed
#     the_images = get_all_images_from_path(the_target)
#     the_disease_name = Path(the_target).name
#     for image in the_images:
#         hash_algo = hl.md5()
#         with open(image, "rb") as f:
#             while chunk := f.read(8192):
#                 hash_algo.update(chunk)
#             the_hashed_image = hash_algo.hexdigest()
#             if the_hashed_image in dataset and Path(dataset[the_hashed_image]).parent.name != the_disease_name :
#                 print("duplicated image")





target_disease = r"C:\Users\aseel\Downloads\Tomato Leaf Disease Dataset\Tomato Leaf Disease Dataset\TomatoDataset\TomatoDataset"
the_whole_diseases=r"C:\Users\aseel\Downloads\testDataset\archive\train"

target_disease = get_all_images_from_path(target_disease)
target_disease = hash_all_images(target_disease)

the_whole_diseases = get_all_images_from_path(the_whole_diseases)
# the_whole_diseases = hash_all_images(the_whole_diseases)


# the_results = filter_dataset(target_disease,the_whole_diseases)
#
# new_DS = the_results[0]
# old_DS = the_results[1]
#
# new_DS = list(new_DS)
# old_DS = list(old_DS)
#
# for image in new_DS:
#     os.remove(image)
#     print(f"this image is removed : {image}")
#


















