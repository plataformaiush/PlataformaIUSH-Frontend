// src/presentation/features/grades/services/certificateService.ts

import { Certificate } from "../../../../domain/grades";



/**
 * Genera un PDF simulado para un certificado
 * En una aplicación real, esto haría una llamada a un backend o usaría jsPDF/@react-pdf/renderer
 */
export async function generateCertificatePdf(
  certificate: Certificate
): Promise<string> {
  return new Promise((resolve) => {
    // Simulamos un pequeño delay de "generación"
    setTimeout(() => {
      // Crear un PDF simple usando Canvas y convertir a Blob
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve('');
        return;
      }

      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Borde decorativo
      ctx.strokeStyle = '#223740';
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Título
      ctx.fillStyle = '#223740';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CERTIFICADO DE FINALIZACIÓN', canvas.width / 2, 75);

      // Línea decorativa
      ctx.strokeStyle = '#58838C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(75, 100);
      ctx.lineTo(canvas.width - 75, 100);
      ctx.stroke();

      // Contenido
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Se certifica que', canvas.width / 2, 150);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Usuario IUSH', canvas.width / 2, 195);

      ctx.fillStyle = '#475569';
      ctx.font = '16px Arial';
      ctx.fillText(`Ha completado exitosamente el curso`, canvas.width / 2, 240);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(certificate.courseName, canvas.width / 2, 285);

      // Información del certificado
      ctx.fillStyle = '#64748B';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Certificado ID: ${certificate.certificateId}`, canvas.width / 2, 340);

      const dateStr = new Date(certificate.issueDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      ctx.fillText(`Emitido el: ${dateStr}`, canvas.width / 2, 365);

      // Pie
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 9px Arial';
      ctx.fillText('✓ Válido internacionalmente', canvas.width / 2, 400);

      // Convertir canvas a Blob y luego a URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          resolve('');
        }
      }, 'application/pdf');
    }, 800);
  });
}

/**
 * Descarga un PDF desde una URL
 */
export function downloadPdf(pdfUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Opcional: limpiar la URL después de un tiempo
  setTimeout(() => {
    URL.revokeObjectURL(pdfUrl);
  }, 100);
}
