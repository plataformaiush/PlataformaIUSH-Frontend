// src/presentation/features/files/app/pagePrueba.tsx

import React from 'react';

import './files.css'

import {
  DownloadButton,
  UploadButton,
  PreviewButton,
  DeleteButton,

  DownloadIconButton,
  PreviewIconButton,
  ShareIconButton,
  ExpandIconButton,
  DeleteIconButton,
} from '../components/buttons'

import { ActionButton } from '../components/ActionButton'

export default function FilesPage() {
  return (
    <div className="files-page">

      <div className="files-container">

        <h1 className="files-title">
          Sistema de Botones — Gestión de Archivos
        </h1>

        {/* ───────────────────────────── */}
        {/* ACTION BUTTONS */}
        {/* ───────────────────────────── */}
        <section className="files-card">

          <h2 className="files-card-title">
            Botones principales
          </h2>

          <div className="files-grid">

            <DownloadButton
              className="btn-download"
              onClick={() => alert('Descargar')}
            />

            <PreviewButton
              className="btn-preview"
              onClick={() => alert('Vista previa')}
            />

            <UploadButton
              className="btn-upload"
              onClick={() => alert('Subir')}
            />

            <DeleteButton
              className="btn-delete"
              onClick={() => alert('Eliminar')}
            />

          </div>
        </section>

        {/* ───────────────────────────── */}
        {/* SIZE DEMO */}
        {/* ───────────────────────────── */}
        <section className="files-card">

          <h2 className="files-card-title">
            Tamaños reutilizables
          </h2>

          <div className="demo-row">

            <ActionButton size="xs">
              XS
            </ActionButton>

            <ActionButton size="sm">
              SM
            </ActionButton>

            <ActionButton size="md">
              MD
            </ActionButton>

            <ActionButton size="lg">
              LG
            </ActionButton>

          </div>
        </section>

        {/* ───────────────────────────── */}
        {/* ICON BUTTONS */}
        {/* ───────────────────────────── */}
        <section className="files-card">

          <h2 className="files-card-title">
            Toolbar Buttons
          </h2>

          <div className="toolbar-row">

            <DownloadIconButton />

            <PreviewIconButton />

            <ShareIconButton />

            <ExpandIconButton />

            <DeleteIconButton />

          </div>
        </section>

      </div>
    </div>
  )
}