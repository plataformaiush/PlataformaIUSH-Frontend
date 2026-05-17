// src/presentation/features/files/app/pagePrueba.tsx
import React, { useState } from "react";

import { UploadButton } from "../components/buttons/UploadButton";
import { DownloadButton } from "../components/buttons/DownloadButton";
import { DeleteButton } from "../components/buttons/DeleteButton";
import { PreviewButton } from "../components/buttons/PreviewButton";
import { UploadModal } from "../components/buttons/Uploadmodal";
import { FilePreviewContainer } from "../components/vistas/Filepreviewcontainer";
import { FileList } from "../components/FileList";
import type { Documento } from "../../../../domain/files/Filesapi";

function Section({
  title,
  code,
  children,
}: {
  title: string;
  code: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#223740]">{title}</h2>
      </div>
      <div className="px-6 py-6 bg-gray-50 flex flex-wrap gap-3 items-start">
        {children}
      </div>
      <div className="px-6 py-4 border-t border-gray-100 bg-[#f8fafc]">
        <pre className="text-[11px] text-[#223740] font-mono whitespace-pre-wrap leading-relaxed">
          {code}
        </pre>
      </div>
    </div>
  );
}

export default function PagePrueba() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Documento[]>([]);

  const handleDeleteUploaded = (id: string) =>
    setUploadedFiles((prev) => prev.filter((d) => d.id !== id));

  const DEMO_ID = "1";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="pb-2 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#223740]">
            Guía de Componentes — Equipo 2
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Referencia visual de todos los componentes del módulo{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
              presentation/features/files
            </code>
          </p>
        </div>

        {/* 1. UploadButton + FileList */}
        <Section
          title="1. UploadButton — Sube archivo a la API y lo agrega al listado"
          code={`import { UploadButton } from '@presentation/features/files/components/buttons/UploadButton'
            import { FileList }    from '@presentation/features/files/components/FileList'
            import type { Documento } from '@domain/files/Filesapi'
            const [archivos, setArchivos] = useState<Documento[]>([])
            
            <UploadButton
             onUploaded={(doc) => setArchivos((prev) => [doc, ...prev])}
             />
             
            <FileList 
            documents={archivos} 
            heading="Archivos subidos en esta sesión" 
            onDeleted={(id) => setArchivos((prev) => prev.filter((d) => d.id !== id))}
            />`}
        >
          <div className="w-full space-y-4">
            <UploadButton
              onUploaded={(doc) => setUploadedFiles((prev) => [doc, ...prev])}
            />
            {uploadedFiles.length > 0 ? (
              <FileList
                documents={uploadedFiles}
                heading="Archivos subidos en esta sesión"
                onDeleted={handleDeleteUploaded}
              />
            ) : (
              <p className="text-xs text-gray-400">
                Aún no has subido archivos en esta sesión.
              </p>
            )}
          </div>
        </Section>

        {/* 2. DownloadButton */}
        <Section
          title="2. DownloadButton — Descarga un archivo por ID"
          code={`import { DownloadButton } from '@presentation/features/files/components/buttons/DownloadButton'
            <DownloadButton id="abc-123" fileName="guia.pdf" /> 
            // Props: 
            // id:         string   — ID del documento (requerido) 
            // fileName?:  string   — nombre sugerido para la descarga
            // className?: string`}
        >
          <DownloadButton id={DEMO_ID} fileName="Guía_Metodología.pdf" />
        </Section>

        {/* 3. DeleteButton */}
        <Section
          title="3. DeleteButton — Elimina un archivo con confirmación doble"
          code={`import { DeleteButton } from '@presentation/features/files/components/buttons/DeleteButton' 
            <DeleteButton id="abc-123" onDeleted={(id) => console.log('Eliminado:', id)} /> 
            <DeleteButton id="abc-123" onDeleted={handleDeleted} iconOnly />
            // Props: 
            // id:          string                — ID del documento (requerido)
            // onDeleted?:  (id: string) => void  — callback tras eliminar exitosamente
            // iconOnly?:   boolean               — muestra solo el ícono de papelera
            // className?:  string`}
        >
          <DeleteButton
            id={DEMO_ID}
            onDeleted={(id) => alert(`Eliminado: ${id}`)}
          />
          <DeleteButton
            id={DEMO_ID}
            onDeleted={(id) => alert(`Eliminado: ${id}`)}
            iconOnly
          />
        </Section>

        {/* 4. PreviewButton */}
        <Section
          title="4. PreviewButton — Abre modal de previsualización"
          code={`import { PreviewButton } from '@presentation/features/files/components/buttons/PreviewButton' 
            <PreviewButton id="abc-123" label="Ver" variant="expand" />
            <PreviewButton id="abc-123" label="Reproducir" variant="play" />
            // Props:
            // id:        string              — ID del documento (requerido)
            // label?:    string              — texto del botón. Default: 'Ver'
            // variant?:  'expand' | 'play'  — ícono. Default: 'expand'
            // className?: string`}
        >
          <PreviewButton id={DEMO_ID} label="Ver" variant="expand" />
          <PreviewButton id="5" label="Reproducir" variant="play" />
        </Section>

        {/* 5. UploadModal */}
        <Section
          title="5. UploadModal — Modal de subida controlado manualmente"
          code={`import { UploadModal } from '@presentation/features/files/components/buttons/Uploadmodal'
          const [open, setOpen] = useState(false)
          <button onClick={() => setOpen(true)}>Abrir modal</button>
          <UploadModal 
          open={open} 
          onClose={() => setOpen(false)} 
          onUploaded={(doc) => { 
          setOpen(false)
          setArchivos((prev) => [doc, ...prev])
          }}
          />
          // Props:
          // open:        boolean                   — controla visibilidad (requerido) 
          // onClose:     () => void                — se llama al cerrar (requerido) 
          // onUploaded?: (doc: Documento) => void  — callback con el doc subido`}
        >
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#223740] text-white text-sm font-semibold hover:bg-[#1a2c35] transition-colors"
          >
            Abrir UploadModal
          </button>
          <UploadModal
            open={uploadModalOpen}
            onClose={() => setUploadModalOpen(false)}
            onUploaded={(doc) => {
              setUploadModalOpen(false);
              setUploadedFiles((prev) => [doc, ...prev]);
            }}
          />
        </Section>

        {/* 6. FilePreviewContainer modal */}
        <Section
          title="6. FilePreviewContainer — Modal de previsualización"
          code={`import { FilePreviewContainer } from '@presentation/features/files/components/vistas/Filepreviewcontainer'
            const [open, setOpen] = useState(false)
            {open && (
            <FilePreviewContainer 
            id="abc-123" 
            onClose={() => setOpen(false)}
            />
            )}
            // Soporta: PDF (iframe), imágenes, MP4, YouTube, Excel (Office Online)
            // Props:
            // id:        string     — ID del documento (requerido) 
            // onClose:   () => void — se llama al cerrar (requerido) 
            // embedded?: boolean    — modo panel inline sin backdrop. Default: false`}
        >
          <button
            onClick={() => setPreviewModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white text-[#223740] hover:border-[#5A878C] hover:text-[#5A878C] transition-all"
          >
            Abrir FilePreviewContainer
          </button>
          {previewModalOpen && (
            <FilePreviewContainer
              id={DEMO_ID}
              onClose={() => setPreviewModalOpen(false)}
            />
          )}
        </Section>

        {/* 7. FilePreviewContainer embedded */}
        <Section
          title="7. FilePreviewContainer embedded — Panel inline sin modal"
          code={`<FilePreviewContainer 
            id="abc-123" 
            onClose={() => setPreviewId(null)} 
            embedded
            />`}
        >
          <div className="w-full rounded-xl overflow-hidden border border-gray-200">
            <FilePreviewContainer id={DEMO_ID} onClose={() => {}} embedded />
          </div>
        </Section>
      </div>
    </div>
  );
}
