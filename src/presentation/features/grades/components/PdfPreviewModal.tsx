// src/presentation/features/grades/components/PdfPreviewModal.tsx

import { X } from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  pdfUrl: string;
  certificateId: string;
  onClose: () => void;
  onDownload: () => void;
  loading?: boolean;
}

export function PdfPreviewModal({
  isOpen,
  pdfUrl,
  certificateId,
  onClose,
  onDownload,
  loading = false,
}: PdfPreviewModalProps) {
  if (!isOpen) return null;

  const getModalDimensions = () => {
    if (typeof window === 'undefined') {
      return {
        width: '90vw',
        height: '90vh',
        borderRadius: '0.875rem',
        padding: '1rem',
        isMobile: false,
        isTablet: false,
      };
    }

    const windowWidth = window.innerWidth;

    // Mobile: 100vw, 100vh, sin padding, sin bordes
    if (windowWidth < 768) {
      return {
        width: '100vw',
        height: '100vh',
        borderRadius: '0',
        padding: '0',
        isMobile: true,
        isTablet: false,
      };
    }

    // Tablet: 95vw, 92vh
    if (windowWidth < 1024) {
      return {
        width: '95vw',
        height: '92vh',
        borderRadius: '0.875rem',
        padding: '0.5rem',
        isMobile: false,
        isTablet: true,
      };
    }

    // Desktop: 90vw, 90vh
    return {
      width: '90vw',
      height: '90vh',
      borderRadius: '0.875rem',
      padding: '1rem',
      isMobile: false,
      isTablet: false,
    };
  };

  const dimensions = getModalDimensions();

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: dimensions.padding,
        }}
      >
        {/* Modal Container */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            backgroundColor: '#ffffff',
            borderRadius: dimensions.borderRadius,
            boxShadow: dimensions.isMobile ? 'none' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            width: dimensions.width,
            height: dimensions.height,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          {/* Header - Fixed */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: dimensions.isMobile ? '1rem' : '1.5rem 2rem',
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#ffffff',
              flexShrink: 0,
              gap: '1rem',
            }}
          >
            <h2
              style={{
                fontSize: dimensions.isMobile ? '1rem' : '1.375rem',
                fontWeight: 700,
                color: '#0F172A',
                margin: 0,
                textAlign: 'left',
                flex: 1,
              }}
            >
              Vista previa del certificado
            </h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.625rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0.5rem',
                transition: 'background-color 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#F1F5F9';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              <X className="w-6 h-6" style={{ color: '#64748B' }} />
            </button>
          </div>

          {/* Content - Body */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: dimensions.isMobile ? '0.75rem' : '1.5rem',
              overflowY: 'auto',
              overflowX: 'hidden',
              backgroundColor: '#F8FAFC',
              minHeight: 0,
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {loading ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1.5rem',
                  color: '#64748B',
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: '4px solid #E2E8F0',
                    borderTopColor: '#223740',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>
                  Cargando PDF...
                </p>
                <style>
                  {`@keyframes spin { to { transform: rotate(360deg); } }`}
                </style>
              </div>
            ) : pdfUrl ? (
              <iframe
                src={pdfUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '70vh',
                  border: 'none',
                  borderRadius: dimensions.isMobile ? '0' : '0.625rem',
                  backgroundColor: '#ffffff',
                  boxShadow: dimensions.isMobile ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  boxSizing: 'border-box',
                }}
                title={`Vista previa de ${certificateId}`}
              />
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  color: '#94A3B8',
                  padding: '3rem',
                }}
              >
                <p style={{ margin: 0, fontSize: '1rem' }}>
                  No se pudo cargar el PDF
                </p>
              </div>
            )}
          </div>

          {/* Footer - Fixed */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: dimensions.isMobile ? '0.75rem' : '1rem',
              padding: dimensions.isMobile ? '1rem' : '1.5rem 2rem',
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#ffffff',
              flexShrink: 0,
              flexWrap: dimensions.isMobile ? 'wrap' : 'nowrap',
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: dimensions.isMobile ? '0.625rem 1rem' : '0.75rem 1.75rem',
                backgroundColor: '#F1F5F9',
                color: '#475569',
                border: '1px solid #E2E8F0',
                borderRadius: '0.625rem',
                fontSize: dimensions.isMobile ? '0.875rem' : '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                flex: dimensions.isMobile ? '1' : 'auto',
                minWidth: '0',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#E2E8F0';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#F1F5F9';
              }}
            >
              Cerrar
            </button>
            <button
              onClick={onDownload}
              disabled={loading}
              style={{
                padding: dimensions.isMobile ? '0.625rem 1rem' : '0.75rem 1.75rem',
                backgroundColor: '#223740',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.625rem',
                fontSize: dimensions.isMobile ? '0.875rem' : '0.95rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s',
                flex: dimensions.isMobile ? '1' : 'auto',
                minWidth: '0',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#1a2a32';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(34, 55, 64, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#223740';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }
              }}
            >
              Descargar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
