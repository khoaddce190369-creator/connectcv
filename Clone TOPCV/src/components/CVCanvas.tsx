import React from 'react';
import { useCV } from '../context/CVContext';
import { TemplateRenderer } from './templates/TemplateRenderer';

export const CVCanvas: React.FC = () => {
  const { zoom } = useCV();

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start min-h-[calc(100vh-120px)] bg-[#eef2f6]">
      {/* Wrapper that scales with Zoom */}
      <div
        className="transition-transform duration-150 origin-top flex flex-col items-center"
        style={{
          transform: `scale(${zoom / 100})`,
          width: '210mm',
        }}
      >
        {/* Printable Paper Canvas */}
        <div
          id="cv-printable-area"
          className="w-[210mm] min-h-[297mm] bg-white shadow-xl rounded-sm transition-all relative overflow-hidden print:shadow-none print:m-0 print:w-full print:rounded-none border border-slate-300/60"
        >
          <TemplateRenderer />
        </div>

        {/* Paper Footer info */}
        <div className="mt-4 mb-8 text-center text-xs text-slate-500 select-none print:hidden flex items-center gap-2">
          <span>Kích thước chuẩn A4 (210mm × 297mm)</span>
          <span>•</span>
          <span className="font-semibold text-sky-700">© connectcv.id.vn</span>
        </div>
      </div>
    </div>
  );
};
