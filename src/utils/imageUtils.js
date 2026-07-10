// src/utils/imageUtils.js

export const comprimirImagen = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No se seleccionó ninguna imagen."));
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const img = new Image();

      img.src = reader.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");

        const MAX_WIDTH = 1024;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = height * (MAX_WIDTH / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("No se pudo procesar la imagen."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrlComprimido = canvas.toDataURL("image/jpeg", 0.7);

        resolve({
          base64: dataUrlComprimido.split(",")[1],
          type: "image/jpeg",
          preview: dataUrlComprimido,
        });
      };

      img.onerror = () => {
        reject(new Error("No se pudo cargar la imagen."));
      };
    };

    reader.onerror = () => {
      reject(new Error("No se pudo leer el archivo."));
    };

    reader.readAsDataURL(file);
  });
};