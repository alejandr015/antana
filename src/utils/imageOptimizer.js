/**
 * imageOptimizer.js
 * Toma un archivo File (imagen), lo recorta a un cuadrado exacto en el centro,
 * lo redimensiona al tamaño objetivo, y retorna un Blob WebP altamente comprimido.
 */

export const resizeAndCropImage = (file, targetSize = 500, croppedAreaPixels = null) => {
  return new Promise((resolve, reject) => {
    // Verificar si es una imagen
    if (!file.type.startsWith('image/')) {
      return reject(new Error('El archivo seleccionado no es una imagen.'));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let startX, startY, cropWidth, cropHeight;

        if (croppedAreaPixels) {
          // Si tenemos coordenadas elegidas por el usuario
          startX = croppedAreaPixels.x;
          startY = croppedAreaPixels.y;
          cropWidth = croppedAreaPixels.width;
          cropHeight = croppedAreaPixels.height;
        } else {
          // Auto-recorte cuadrado al centro por defecto
          const minDimension = Math.min(img.width, img.height);
          startX = (img.width - minDimension) / 2;
          startY = (img.height - minDimension) / 2;
          cropWidth = minDimension;
          cropHeight = minDimension;
        }

        // Crear el canvas virtual
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        // Dibujar la imagen recortada y escalada en el canvas
        ctx.drawImage(
          img,
          startX, startY, cropWidth, cropHeight, // Coordenadas fuente (Recorte)
          0, 0, targetSize, targetSize // Coordenadas destino (Canvas final)
        );

        // Convertir a WebP con calidad 0.85 (Ultra ligero sin perder calidad visual)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Error al procesar y comprimir la imagen en el navegador.'));
            }
          },
          'image/webp',
          0.85
        );
      };
      img.onerror = () => reject(new Error('Error al leer la imagen.'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Error al abrir el archivo.'));
    reader.readAsDataURL(file);
  });
};
