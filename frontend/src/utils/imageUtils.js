// util functions for handling image uploads and processing

// funcition to resize an image before converting to base64
// (this is to avoid memory issues when converting large images to base64 which was causing the app to crash bc of db storage limits etc)
export const resizeImage = (file, maxWidth = 300, maxHeight = 300, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    // create new FileReader object to read the file (built in browser api for reading files)
    const reader = new FileReader();

    // set up the FileReader onload event
    reader.onload = (readerEvent) => {
      // create an image object
      const img = new Image();

      // set up the image onload event
      img.onload = () => {
        // create a canvas element
        const canvas = document.createElement('canvas');

        // calculate the new dimensions
        let width = img.width;
        let height = img.height;

        // resize the image if it exceeds the max dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // set the canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // draw the resized image on the canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // convert the canvas to a blob (binary data)
        canvas.toBlob((blob) => {
          // create a new File object from the blob
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });

          // resolve the promise with the resized file
          resolve(resizedFile);
        }, file.type, quality);
      };

      // set the image source to the FileReader result
      img.src = readerEvent.target.result;
    };

    // set up the FileReader error event
    reader.onerror = (error) => reject(error);

    // read the file as a data url
    reader.readAsDataURL(file);
  });
};

// function to convert a file object to a base64 string (a way to represent binary data in text making it easier to pass the image directly in the user db table)
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    // create new FileReader object (built in browser api for reading files)
    const reader = new FileReader();
    reader.readAsDataURL(file); // read the file as a data URL
    reader.onload = () => resolve(reader.result); // resolve the promise with the result
    reader.onerror = (error) => reject(error); // reject the promise with the error
  });
};

// function to validate an image file for type and size
export const validateImageFile = (file, maxSizeInMB = 2) => {
  // check if the file exists
  if (!file) return null;

  // check file type
  const validTypes = ['image/jpeg', 'image/png','image/webp'];
  if (!validTypes.includes(file.type)) {
    return "Please select a valid image file (JPEG/JPG, PNG, or WEBP)";
  }

  // check file size (convert MB to bytes)
  const maxSize = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSize) {
    return `Image file size must be less than ${maxSizeInMB}MB`;
  }

  return null; // no errors, return null
};

// default profile picture url to use when no profile picture is provided (or if the user has not uploaded one yet)
export const DEFAULT_PROFILE_PIC = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
