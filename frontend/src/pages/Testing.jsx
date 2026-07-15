import { useEffect, useMemo, useRef, useState } from "react";
import { BrainCircuit, FileVideo, ImagePlay } from "lucide-react";

import AISystemBoot from "../components/AISystemBoot";
import PreviewPanel from "../components/PreviewPanel";
import ResultPanel from "../components/ResultPanel";
import UploadBox from "../components/UploadBox";

const MOCK_RESULT = {
  objects: [
    {
      label: "person",
      confidence: 0.87,
      bbox: {
        left: 34,
        top: 18,
        width: 22,
        height: 46,
      },
    },
  ],
};

function Testing() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [booting, setBooting] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1800);
    return () => clearTimeout(t);
  }, []);

  const fileType = useMemo(() => {
    if (!file) {
      return null;
    }

    return file.type.startsWith("image/") ? "image" : "video";
  }, [file]);

  const handleFileSelect = (nextFile) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setFile(nextFile);
    setDetectionResult(null);
    setIsAnalyzing(false);
  };

  const handleRunDetection = () => {
    if (!file || isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);
    setDetectionResult(null);

    timeoutRef.current = window.setTimeout(() => {
      setDetectionResult(MOCK_RESULT);
      setIsAnalyzing(false);
      timeoutRef.current = null;
    }, 1500);
  };

  return (
    <>
      {booting && <AISystemBoot onComplete={() => setBooting(false)} />}
      <main
        className={`min-h-screen px-4 py-4 md:px-8 md:py-6 transition-opacity duration-500 ${
          booting ? "opacity-40 pointer-events-none blur-sm" : "opacity-100"
        }`}
      >
        <div className="grid gap-6">
          <HeroCard
            eyebrow="Validation Lab"
            title="Image & Video Detection Testing"
            description="Upload media, preview the input, and simulate a full object-detection workflow with polished AI-style feedback."
          />

          <section className="grid gap-4 lg:grid-cols-3">
            <InfoCard
              icon={ImagePlay}
              title="Image Testing"
              description="Validate still-frame object detection UI with bounding overlays and result summaries."
            />
            <InfoCard
              icon={FileVideo}
              title="Video Testing"
              description="Preview recorded clips in a functional-looking testing surface before live deployment."
            />
            <InfoCard
              icon={BrainCircuit}
              title="AI Simulation"
              description="Mock inference flow designed to feel like a real AI system without backend coupling yet."
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
            <div className="grid gap-4">
              <UploadBox onFileSelect={handleFileSelect} file={file} />
              <PreviewPanel
                previewUrl={previewUrl}
                fileType={fileType}
                detectionResult={detectionResult}
                isAnalyzing={isAnalyzing}
              />

              <div className="rounded-[28px] border border-slate-200/70 bg-white/60 p-5 backdrop-blur-2xl shadow-[0_22px_70px_rgba(14,165,233,0.08)] transition-all duration-300 ease-out dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-600/80 transition-all duration-300 dark:text-cyan-300/75">
                      Detection Control
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 transition-all duration-300 dark:text-slate-300">
                      Run a mock detection pass to simulate a functional AI inspection workflow.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRunDetection}
                    disabled={!file || isAnalyzing}
                    className="neon-button inline-flex items-center justify-center rounded-full border border-cyan-300/40 bg-white/75 px-6 py-3 text-sm font-medium text-slate-900 shadow-[0_0_22px_rgba(34,211,238,0.12)] transition-all duration-300 ease-out hover:scale-[1.03] hover:border-violet-400/35 hover:shadow-[0_0_28px_rgba(124,58,237,0.16)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100 dark:border-cyan-400/25 dark:bg-cyan-400/10 dark:text-cyan-50"
                  >
                    {isAnalyzing ? "Analyzing..." : "Run Detection"}
                  </button>
                </div>
              </div>
            </div>

            <ResultPanel
              detectionResult={detectionResult}
              isAnalyzing={isAnalyzing}
              file={file}
            />
          </section>
        </div>
      </main>
    </>
  );
}

function HeroCard({ eyebrow, title, description }) {
  return (
    <div className="rounded-[30px] border border-slate-200/70 bg-white/60 p-6 backdrop-blur-2xl shadow-[0_22px_70px_rgba(124,58,237,0.08)] transition-all duration-300 dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
      <p className="text-[11px] uppercase tracking-[0.34em] text-violet-600/80 transition-all duration-300 dark:text-violet-300/75">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-900 transition-all duration-300 dark:text-white">
        {title}
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 transition-all duration-300 dark:text-slate-300">
        {description}
      </p>
    </div>
  );
}

function InfoCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white/60 p-5 backdrop-blur-2xl shadow-[0_22px_70px_rgba(124,58,237,0.08)] transition-all duration-300 ease-out hover:scale-[1.015] hover:border-violet-400/25 hover:shadow-[0_24px_80px_rgba(124,58,237,0.12)] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
      <div className="inline-flex rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-violet-600 transition-all duration-300 dark:text-violet-200">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900 transition-all duration-300 dark:text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-600 transition-all duration-300 dark:text-slate-300">
        {description}
      </p>
    </div>
  );
}

export default Testing;
