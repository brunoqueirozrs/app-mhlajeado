/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Folder, FileText, Download, Share2, Search, ArrowLeft, Image as ImageIcon, FolderOpen, ExternalLink, HelpCircle } from "lucide-react";

interface MaterialsPageProps {
  onBackToDashboard: () => void;
}

export default function MaterialsPage({ onBackToDashboard }: MaterialsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const FOLDER_ID = "1p8rV9dAs9t98fGyl7W3m244_-I37JTeg";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Abre a pesquisa no próprio Google Drive para a pasta definida
      window.open(`https://drive.google.com/drive/search?q=type:xls%20OR%20type:pdf%20OR%20type:doc%20${encodeURIComponent(searchTerm)}`, "_blank");
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10 relative">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToDashboard} 
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition cursor-pointer lg:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Drive Corporativo</h1>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              Biblioteca de formulários, documentos e arquivos da equipe.
            </p>
          </div>
        </div>
        <a 
          href={`https://drive.google.com/drive/folders/${FOLDER_ID}?usp=drive_link`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Abrir no Google Drive
        </a>
      </header>

      {/* Main Content Area: Google Drive Embed */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col">
        {/* Search Bar */}
        <div className="mb-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Pesquisar arquivos e documentos pelo nome..."
              className="w-full card-modern border border-slate-300 rounded-xl py-3 pl-10 pr-28 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition cursor-pointer"
            >
              Buscar
            </button>
          </form>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 ml-1">
            <HelpCircle className="w-3.5 h-3.5" />
            A pesquisa abrirá uma nova aba oficial do Google Drive devido a restrições de segurança.
          </div>
        </div>

        <div className="flex-1 card-modern border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col relative w-full min-h-[600px] overflow-hidden">
          {/* Decorative Window Bar */}
          <div className="h-11 border-b border-slate-100 bg-slate-50/80 backdrop-blur flex items-center px-4 gap-2 shrink-0 relative z-20">
            <div className="flex gap-1.5 opacity-60">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
            </div>
            <div className="mx-auto flex items-center gap-2 px-3 py-1 card-modern border border-slate-200/70 rounded-md text-[10px] font-semibold text-slate-500 shadow-sm absolute left-1/2 -translate-x-1/2 select-none">
               <Folder className="w-3 h-3 text-amber-500" />
               Google Drive Workspace
            </div>
            <div className="flex-1"></div>
          </div>

          <div className="flex-1 relative bg-slate-50 flex flex-col">
            {/* Iframe Loading Placeholder */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-0">
               <div className="w-10 h-10 border-[3px] border-slate-200 border-t-sky-500 rounded-full animate-spin"></div>
               <p className="text-[11px] font-bold text-slate-400 mt-4 uppercase tracking-wider">Carregando visualização...</p>
            </div>
            
            <iframe 
              src={`https://drive.google.com/embeddedfolderview?id=${FOLDER_ID}#grid`} 
              className="absolute inset-0 z-10 w-full h-full border-0 bg-transparent" 
              allow="autoplay"
              title="Google Drive Folder"
            ></iframe>
          </div>
        </div>
        
        <div className="mt-4 text-center">
           <a 
            href={`https://drive.google.com/drive/folders/${FOLDER_ID}?usp=drive_link`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="md:hidden inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 md:bg-slate-100 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold text-sm rounded-xl transition"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir diretamente no Google Drive
          </a>
        </div>
      </main>
    </div>
  );
}
