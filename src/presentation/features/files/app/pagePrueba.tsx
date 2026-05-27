// src/presentation/features/files/app/pagePrueba.tsx
import React, { useEffect, useRef, useState } from "react";

import { UploadButton } from "../components/buttons/UploadButton";
import { DownloadButton } from "../components/buttons/DownloadButton";
import { DeleteButton } from "../components/buttons/DeleteButton";
import { PreviewButton } from "../components/buttons/PreviewButton";
import { UploadModal } from "../components/buttons/Uploadmodal";
import { FilePreviewContainer } from "../components/vistas/Filepreviewcontainer";
import { FileList } from "../components/FileList";
import { filesApi, type Documento } from "../../../../domain/files/Filesapi";
import { Settings2, Hash, Link2, ChevronDown, ChevronUp } from "lucide-react";

interface PlaygroundConfig {
  demoId: string;
  videoUrl: string;
}

function ConfigPanel({
  config,
  onChange,
}: {
  config: PlaygroundConfig;
  onChange: (next: PlaygroundConfig) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-[#5A878C]/30 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#223740] flex items-center justify-center">
            <Settings2 size={13} className="text-[#AEEBF2]" />
          </div>
          <span className="text-sm font-bold text-[#223740]">
            Configuración del playground
          </span>
          <span className="text-[10px] text-gray-400 font-normal hidden sm:inline">
            — aplica a todas las secciones (excepto la 1)
          </span>
        </div>
        {open ? (
          <ChevronUp size={15} className="text-gray-400" />
        ) : (
          <ChevronDown size={15} className="text-gray-400" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 grid sm:grid-cols-2 gap-4 border-t border-gray-100">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <Hash size={11} />
              id_maestro_documento
            </label>
            <input
              type="text"
              value={config.demoId}
              onChange={(e) => onChange({ ...config, demoId: e.target.value })}
              placeholder="documentos/1747123456789_archivo.pdf"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#223740] font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5A878C]/40 focus:border-[#5A878C] transition-all placeholder:text-gray-300"
            />
            <p className="text-[10px] text-gray-400">
              Ruta relativa dentro de <code className="bg-gray-100 px-1 rounded">uploads/</code>.
              Usado en Download, Delete, Preview y FilePreviewContainer.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <Link2 size={11} />
              URL de video (PreviewButton "Reproducir")
            </label>
            <input
              type="text"
              value={config.videoUrl}
              onChange={(e) => onChange({ ...config, videoUrl: e.target.value })}
              placeholder="https://youtu.be/RBaSiVjtKR4"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#223740] font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5A878C]/40 focus:border-[#5A878C] transition-all placeholder:text-gray-300"
            />
            <p className="text-[10px] text-gray-400">
              YouTube, MP4 directo o cualquier URL compatible con el
              <code className="bg-gray-100 px-1 rounded ml-1">FilePreviewContainer</code>.
            </p>
          </div>
        </div>
      )}

      {!open && (
        <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-4">
          <span className="text-[11px] text-gray-500 font-mono">
            <span className="text-gray-400">id: </span>
            <span className="text-[#223740]">{config.demoId || <em className="text-gray-300">vacío</em>}</span>
          </span>
          <span className="text-[11px] text-gray-500 font-mono">
            <span className="text-gray-400">video: </span>
            <span className="text-[#223740]">{config.videoUrl || <em className="text-gray-300">vacío</em>}</span>
          </span>
        </div>
      )}
    </div>
  );
}

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

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function PagePrueba() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // ─────────────────────────────────────────────
  // Solo muestra docs subidos en esta sesión de navegador.
  // Los IDs se persisten en sessionStorage para sobrevivir recargas
  // de la misma pestaña, pero se limpian al cerrar el navegador.
  // Al recargar, se consulta cada ID al backend para traer datos frescos.
  // ─────────────────────────────────────────────
  const SESSION_KEY = "playground_doc_ids";
  const [uploadedFiles, setUploadedFiles] = useState<Documento[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) { setLoadingFiles(false); return; }
    const ids: string[] = JSON.parse(stored);
    if (ids.length === 0) { setLoadingFiles(false); return; }
    Promise.all(ids.map((id) => filesApi.obtenerPorId(id).catch(() => null)))
      .then((docs) => setUploadedFiles(docs.filter(Boolean) as Documento[]))
      .finally(() => setLoadingFiles(false));
  }, []);

  const saveIds = (docs: Documento[]) =>
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(docs.map((d) => d.id)));

  const handleDeleteUploaded = (id: string) => {
    setUploadedFiles((prev) => { const next = prev.filter((d) => d.id !== id); saveIds(next); return next; });
  };

  const handleUploaded = async (doc: Documento) => {
    try {
      const docFresh = await filesApi.obtenerPorId(doc.id);
      setUploadedFiles((prev) => { const next = [docFresh, ...prev]; saveIds(next); return next; });
    } catch {
      setUploadedFiles((prev) => { const next = [doc, ...prev]; saveIds(next); return next; });
    }
  };


  const [config, setConfig] = useState<PlaygroundConfig>({
    demoId: "1",
    videoUrl: "https://youtu.be/RBaSiVjtKR4",
  });

  const demoPreviewProps = config.demoId.startsWith("http")
    ? { url: config.demoId }
    : { id: config.demoId };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
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

        <ConfigPanel config={config} onChange={setConfig} />

        {/* 1. UploadButton + FileList */}
        <Section
          title="1. UploadButton — Sube archivo a la API y lo agrega al listado"
          code={`// ── IMPLEMENTACIÓN CORRECTA ──────────────────────────────────────
// Persiste solo los docs subidos en ESTA sesión de navegador.
// sessionStorage sobrevive recargas de pestaña pero se limpia al cerrarla.
// Al recargar, consulta cada ID al backend para traer datos frescos.

const SESSION_KEY = "mis_doc_ids"
const [docs, setDocs] = useState<Documento[]>([])
const [loading, setLoading] = useState(true)
const hasFetched = useRef(false)

useEffect(() => {
  if (hasFetched.current) return
  hasFetched.current = true
  const ids: string[] = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "[]")
  if (!ids.length) { setLoading(false); return }
  Promise.all(ids.map((id) => filesApi.obtenerPorId(id).catch(() => null)))
    .then((res) => setDocs(res.filter(Boolean) as Documento[]))
    .finally(() => setLoading(false))
}, [])

const saveIds = (docs: Documento[]) =>
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(docs.map((d) => d.id)))

// Al subir: obtenerPorId trae datos frescos del backend
const handleUploaded = async (doc: Documento) => {
  try {
    const fresh = await filesApi.obtenerPorId(doc.id)
    setDocs((prev) => { const next = [fresh, ...prev]; saveIds(next); return next })
  } catch {
    setDocs((prev) => { const next = [doc, ...prev]; saveIds(next); return next })
  }
}

// Al eliminar: filtrar local + actualizar sessionStorage
const handleDeleted = (id: string) =>
  setDocs((prev) => { const next = prev.filter((d) => d.id !== id); saveIds(next); return next })

// ── USO ──────────────────────────────────────────────────────────
import { UploadButton } from '@presentation/features/files/components/buttons/UploadButton'
import { FileList }     from '@presentation/features/files/components/FileList'
import { filesApi, type Documento } from '@domain/files/Filesapi'

<UploadButton onUploaded={handleUploaded} />
<FileList documents={docs} heading="Archivos de esta sesión" onDeleted={handleDeleted} />`}
        >
          <div className="w-full space-y-4">
            <UploadButton onUploaded={handleUploaded} />
            {loadingFiles ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 rounded-full border-2 border-[#AEEBF2] border-t-[#223740] animate-spin" />
              </div>
            ) : (
              uploadedFiles.length > 0 ? (
                <FileList
                  documents={uploadedFiles}
                  heading="Archivos de esta sesión"
                  onDeleted={handleDeleteUploaded}
                />
              ) : (
                <p className="text-xs text-gray-400">
                  Aún no has subido archivos en esta sesión.
                </p>
              )
            )}
          </div>
        </Section>

        {/* 2. DownloadButton */}
        <Section
          title="2. DownloadButton — Descarga un archivo por ID"
          code={`import { DownloadButton } from '@presentation/features/files/components/buttons/DownloadButton'
<DownloadButton id="${config.demoId}" fileName="guia.pdf" />
// Props:
// id:         string   — ID del documento (requerido)
// fileName?:  string   — nombre sugerido para la descarga
// className?: string`}
        >
          <DownloadButton id={config.demoId} fileName="Guía_Metodología.pdf" />
        </Section>

        {/* 3. DeleteButton */}
        <Section
          title="3. DeleteButton — Elimina un archivo con confirmación doble"
          code={`import { DeleteButton } from '@presentation/features/files/components/buttons/DeleteButton'
<DeleteButton id="${config.demoId}" onDeleted={(id) => console.log('Eliminado:', id)} />
<DeleteButton id="${config.demoId}" onDeleted={handleDeleted} iconOnly />
// Props:
// id:          string                — UUID del documento (id_maestro_documento)
// onDeleted?:  (id: string) => void  — callback tras eliminar exitosamente
// iconOnly?:   boolean               — muestra solo el ícono de papelera
// className?:  string`}
        >
          <DeleteButton
            id={config.demoId}
            onDeleted={(id) => alert(`Eliminado: ${id}`)}
          />
          <DeleteButton
            id={config.demoId}
            onDeleted={(id) => alert(`Eliminado: ${id}`)}
            iconOnly
          />
        </Section>

        {/* 4. PreviewButton */}
        <Section
          title="4. PreviewButton — Abre modal de previsualización"
          code={`import { PreviewButton } from '@presentation/features/files/components/buttons/PreviewButton'
// Con ID de documento (consulta la API):
<PreviewButton id="${config.demoId}" label="Ver" variant="expand" />

// Con URL directa (no consulta la API):
<PreviewButton url="${config.videoUrl}" label="Reproducir" variant="play" />

// Props:
// id?:        string             — ID del documento (exclusivo con url)
// url?:       string             — URL directa del recurso (exclusivo con id)
// label?:     string             — texto del botón. Default: 'Ver'
// variant?:   'expand' | 'play' — ícono. Default: 'expand'
// className?: string`}
        >
          <PreviewButton id={config.demoId} label="Ver" variant="expand" />
          <PreviewButton url={config.videoUrl} label="Reproducir" variant="play" />
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
    // NO llamar setOpen(false) aquí — el modal muestra el estado
    // "¡Archivo cargado!" y el usuario lo cierra con X o "Subir otro archivo"
    setDocs((prev) => [doc, ...prev])
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

// Con ID (consulta la API):
{open && <FilePreviewContainer id="${config.demoId}" onClose={() => setOpen(false)} />}

// Con URL directa (no consulta la API):
{open && <FilePreviewContainer url="${config.videoUrl}" onClose={() => setOpen(false)} />}

// Props (se requiere id O url, nunca los dos):
// id?:       string     — ID del documento → consulta filesApi.obtenerPorId
// url?:      string     — URL directa → visualiza sin llamar a la API
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
              {...demoPreviewProps}
              onClose={() => setPreviewModalOpen(false)}
            />
          )}
        </Section>

        {/* 7. FilePreviewContainer embedded */}
        <Section
          title="7. FilePreviewContainer embedded — Panel inline sin modal"
          code={`// Con ID:
<FilePreviewContainer id="${config.demoId}" onClose={() => {}} embedded />

// Con URL:
<FilePreviewContainer url="${config.videoUrl}" onClose={() => {}} embedded />`}
        >
          <div className="w-full rounded-xl overflow-hidden border border-gray-200">
            <FilePreviewContainer
              {...demoPreviewProps}
              onClose={() => {}}
              embedded
            />
          </div>
        </Section>

      </div>
    </div>
  );
}