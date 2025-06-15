import { useEffect, useRef, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import * as pdfjsLib from 'pdfjs-dist';
import MyDocument from './MyDocument';

// Set the PDF.js worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.min.mjs';

const PDFPreview = ({ formData, onReady  }) => {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  
  useEffect(() => {
    if (!rendered) {
      setRendered(true);
      if (onReady) onReady();
    }
  }, [rendered, onReady]);

  useEffect(() => {
    let isCanceled = false;
    let renderTask = null;

    const generateAndRenderPDF = async () => {
      try {
        const blob = await pdf(<MyDocument formData={formData} />).toBlob();
        if (isCanceled) return;

        const url = URL.createObjectURL(blob);

        const loadingTask = pdfjsLib.getDocument(url);
        const pdfDoc = await loadingTask.promise;
        if (isCanceled) return;

        const page = await pdfDoc.getPage(1);
        if (isCanceled) return;

        // Use smaller scale on mobile for better performance
        const scale = window.innerWidth < 768 ? 0.75 : 1.5;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas pixel dimensions
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // 🔥 Important: Set canvas style dimensions for mobile visibility
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        // Optional: Background color for visibility/debugging
        canvas.style.backgroundColor = '#ffffff';

        const renderContext = { canvasContext: context, viewport };
        renderTask = page.render(renderContext);

        await renderTask.promise;
        URL.revokeObjectURL(url);
      } catch (error) {
        if (!isCanceled) {
          console.error('Error during PDF rendering:', error);
        }
      }
    };

    generateAndRenderPDF();

    return () => {
      isCanceled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [formData]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full border border-[#ccc]"
      style={{
        maxWidth: '100%',
        display: 'block',
        WebkitOverflowScrolling: 'touch',
        overflow: 'hidden',
      }}
    />
  );
};

export default PDFPreview;
