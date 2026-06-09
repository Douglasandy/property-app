"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import {
  buildExportPayload,
  buildImportTestSummary,
  parseUrlLines,
  runImportTestForUrl,
  type ImportTestResult,
} from "@/lib/dev/import-test-utils";
import { cn } from "@/lib/utils";

export function ImportTestPanel() {
  const [urlInput, setUrlInput] = useState("");
  const [results, setResults] = useState<ImportTestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const summary = useMemo(
    () => (results.length > 0 ? buildImportTestSummary(results) : null),
    [results]
  );

  async function handleRunTest() {
    const urls = parseUrlLines(urlInput);
    if (urls.length === 0) return;

    setRunning(true);
    setResults([]);
    setProgress({ current: 0, total: urls.length });

    const collected: ImportTestResult[] = [];

    for (let index = 0; index < urls.length; index++) {
      setProgress({ current: index + 1, total: urls.length });
      const result = await runImportTestForUrl(urls[index]);
      collected.push(result);
      setResults([...collected]);
    }

    setRunning(false);
  }

  function handleExportJson() {
    if (!summary || results.length === 0) return;

    const payload = buildExportPayload(results, summary);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `propertypal-import-test-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5 pb-8">
      <header className="space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">
            Developer QA
          </p>
          <h1 className="text-xl font-bold text-navy">PropertyPal import test</h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Paste real PropertyPal listing URLs to check parser extraction
            quality. Calls the live import API — not the mock parser.
          </p>
        </div>
      </header>

      <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
        <label htmlFor="import-test-urls" className="text-sm font-medium text-navy">
          PropertyPal URLs (one per line)
        </label>
        <textarea
          id="import-test-urls"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          disabled={running}
          rows={6}
          placeholder={
            "https://www.propertypal.com/agency-name/address-slug/123456\nhttps://www.propertypal.com/..."
          }
          className="mt-2 w-full resize-y rounded-xl border border-input bg-white px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={handleRunTest}
            disabled={running || !urlInput.trim()}
            className="h-11 flex-1 rounded-xl bg-primary font-semibold"
          >
            {running ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Testing {progress.current} of {progress.total}…
              </>
            ) : (
              "Run import test"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleExportJson}
            disabled={running || results.length === 0}
            className="h-11 rounded-xl sm:w-auto"
          >
            <Download className="size-4" />
            Export JSON
          </Button>
        </div>
      </section>

      {summary && (
        <section className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
          <h2 className="text-sm font-semibold text-navy">Summary</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Total tested" value={String(summary.totalTested)} />
            <Metric
              label="Successful"
              value={String(summary.successfulImports)}
              tone="success"
            />
            <Metric
              label="Failed"
              value={String(summary.failedImports)}
              tone={summary.failedImports > 0 ? "danger" : undefined}
            />
            <Metric
              label="Avg confidence"
              value={
                summary.averageConfidence !== null
                  ? `${summary.averageConfidence}%`
                  : "—"
              }
            />
          </dl>

          {summary.fieldsMostOftenMissing.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-violet-900">
                Fields most often missing
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {summary.fieldsMostOftenMissing.map(({ field, count }) => (
                  <li
                    key={field}
                    className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-violet-900 ring-1 ring-violet-200"
                  >
                    {field} · {count}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {results.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-navy">Results</h2>
          {results.map((result) => (
            <ResultCard key={`${result.url}-${result.testedAt}`} result={result} />
          ))}
        </section>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "danger";
}) {
  return (
    <div className="rounded-xl bg-white/80 px-3 py-2.5 ring-1 ring-violet-100">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 text-lg font-bold tabular-nums",
          tone === "success" && "text-emerald-700",
          tone === "danger" && "text-destructive",
          !tone && "text-navy"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function ResultCard({ result }: { result: ImportTestResult }) {
  const isSuccess = result.status === "success";

  return (
    <article className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isSuccess ? (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="size-4 shrink-0 text-destructive" />
            )}
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                isSuccess ? "text-emerald-700" : "text-destructive"
              )}
            >
              {isSuccess ? "Success" : "Failed"}
            </span>
            {result.httpStatus > 0 && (
              <span className="text-xs text-muted-foreground">
                HTTP {result.httpStatus}
              </span>
            )}
          </div>
          <p className="mt-2 break-all text-xs text-muted-foreground">{result.url}</p>
        </div>
        {result.confidenceScore !== undefined && result.confidenceScore > 0 && (
          <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-navy">
            {result.confidenceScore}%
          </span>
        )}
      </div>

      {(result.errorMessage || result.errorCode) && (
        <div className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-800">
          {result.errorCode && (
            <p className="font-semibold">{result.errorCode}</p>
          )}
          {result.errorMessage && <p className="mt-0.5">{result.errorMessage}</p>}
        </div>
      )}

      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <Field label="Parser used" value={result.parserUsed} />
        <Field label="Listing ID" value={result.listingId} />
        <Field label="Address" value={result.address} />
        <Field label="Postcode" value={result.postcode} />
        <Field
          label="Asking price"
          value={
            result.askingPrice && result.askingPrice > 0
              ? formatCurrency(result.askingPrice)
              : undefined
          }
        />
        <Field
          label="Bedrooms"
          value={
            result.bedrooms && result.bedrooms > 0
              ? String(result.bedrooms)
              : undefined
          }
        />
        <Field
          label="Bathrooms"
          value={
            result.bathrooms && result.bathrooms > 0
              ? String(result.bathrooms)
              : undefined
          }
        />
        <Field label="Property type" value={result.propertyType} />
        <Field label="Image found" value={result.imageFound ? "Yes" : "No"} />
        <Field label="Agent name" value={result.agentName} />
        <Field
          label="Missing fields"
          value={
            result.missingFields.length > 0
              ? result.missingFields.join(", ")
              : "None"
          }
        />
      </dl>
    </article>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg bg-secondary/40 px-3 py-2">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words font-medium text-navy">{value ?? "—"}</dd>
    </div>
  );
}
