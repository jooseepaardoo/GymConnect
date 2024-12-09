export const resizeImage = (file, maxWidth = 800, maxHeight = 800) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

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

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            }));
          },
          'image/jpeg',
          0.7
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export const generateThumbnail = async (file, size = 150) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = size;
        canvas.height = size;

        // Calcular dimensiones para recorte cuadrado
        const minDimension = Math.min(img.width, img.height);
        const sourceX = (img.width - minDimension) / 2;
        const sourceY = (img.height - minDimension) / 2;

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          minDimension,
          minDimension,
          0,
          0,
          size,
          size
        );

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], `thumb_${file.name}`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            }));
          },
          'image/jpeg',
          0.7
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export const uploadImage = async (file, path, userId) => {
  try {
    // Validar el archivo
    const validationError = validateImage(file);
    if (validationError) {
      throw new Error(validationError);
    }

    // Redimensionar la imagen
    const resizedImage = await resizeImage(file);
    
    // Generar thumbnail
    const thumbnail = await generateThumbnail(file);

    // Subir imagen original
    const originalRef = ref(storage, `${path}/${userId}/original_${file.name}`);
    await uploadBytes(originalRef, resizedImage);
    const originalUrl = await getDownloadURL(originalRef);

    // Subir thumbnail
    const thumbRef = ref(storage, `${path}/${userId}/thumb_${file.name}`);
    await uploadBytes(thumbRef, thumbnail);
    const thumbnailUrl = await getDownloadURL(thumbRef);

    return {
      originalUrl,
      thumbnailUrl,
    };
  } catch (error) {
    console.error('Error al subir imagen:', error);
    throw error;
  }
};

export const deleteImage = async (url) => {
  try {
    const imageRef = ref(storage, url);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    throw error;
  }
};