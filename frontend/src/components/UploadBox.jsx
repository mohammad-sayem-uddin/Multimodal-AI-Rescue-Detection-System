import { FileImage, FileVideo, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

function UploadBox({ onFileSelect, file }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files) => {
    const nextFile = files?.[0];
    if (!nextFile) {
      return;
    }

    const isImage = nextFile.type.startsWith("image/");
    const isVideo = nextFile.type === "video/mp4";
    if (!isImage && !isVideo) {
      return;
    }

    onFileSelect(nextFile);
  };

  return (
    <div
      className={[
        "rounded-[28px] border border-dashed p-6 transition-all duration-300 ease-out",
        isDragging
          ? "border-cyan-400/45 bg-cyan-400/10 shadow-[0_0_28px_rgba(34,211,238,0.12)]"
          : "border-cyan-400/20 bg-white/45 hover:border-violet-400/35 hover:bg-violet-500/5 dark:bg-black/20",
      ].join(" ")}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.mp4"
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      <div className="flex flex-col items-center justify-center text-center">
        <div className="inline-flex rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-cyan-600 transition-all duration-300 dark:text-cyan-200">
          <UploadCloud className="h-7 w-7" />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-slate-900 transition-all duration-300 dark:text-white">
          Drop image or video here
        </h3>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 transition-all duration-300 dark:text-slate-300">
          Supports JPG, PNG, and MP4. Upload a file to preview it and simulate AI detection.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.28em] text-slate-500">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
            <FileImage className="h-3.5 w-3.5" />
            Image
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
            <FileVideo className="h-3.5 w-3.5" />
            Video
          </span>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="neon-button mt-6 inline-flex items-center gap-3 rounded-full border border-cyan-300/40 bg-white/75 px-5 py-3 text-sm font-medium text-slate-900 shadow-[0_0_22px_rgba(34,211,238,0.12)] transition-all duration-300 ease-out hover:scale-[1.03] hover:border-violet-400/35 hover:shadow-[0_0_26px_rgba(124,58,237,0.16)] active:scale-[0.98] dark:border-cyan-400/25 dark:bg-cyan-400/10 dark:text-cyan-50"
        >
          {file ? "Replace Media" : "Browse Files"}
        </button>
      </div>
    </div>
  );
}

export default UploadBox;
