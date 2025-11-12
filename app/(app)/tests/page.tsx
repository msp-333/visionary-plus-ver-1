'use client';

import React, { Suspense, useEffect, useMemo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { TestsStepper } from '../../../components/TestsStepper';
import { StickyActions } from '../../../components/StickyActions';
import { CalibrationAccordion } from '../../../components/CalibrationAccordion';
import { TestsCatalog } from '../../../components/TestsCatalog';
import { ResultsList } from '../../../components/ResultsList';
import { useSessionStorageState } from '../../../components/utils/storage';
import { Eye, TestId, TestMeta, TestResult, TESTS } from './types';
import BackButton from '../../../components/BackButton';
import { ChevronRight } from 'lucide-react';

const LazyTestHost = dynamic(() => import('../../../components/TestHost'), { ssr: false });

const CARD =
  'relative overflow-visible rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-soft';

enum Step {
  Calibration = 0,
  Select = 1,
  Run = 2,
  Results = 3,
}

export default function TestsPage() {
  // Persisted calibration & defaults
  const [pxPerMM, setPxPerMM] = useSessionStorageState<number | null>('visionary:pxPerMM', null);
  const [distanceCm] = useSessionStorageState<number>('visionary:distanceCm', 40);
  const [eye] = useSessionStorageState<Eye>('visionary:eye', 'OU');

  // Results & active test
  const [results, setResults] = useSessionStorageState<TestResult[]>('visionary:results', []);
  const [active, setActive] = useState<TestId>('acuity-near');

  // Flow
  const initialStep = pxPerMM ? Step.Select : Step.Calibration;
  const [step, setStep] = useState<Step>(initialStep);
  useEffect(() => {
    if (!pxPerMM) setStep(Step.Calibration);
  }, [pxPerMM]);

  // Condensed header on scroll
  const [condensed, setCondensed] = useState(false);
  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Filters
  const [category, setCategory] = useState<string | 'all'>('all');
  const [search, setSearch] = useState('');

  // Runtime
  const [isPaused, setIsPaused] = useState(false);
  const meta = TESTS.find((t) => t.id === active)!;

  // Filtered tests
  const filtered: TestMeta[] = useMemo(
    () =>
      TESTS.filter(
        (t) =>
          (category === 'all' || t.category === category) &&
          (search.trim() === '' || t.label.toLowerCase().includes(search.toLowerCase())),
      ),
    [category, search],
  );

  // Save results
  const save = (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => {
    const m = TESTS.find((t) => t.id === r.id)!;
    setResults((prev) => [
      { ...r, label: m.label, category: m.category, eye, distanceCm, timestamp: Date.now() },
      ...prev,
    ]);
    setIsPaused(false);
    setStep(Step.Results);
  };

  // Navigation helpers (Back jumps to Select when on Results)
  const onStartTest = (id: TestId) => {
    setActive(id);
    setStep(Step.Run);
    setIsPaused(false);
  };

  const onBack = useCallback(() => {
    setStep((s) => {
      if (s === Step.Results) return Step.Select; // "Go back to tests"
      return s > Step.Calibration ? (s - 1) as Step : s;
    });
  }, []);

  const onContinue = useCallback(() => {
    if (step === Step.Calibration) return setStep(Step.Select);
    if (step === Step.Select && meta) return setStep(Step.Run);
    if (step === Step.Run) return setStep(Step.Results);
    if (step === Step.Results) return setStep(Step.Select);
  }, [step, meta]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== Step.Calibration) {
        e.preventDefault();
        onBack();
      } else if (e.key === 'Enter' && step !== Step.Run) {
        onContinue();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [step, onBack, onContinue]);

  const steps = ['Calibration', 'Select Test', 'Run Test', 'Results'];

  return (
    <main
      className="
        min-h-[100svh] w-full text-slate-100
        pb-[calc(env(safe-area-inset-bottom)+84px)]
        bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(101,146,225,0.25),transparent),#000914]
      "
    >
      {/* Sticky header (single stepper, no extra progress bar) */}
      <header
        className={
          'sticky top-0 z-30 border-b border-white/5 backdrop-blur ' +
          (condensed ? 'bg-[#0b1324]/65' : 'bg-transparent')
        }
        role="banner"
        aria-label="Tests header"
      >
        <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <BackButton
                onClick={onBack}
                disabled={step === Step.Calibration}
                className="rounded-xl px-3 py-2 text-sm text-white/85 ring-1 ring-white/15 hover:bg-white/10"
                label={step === Step.Results ? 'Go back to tests' : 'Back'}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-manrope font-extrabold tracking-tight text-2xl md:text-[28px] leading-tight">
                    Tests
                  </h1>
                  <ChevronRight className="hidden sm:block h-4 w-4 text-white/40" aria-hidden />
                  <span className="hidden sm:block text-sm text-white/70">
                    Step {step + 1} of {steps.length}: {steps[step]}
                  </span>
                </div>
                {!condensed && (
                  <p className="mt-1 text-sm text-slate-300">
                    Quick, guided screening. You can pause any time and review results after.
                  </p>
                )}
              </div>
            </div>

            {/* Calibration status */}
            <div
              className={
                'hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ring-1 ' +
                (pxPerMM
                  ? 'bg-emerald-400/10 text-emerald-200 ring-emerald-300/30'
                  : 'bg-amber-400/10 text-amber-200 ring-amber-300/30')
              }
              aria-live="polite"
            >
              <span
                className={'inline-block h-2 w-2 rounded-full ' + (pxPerMM ? 'bg-emerald-400' : 'bg-amber-400')}
                aria-hidden
              />
              {pxPerMM ? 'Calibrated' : 'Calibration needed'}
            </div>
          </div>

          {/* Single progress element: the stepper */}
          <TestsStepper steps={steps} current={step} className="mt-4" />
        </div>
      </header>

      <div className="sr-only" aria-live="polite">
        Step changed to {steps[step]}
      </div>

      {/* Content */}
      <section role="region" aria-label={steps[step]} className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* A) Calibration */}
        {step === Step.Calibration && (
          <div className={`${CARD} p-4 md:p-5`}>
            <div className="pointer-events-none absolute inset-x-0 -top-px h-[2px] rounded-t-2xl bg-gradient-to-r from-[#6592E1]/70 via-transparent to-[#81B1E6]/70" />
            <CalibrationAccordion pxPerMM={pxPerMM} setPxPerMM={setPxPerMM} onDone={() => setStep(Step.Select)} />
          </div>
        )}

        {/* B) Select Test */}
        {step === Step.Select && (
          <div className={`${CARD} p-4 md:p-5 z-10`}>
            <div className="pointer-events-none absolute inset-x-0 -top-px h-[2px] rounded-t-2xl bg-gradient-to-r from-[#6592E1]/70 via-transparent to-[#81B1E6]/70" />
            <div className="relative z-20">
              <TestsCatalog
                tests={filtered}
                activeId={active}
                onPick={onStartTest}
                search={search}
                onSearch={setSearch}
                category={category as any}
                onCategoryChange={setCategory as any}
              />
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Defaults: <b>{distanceCm} cm</b>, <b>{eye}</b>. (Adjust inside tests where available.)
            </p>
          </div>
        )}

        {/* C) Run Test */}
        {step === Step.Run && (
          <Suspense fallback={<div className="grid place-items-center py-16 text-slate-300">Loading test…</div>}>
            <div className="relative z-10 min-h-[360px]">
              <LazyTestHost
                id={active}
                pxPerMM={pxPerMM}
                distanceCm={distanceCm}
                eye={eye}
                onResult={save}
                paused={isPaused}
              />
            </div>
          </Suspense>
        )}

        {/* D) Results */}
        {step === Step.Results && (
          <div className={`${CARD} p-4 md:p-5 z-10`}>
            <div className="pointer-events-none absolute inset-x-0 -top-px h-[2px] rounded-t-2xl bg-gradient-to-r from-[#6592E1]/70 via-transparent to-[#81B1E6]/70" />
            <ResultsList results={results} onClear={() => setResults([])} />
          </div>
        )}
      </section>

      {/* Sticky bottom actions */}
      <div className="fixed inset-x-0 bottom-0 z-40 ring-1 ring-white/10 backdrop-blur supports-[backdrop-filter]:bg-[#0b1324]/70">
        <StickyActions
          variant={step === Step.Run ? 'run' : 'setup'}
          backLabel={
            step === Step.Calibration ? undefined : step === Step.Results ? 'Go back to tests' : 'Back'
          }
          primaryLabel={
            step === Step.Run ? (isPaused ? 'Resume' : 'Pause') : step === Step.Results ? 'New Test' : 'Continue'
          }
          onBack={step === Step.Calibration ? undefined : onBack}
          onPrimary={() => {
            if (step === Step.Run) setIsPaused((p) => !p);
            else if (step === Step.Results) setStep(Step.Select);
            else onContinue();
          }}
          extraAction={
            step === Step.Run && meta?.id?.includes('acuity')
              ? {
                  label: 'Save Result',
                  onClick: () => {
                    window.dispatchEvent(new CustomEvent('visionary:save-active-test'));
                  },
                }
              : undefined
          }
        />
      </div>
    </main>
  );
}
