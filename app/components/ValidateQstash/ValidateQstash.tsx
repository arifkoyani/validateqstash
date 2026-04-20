"use client";

import { useState, useRef } from "react";

// const PDF_API_KEY = "ehsan@quohr.com_AZQ0sClJfl5idlJOfd7lg4bJGPmxa48dUDBcONw3PVIVjd77XFnwZ52qd3GrHwYR";
const PDF_URL = "https://pdfco-test-files.s3.us-west-2.amazonaws.com/pdf-to-csv/sample.pdf";

interface RequestResult {
  index: number;
  success: boolean;
  duration: number;
  jobId?: string;
  state?: "queued" | "done" | "failed" | "not_found";
  data?: { url: string; name: string; status: number; remainingCredits: number };
  error?: string;
}

async function waitForResult(jobId: string) {
  const MAX_TRIES = 90;
  let tries = 0;

  while (tries < MAX_TRIES) {
    const res = await fetch(`/api/pdftoqrcode/status?jobId=${encodeURIComponent(jobId)}`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 404) {
        return { status: "not_found" as const, data };
      }
      return { status: "failed" as const, data: { message: data?.message || `HTTP ${res.status}` } };
    }

    if (data?.status === "done") {
      return { status: "done" as const, data };
    }

    if (data?.status === "failed") {
      return { status: "failed" as const, data };
    }

    await new Promise((r) => setTimeout(r, 1000));
    tries++;
  }

  return { status: "failed" as const, data: { message: "Timeout waiting for job result" } };
}

