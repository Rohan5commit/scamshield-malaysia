import { startTransition, useEffect, useState } from 'react';

import AnalysisWorkspace from '../components/AnalysisWorkspace.jsx';
import CommunityFeed from '../components/CommunityFeed.jsx';
import Header from '../components/Header.jsx';
import HeroSection from '../components/HeroSection.jsx';
import TrustSection from '../components/TrustSection.jsx';
import WhyMalaysiaSection from '../components/WhyMalaysiaSection.jsx';
import { analyzePayload, fetchReports, fetchSamples, submitCommunityReport } from '../lib/api.js';
import { useColorMode } from '../hooks/useColorMode.js';

const initialReportForm = {
  description: '',
  channel: 'whatsapp',
  locationHint: '',
  category: '',
  tags: ''
};

export default function HomePage() {
  const { theme, toggleTheme } = useColorMode();
  const [mode, setMode] = useState('text');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [samples, setSamples] = useState([]);
  const [result, setResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportForm, setReportForm] = useState(initialReportForm);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportMessage, setReportMessage] = useState('Search seeded reports or submit a sanitized pattern.');

  useEffect(() => {
    let cancelled = false;

    async function loadSamples() {
      try {
        const loaded = await fetchSamples();
        if (!cancelled) {
          setSamples(loaded);
        }
      } catch {
        if (!cancelled) {
          setSamples([]);
        }
      }
    }

    void loadSamples();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setReportsLoading(true);

    async function loadReports() {
      try {
        const loaded = await fetchReports(searchQuery.trim());
        if (!cancelled) {
          setReports(loaded);
        }
      } catch {
        if (!cancelled) {
          setReports([]);
        }
      } finally {
        if (!cancelled) {
          setReportsLoading(false);
        }
      }
    }

    void loadReports();

    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  async function handleAnalyze() {
    if (mode === 'image' && !file) {
      setAnalysisError('Upload a screenshot or load a demo asset before running image analysis.');
      return;
    }

    if (mode !== 'image' && !content.trim()) {
      setAnalysisError('Provide a message, URL, or phone number before running analysis.');
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError('');

    try {
      const analysis = await analyzePayload({
        mode,
        content,
        notes,
        file
      });

      setResult(analysis);
      setReportMessage('Analysis completed. You can convert the latest result into a privacy-safe community report.');
    } catch (error) {
      setAnalysisError(error.message);
    } finally {
      setAnalysisLoading(false);
    }
  }

  async function handleSubmitReport() {
    if (!reportForm.description.trim()) {
      setReportMessage('Add a privacy-safe description before submitting.');
      return;
    }

    setReportSubmitting(true);
    setReportMessage('Submitting privacy-safe community report…');

    try {
      await submitCommunityReport({
        description: reportForm.description,
        channel: reportForm.channel,
        locationHint: reportForm.locationHint || undefined,
        category: reportForm.category || undefined,
        tags: reportForm.tags
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      });

      const refreshed = await fetchReports(searchQuery.trim());
      setReports(refreshed);
      setReportForm(initialReportForm);
      setReportMessage('Community report submitted successfully.');
    } catch (error) {
      setReportMessage(error.message);
    } finally {
      setReportSubmitting(false);
    }
  }

  function useLatestAnalysis() {
    if (!result) {
      setReportMessage('Run an analysis first to generate a community-ready summary.');
      return;
    }

    startTransition(() => {
      setReportForm({
        description: result.communityDraft.summary,
        channel: mode === 'image' ? 'website' : mode,
        locationHint: '',
        category: result.category,
        tags: result.communityDraft.tags.join(', ')
      });
      setReportMessage('Latest analysis loaded into the report form. Review it before submitting.');
    });
  }

  return (
    <div className="pb-16">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <HeroSection />
      <AnalysisWorkspace
        mode={mode}
        setMode={setMode}
        content={content}
        setContent={setContent}
        notes={notes}
        setNotes={setNotes}
        file={file}
        setFile={setFile}
        onAnalyze={handleAnalyze}
        loading={analysisLoading}
        result={result}
        error={analysisError}
        samples={samples}
      />
      <CommunityFeed
        reports={reports}
        loading={reportsLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        reportForm={reportForm}
        setReportForm={setReportForm}
        onSubmitReport={handleSubmitReport}
        reportSubmitting={reportSubmitting}
        reportMessage={reportMessage}
        onUseLatestAnalysis={useLatestAnalysis}
      />
      <WhyMalaysiaSection />
      <TrustSection />
    </div>
  );
}

