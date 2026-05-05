import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import jsQR from 'jsqr';

/**
 * Hook para separar la lógica completa de escaneo QR de la interfaz de Validar.jsx
 */
export function useScanner(readerId, customConfig = null) {
  const [escaneando, setEscaneando] = useState(false);
  const [errorCamara, setErrorCamara] = useState(null);
  const [tooltipText, setTooltipText] = useState('Buscando QR...');
  const scannerRef = useRef(null);

  // Lógica del Tooltip rotativo si está escaneando
  useEffect(() => {
    if (!escaneando) return;
    
    const consejos = [
      'Buscando QR...',
      'Acércate un poco si está borroso',
      'Evita los reflejos de luz',
      'Enfoca el centro del código QR',
      'Mantén la cámara estable'
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % consejos.length;
      setTooltipText(consejos[i]);
    }, 4000);

    return () => clearInterval(interval);
  }, [escaneando]);

  // Asegurar limpieza global al desmontar
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  const iniciarCamara = useCallback((onScanSuccess) => {
    setErrorCamara(null);
    setEscaneando(true);
    let mounted = true;

    // Asegurar que React haya montado #readerId en el DOM
    setTimeout(() => {
      if (!mounted) return;
      const html5Qr = new Html5Qrcode(readerId);
      scannerRef.current = html5Qr;

      const config = customConfig || {
        fps: 20,
        qrbox: (viewWidth, viewHeight) => {
          // Mantenerlo sincronizado con el CSS (80% del ancho)
          const size = Math.min(viewWidth, viewHeight) * 0.8;
          return { width: size, height: size };
        },
        aspectRatio: 1.0,
      };

      html5Qr
        .start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (mounted) onScanSuccess(decodedText);
          },
          () => {} // onError vacio
        )
        .then(() => {
          // Si el usuario pausó inmediatamente antes de que resolviera
          if (!mounted) {
             html5Qr.stop().catch(() => {});
          }
        })
        .catch((err) => {
          if (mounted) {
            setErrorCamara(err?.message || 'No se pudo acceder a la cámara.');
            setEscaneando(false);
          }
        });
    }, 50); // delay mount
    
    return () => {
       mounted = false;
       try {
         if (scannerRef.current) scannerRef.current.stop().catch(() => {});
       } catch { /* silently ignore */ }
    };
  }, [readerId]);

  const detenerCamara = useCallback(() => {
    setEscaneando(false);
    setErrorCamara(null);
    if (scannerRef.current) {
      try {
        scannerRef.current.stop().catch(() => {});
      } catch { /* silently ignore */ }
    }
  }, []);

  const escanearImagen = useCallback(async (file, onScanSuccess, onScanError) => {
    if (!file) return;

    try {
      // Intento 1: Html5Qrcode (ideal para QRs limpios y claros)
      const html5Qr = new Html5Qrcode(readerId);
      const decodedText = await html5Qr.scanFile(file, true);
      onScanSuccess(decodedText);
    } catch {
      // Intento 2 (Fallback JSQR): Si es una imagen compleja exportada (Ej. carnet oscuro),
      // html5Qr es propenso a fallar. Usamos jsQR analizando los píxeles puros del canvas.
      try {
        const image = new Image();
        const url = URL.createObjectURL(file);
        
        image.onload = () => {
          URL.revokeObjectURL(url);
          const canvas = document.createElement('canvas');
          let width = image.width;
          let height = image.height;
          // Escalar hacia abajo si es gigantesca, pero manteniendo buena resolución
          if (width > 1200) { height *= 1200 / width; width = 1200; }
          
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          context.drawImage(image, 0, 0, width, height);

          // Extraer pixeles y buscar el QR a pura fuerza bruta
          const imageData = context.getImageData(0, 0, width, height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert", // El QR es negro sobre blanco dentro del carnet oscuro
          });

          if (code && code.data) {
            onScanSuccess(code.data);
          } else {
            onScanError(new Error('No se encontró un código QR ni siquiera en el escáner profundo.'));
          }
        };

        image.onerror = () => onScanError(new Error('No se pudo procesar el archivo como imagen.'));
        image.src = url;

      } catch (errFallback) {
        onScanError(new Error('El archivo está dañado o no tiene formato de carnet válido.'));
      }
    }
  }, [readerId]);

  return {
    escaneando,
    errorCamara,
    tooltipText,
    iniciarCamara,
    detenerCamara,
    escanearImagen
  };
}
