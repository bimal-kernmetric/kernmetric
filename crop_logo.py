from PIL import Image

def crop_image(image_path):
    img = Image.open(image_path)
    # Get bounding box of transparent boundary
    bbox = img.getbbox()
    if bbox:
        cropped = img.crop(bbox)
        cropped.save(image_path)
        print("Cropped logo.png to actual bounding box.")
    else:
        print("Bbox not found, no transparency crop executed.")

crop_image("assets/logo.png")
