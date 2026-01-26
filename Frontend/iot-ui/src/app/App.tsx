import { useEffect, useMemo, useState } from "react";
import { ImageInputCard } from "../components/ImageInputCard";
import { ResultsCard } from "../components/ResultsCard";
// import { mockProcessImage } from "../lib/MockProcessing";
import { analyzeImage } from "../lib/api/analyze";  
import type { AnalysisResult } from "../lib/Types";
import { ImageBackground } from "../components/ImageBackground";
import "../styles/App.css";
import { VideoBackground } from "../components/VideoBackground";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [isBusy, setIsBusy] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [hasRunForCurrentImage, setHasRunForCurrentImage] = useState(false);

  // Create/revoke object URL cleanly
  useEffect(() => {
    if (!file) {
      setImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const canAnalyze = useMemo(() => !!file && !isBusy, [file, isBusy]);

  async function runAnalysis() {
    if (!file || isBusy) return;

    setHasRunForCurrentImage(true);

    setIsBusy(true);
    setError(null);
    setResult(null);

    try {
      // const r = await mockProcessImage(file);
      const r = await analyzeImage(file);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setHasRunForCurrentImage(false);
    } finally {
      setIsBusy(false);
    }
  }

  function clearAll() {
    setFile(null);
    setResult(null);
    setError(null);
    setHasRunForCurrentImage(false);
  }

  const showRunButton = !!file && !hasRunForCurrentImage;
 
  return (
    <div className="app">
      <ImageBackground imageUrl="/background_image.png" dim={0.45} />
      {/* <VideoBackground dim={0.6} /> */}

      <div className="app__content">
        <div className="app__container">
          <header className="app__header">
            <div className="app__title">PlantIO</div>
            <div className="app__subtitle">
              Intelligent plant recognition for automated care.
            </div>
          </header>

          <div className="app__grid">
            <ImageInputCard
              imageUrl={imageUrl}
              onPickFile={(f) => {
                setFile(f);
                setResult(null);
                setError(null);
              }}
              onClear={clearAll}
              isBusy={isBusy}
            />
            <ResultsCard 
              result={result} 
              isBusy={isBusy} 
              error={error} 
              showRunButton={showRunButton}
              onRunAnalysis={runAnalysis}
              canAnalyze={canAnalyze}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