async function sendBarcodeRequest(index: number): Promise<RequestResult> {
  const start = Date.now();
  try {
    const res = await fetch("/api/pdftoqrcode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "qrcode.png",
        type: "QRCode",
        value: PDF_URL,
        inline: false,
        async: false,
        profiles: JSON.stringify({
          Angle: 0,
          NarrowBarWidth: 30,
          ForeColor: "#000000",
          BackColor: "#ffffff",
        }),
      }),
    });

    const duration = Date.now() - start;
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        index,
        success: false,
        duration,
        state: "failed",
        error: `HTTP ${res.status}: ${json?.message || "Unknown error"}`,
      };
    }

    if (!json?.queued || !json?.jobId) {
      return {
        index,
        success: false,
        duration,
        state: "failed",
        error: `Invalid enqueue response: ${JSON.stringify(json)}`,
      };
    }

    const jobId = json.jobId as string;
    const polled = await waitForResult(jobId);

    if (polled.status === "done" && polled.data?.data?.url) {
      const doneData = polled.data.data;
      return {
        index,
        success: true,
        duration: Date.now() - start,
        jobId,
        state: "done",
        data: {
          url: doneData.url,
          name: doneData.name || "qrcode.png",
          status: doneData.status || 200,
          remainingCredits: doneData.remainingCredits || 0,
        },
      };
    }

    return {
      index,
      success: false,
      duration: Date.now() - start,
      jobId,
      state: polled.status,
      error: polled.data?.message || "Job failed or not found",
    };
  } catch (e: unknown) {
    return {
      index,
      success: false,
      duration: Date.now() - start,
      state: "failed",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

function runBatched(
  totalRequests: number,
  perSecond: number,
  onResult: (r: RequestResult) => void,
  onDone: () => void
) {
  let sent = 0;
  let completed = 0;
  let currentIndex = 0;

  function sendBatch() {
    if (sent >= totalRequests) return;
    const batch = Math.min(perSecond, totalRequests - sent);
    for (let i = 0; i < batch; i++) {
      const idx = currentIndex++;
      sendBarcodeRequest(idx).then((r) => {
        onResult(r);
        completed++;
        if (completed >= totalRequests) onDone();
      });
    }
    sent += batch;
    if (sent < totalRequests) {
      setTimeout(sendBatch, 1000);
    }
  }

  sendBatch();
}

export default function RateLimiterPage() {
  const [totalRequests, setTotalRequests] = useState(25);
  const [perSecond, setPerSecond] = useState(5);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<RequestResult[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;
  const progress = totalRequests > 0 ? (results.length / totalRequests) * 100 : 0;

  function runTest() {
    setResults([]);
    setRunning(true);
    runBatched(
      totalRequests,
      perSecond,
      (r) => {
        setResults((prev) => [...prev, r].sort((a, b) => a.index - b.index));
        setTimeout(() => {
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        }, 50);
      },
      () => setRunning(false)
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      color: "#e2e8f0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0f0f1a; }
        ::-webkit-scrollbar-thumb { background: #252540; border-radius: 3px; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input:focus { outline: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slide-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scanline { 0% { transform: translateY(-10px); } 100% { transform: translateY(100vh); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        .result-row { animation: slide-in 0.18s ease forwards; }
        .fire-btn { transition: all 0.15s; cursor: pointer; }
        .fire-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.15); box-shadow: 0 6px 24px rgba(99,252,170,0.25); }
        .fire-btn:active:not(:disabled) { transform: translateY(0); }
        .fire-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .num-input { transition: border-color 0.15s; }
        .num-input:focus { border-color: #63fcaa !important; }
      `}</style>

      {/* Grid background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(99,252,170,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(99,252,170,0.025) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* Scanline */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 120,
        background: "linear-gradient(transparent, rgba(99,252,170,0.04), transparent)",
        animation: "scanline 8s linear infinite",
        pointerEvents: "none", zIndex: 1,
      }} />

      <div style={{ width: "100%", maxWidth: 800, padding: "48px 20px 80px", position: "relative", zIndex: 2 }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 8,
              background: "linear-gradient(135deg, #63fcaa 0%, #00cfff 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 700, color: "#050510",
              boxShadow: running ? "0 0 0 0 rgba(99,252,170,0.5)" : "none",
              animation: running ? "pulse-shadow 1.2s infinite" : "none",
            }}>⬡</div>
            <div>
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px",
              }}>
                BARCODE API RATE TESTER
              </h1>
              <p style={{ fontSize: 11, color: "#3d4f6b", letterSpacing: "0.08em", marginTop: 2 }}>
                pdf.co · /v1/barcode/generate · DataMatrix
              </p>
            </div>
          </div>
        </div>

        {/* ── Config card ── */}
        <div style={{
          background: "#0d0d1a", border: "1px solid #1a1a2e",
          borderRadius: 14, padding: 28, marginBottom: 20,
        }}>
          <div style={{ fontSize: 10, color: "#63fcaa", letterSpacing: "0.2em", fontWeight: 700, marginBottom: 22 }}>
            ▸ TEST CONFIGURATION
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 16, alignItems: "end" }}>

            <div>
              <label style={{ display: "block", fontSize: 10, color: "#3d4f6b", letterSpacing: "0.12em", marginBottom: 8 }}>
                TOTAL REQUESTS
              </label>
              <input
                type="number"
                min={1} max={500}
                value={totalRequests}
                disabled={running}
                onChange={(e) => setTotalRequests(Math.max(1, Math.min(500, Number(e.target.value))))}
                className="num-input"
                style={{
                  width: "100%", padding: "12px 16px",
                  background: "#080813", border: "1px solid #1a1a2e",
                  borderRadius: 8, color: "#f1f5f9",
                  fontFamily: "inherit", fontSize: 22, fontWeight: 700,
                }}
              />
              <div style={{ fontSize: 10, color: "#252540", marginTop: 5 }}>max 500</div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 10, color: "#3d4f6b", letterSpacing: "0.12em", marginBottom: 8 }}>
                REQUESTS / SECOND
              </label>
              <input
                type="number"
                min={1} max={100}
                value={perSecond}
                disabled={running}
                onChange={(e) => setPerSecond(Math.max(1, Math.min(100, Number(e.target.value))))}
                className="num-input"
                style={{
                  width: "100%", padding: "12px 16px",
                  background: "#080813", border: "1px solid #1a1a2e",
                  borderRadius: 8, color: "#f1f5f9",
                  fontFamily: "inherit", fontSize: 22, fontWeight: 700,
                }}
              />
              <div style={{ fontSize: 10, color: "#252540", marginTop: 5 }}>max 100/s</div>
            </div>

            <button
              className="fire-btn"
              onClick={runTest}
              disabled={running}
              style={{
                height: 52, padding: "0 28px",
                background: running
                  ? "linear-gradient(135deg, #0a2218, #0a1c2e)"
                  : "linear-gradient(135deg, #0f3322, #0f2233)",
                border: `1px solid ${running ? "#174030" : "#1e5040"}`,
                borderRadius: 8,
                color: running ? "#4ade80" : "#63fcaa",
                fontFamily: "inherit", fontSize: 12, fontWeight: 700,
                letterSpacing: "0.1em",
                display: "flex", alignItems: "center", gap: 9,
                whiteSpace: "nowrap",
              }}
            >
              {running ? (
                <>
                  <span style={{
                    width: 13, height: 13, borderRadius: "50%",
                    border: "2px solid #4ade80", borderTopColor: "transparent",
                    animation: "spin 0.7s linear infinite", display: "inline-block",
                  }} />
                  RUNNING
                </>
              ) : (
                <>▶ FIRE TEST</>
              )}
            </button>
          </div>

          {/* Summary line */}
          <div style={{
            marginTop: 18, paddingTop: 16, borderTop: "1px solid #12121f",
            fontSize: 11, color: "#252540", display: "flex", gap: 6, flexWrap: "wrap",
          }}>
            <span>Will send</span>
            <span style={{ color: "#63fcaa" }}>{totalRequests} requests</span>
            <span>at</span>
            <span style={{ color: "#63fcaa" }}>{perSecond}/sec</span>
            <span>· estimated</span>
            <span style={{ color: "#63fcaa" }}>{Math.ceil(totalRequests / perSecond)}s</span>
            <span>total</span>
          </div>
        </div>

        {/* ── Stats ── */}
        {results.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", gap: 12, marginBottom: 16 }}>
            {[
              { label: "COMPLETED", value: `${results.length}/${totalRequests}`, color: "#94a3b8" },
              { label: "SUCCESS", value: successCount, color: "#4ade80" },
              { label: "FAILED", value: failCount, color: "#f87171" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 10, padding: "14px 16px",
              }}>
                <div style={{ fontSize: 9, color: "#2e3d55", letterSpacing: "0.15em", marginBottom: 5 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color, fontFamily: "'Syne', sans-serif" }}>{value}</div>
              </div>
            ))}

            {/* Progress */}
            <div style={{
              background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 10, padding: "14px 16px",
              display: "flex", flexDirection: "column", justifyContent: "center",
            }}>
              <div style={{ fontSize: 9, color: "#2e3d55", letterSpacing: "0.15em", marginBottom: 8 }}>PROGRESS</div>
              <div style={{ background: "#111125", borderRadius: 4, height: 5 }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  background: "linear-gradient(90deg, #63fcaa, #00cfff)",
                  width: `${progress}%`,
                  transition: "width 0.25s ease",
                }} />
              </div>
              <div style={{ fontSize: 10, color: "#2e3d55", marginTop: 5 }}>
                {Math.round(progress)}%
              </div>
            </div>
          </div>
        )}

        {/* ── Results log ── */}
        {results.length > 0 && (
          <div style={{
            background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 14, overflow: "hidden",
          }}>
            <div style={{
              padding: "11px 18px", borderBottom: "1px solid #12121f",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 10, color: "#63fcaa", letterSpacing: "0.18em", fontWeight: 700 }}>
                ▸ RESULTS LOG
              </span>
              <span style={{ fontSize: 10, color: "#252540", display: "flex", alignItems: "center", gap: 6 }}>
                {running && (
                  <span style={{
                    width: 6, height: 6, background: "#63fcaa", borderRadius: "50%",
                    display: "inline-block", animation: "blink 1s infinite",
                  }} />
                )}
                {running ? "LIVE" : "COMPLETE"}
              </span>
            </div>

            <div ref={scrollRef} style={{ maxHeight: 460, overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 5 }}>
              {results.map((r) => (
                <div
                  key={r.index}
                  className="result-row"
                  style={{
                    borderRadius: 7, padding: "9px 13px",
                    background: r.success ? "rgba(74,222,128,0.03)" : "rgba(248,113,113,0.03)",
                    border: `1px solid ${r.success ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)"}`,
                    fontSize: 11,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 10,
                        color: r.success ? "#4ade80" : "#f87171",
                        background: r.success ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
                        padding: "2px 7px", borderRadius: 4,
                      }}>
                        #{String(r.index + 1).padStart(3, "0")}
                      </span>
                      <span style={{ color: r.success ? "#4ade80" : "#f87171", fontWeight: 600 }}>
                        {r.success ? "✓ SUCCESS" : "✗ FAILED"}
                      </span>
                    </div>
                    <span style={{ color: "#334155", fontSize: 10 }}>{r.duration}ms</span>
                  </div>

                  {r.success && r.data && (
                    <div style={{ marginTop: 6, color: "#334155", lineHeight: 1.7 }}>
                      <div>
                        <span style={{ color: "#1e2d40" }}>job </span>{r.jobId || "—"}
                        <span style={{ color: "#1e2d40", marginLeft: 14 }}>state </span>{r.state || "done"}
                      </div>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <span style={{ color: "#1e2d40" }}>url </span>
                        <span style={{ color: "#3d8a5e" }}>{r.data.url || "—"}</span>
                      </div>
                      <div>
                        <span style={{ color: "#1e2d40" }}>name </span>{r.data.name}
                        <span style={{ color: "#1e2d40", marginLeft: 14 }}>status </span>{r.data.status}
                        <span style={{ color: "#1e2d40", marginLeft: 14 }}>credits </span>{r.data.remainingCredits}
                      </div>
                    </div>
                  )}

                  {!r.success && (
                    <div style={{ marginTop: 5, color: "#f87171", opacity: 0.75, lineHeight: 1.5 }}>
                      <div style={{ marginBottom: 3 }}>
                        job {r.jobId || "—"} · state {r.state || "failed"}
                      </div>
                      {r.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {results.length === 0 && !running && (
          <div style={{
            background: "#0d0d1a", border: "1px dashed #1a1a2e",
            borderRadius: 14, padding: "56px 24px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 14, color: "#1a1a2e",
          }}>
            <div style={{ fontSize: 36 }}>⬡</div>
            <div style={{ fontSize: 11, letterSpacing: "0.2em" }}>NO RESULTS — CONFIGURE AND FIRE A TEST</div>
          </div>
        )}
      </div>
    </div>
  );
}
