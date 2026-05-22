// src/presentation/features/grades/components/CertificationCenter.tsx

import { useState } from 'react';
import { Download, Lock, Star } from 'lucide-react';
import { mockCertificates } from '../data/mock-grades';
import { PdfPreviewModal } from './PdfPreviewModal';
import { generateCertificatePdf, downloadPdf } from '../services/certificateService';
import { Certificate } from '../../../../domain/grades';


export function CertificationCenter() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentCertificate, setCurrentCertificate] = useState<Certificate | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePreviewPdf = async (certificate: Certificate) => {
    setCurrentCertificate(certificate);
    setIsPreviewOpen(true);
    setIsLoading(true);

    try {
      const url = await generateCertificatePdf(certificate);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setPdfUrl('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (currentCertificate && pdfUrl) {
      const fileName = `${currentCertificate.certificateId}.pdf`;
      downloadPdf(pdfUrl, fileName);
    }
  };

  const handleCloseModal = () => {
    setIsPreviewOpen(false);
    setPdfUrl('');
    setCurrentCertificate(null);
  };

  return (
    <div className="w-full">
      {/* Title */}
      <div className="mb-6">
        <h1 className="font-bold mb-1" style={{ fontSize: '1.5rem', color: '#0F172A' }}>
          Mis Certificados
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
          Descarga y gestiona tus certificados de finalización de cursos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockCertificates.map(cert => {
          const unlocked = cert.status === 'unlocked';
          return (
            <div
              key={cert.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '0.875rem',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: unlocked
                  ? '0 2px 8px rgba(34,55,64,0.08)'
                  : '0 1px 3px rgba(0,0,0,0.04)',
                opacity: unlocked ? 1 : 0.7,
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => {
                if (unlocked) {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(34,55,64,0.14)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = unlocked
                  ? '0 2px 8px rgba(34,55,64,0.08)'
                  : '0 1px 3px rgba(0,0,0,0.04)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              {/* Banner */}
              <div
                style={{
                  height: 120,
                  background: unlocked
                    ? 'linear-gradient(135deg, #223740 0%, #58838C 100%)'
                    : '#F1F5F9',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unlocked ? (
                  <>
                    {/* Decorative circles */}
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
                    <div style={{ position: 'absolute', bottom: -30, left: -10, width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
                    {/* Star icon — filled to match Figma */}
                    <div
                      style={{
                        width: 56, height: 56,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid rgba(255,255,255,0.25)',
                      }}
                    >
                      <Star
                        className="w-7 h-7"
                        style={{ color: '#AEEBF2', fill: '#AEEBF2' }}
                      />
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      width: 52, height: 52,
                      borderRadius: '50%',
                      backgroundColor: '#E2E8F0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Lock className="w-6 h-6" style={{ color: '#94A3B8' }} />
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="font-semibold mb-3" style={{ color: '#0F172A', fontSize: '0.9375rem' }}>
                  {cert.courseName}
                </h3>

                {unlocked ? (
                  <>
                    <div className="mb-1" style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      Emitido el{' '}
                      {new Date(cert.issueDate).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </div>
                    {/* "ID: CERT-2026-001" — prefix added to match Figma */}
                    <div
                      className="mb-4 font-mono"
                      style={{ fontSize: '0.75rem', color: '#94A3B8' }}
                    >
                      ID: {cert.certificateId}
                    </div>
                    <button
                      onClick={() => handlePreviewPdf(cert)}
                      className="w-full flex items-center justify-center gap-2 rounded-lg font-semibold transition-opacity hover:opacity-90"
                      style={{
                        backgroundColor: '#223740',
                        color: '#ffffff',
                        padding: '0.625rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Descargar PDF
                    </button>
                  </>
                ) : (
                  <>
                    <p className="mb-3" style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                      Completa el curso para desbloquear
                    </p>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between mb-1.5">
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Progreso</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                          {cert.progress}%
                        </span>
                      </div>
                      <div style={{ height: 6, backgroundColor: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${cert.progress}%`,
                            height: '100%',
                            backgroundColor: '#84B9BF',
                            borderRadius: 99,
                          }}
                        />
                      </div>
                    </div>

                    <button
                      disabled
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        backgroundColor: '#F1F5F9',
                        color: '#94A3B8',
                        padding: '0.625rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'not-allowed',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      <Lock className="w-4 h-4" />
                      Bloqueado
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* PDF Preview Modal */}
      {currentCertificate && (
        <PdfPreviewModal
          isOpen={isPreviewOpen}
          pdfUrl={pdfUrl}
          certificateId={currentCertificate.certificateId}
          onClose={handleCloseModal}
          onDownload={handleDownload}
          loading={isLoading}
        />
      )}
    </div>
  );
}
