// util functions for handling image uploads and processing

// function to convert a file object to a base64 string (a way to represent binary data in text making it easier to pass the image directly in the user db table)
export const fileToBase64 = (file) => {
    // check if file exists
  return new Promise((resolve, reject) => {
    // create new FileReader object (built in browser API for reading files)
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
