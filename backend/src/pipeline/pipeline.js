// src/pipeline/pipeline.js
// ─────────────────────────────────────────────────────────────────────────────
// DUAL STREAMING PIPELINE COORDINATOR  ← THE HEART OF THE PROJECT
//
// This is where the two output streams are fired in PARALLEL using
// Promise.allSettled(). This guarantees:
//   ✅ DB write and WebSocket broadcast happen SIMULTANEOUSLY (no sequential delay)
//   ✅ Failure of one stream does NOT block or kill the other
//   ✅ Each settled promise is logged independently
//
// Data Flow:
//
//   CoinGecko API
//       │
//       ▼ (raw data array)
//   apiClient.onData()
//       │
//       ▼ (processData)
//   dataProcessor
//       │
//       ├──────────────────┬─────────────────────┐
//       ▼                  ▼                      │
//   streamToDB()       streamToWS()               │
//   (MySQL INSERT)     (Socket.io emit)            │
//       │                  │                      │
//       └──── Promise.allSettled() ───────────────┘
//                  (both run in parallel)
// ─────────────────────────────────────────────────────────────────────────────

const apiClient = require('../ingestion/apiClient');
const { processData } = require('../processing/dataProcessor');
const { streamToDB } = require('../streaming/dbStream');
const { streamToWS } = require('../streaming/wsStream');

/**
 * Start the dual streaming pipeline.
 * Wires up: API → Process → [DB ‖ WebSocket] simultaneously.
 */
function startPipeline() {
    console.log('⚡ Dual Streaming Pipeline starting...');

    // Register the onData callback — this fires every time the API returns data
    apiClient.onData(async (rawData) => {
        // ── STEP 1: DATA PREPARATION ────────────────────────────────────────────
        // Clean, transform, and enrich raw API data
        const cleanData = processData(rawData);

        if (cleanData.length === 0) {
            console.warn('⚠️  Pipeline: No valid records after processing, skipping cycle');
            return;
        }

        // ── STEP 2: DUAL STREAMING (PARALLEL) ───────────────────────────────────
        // Fire BOTH outputs simultaneously — neither waits for the other
        const [dbResult, wsResult] = await Promise.allSettled([
            streamToDB(cleanData),    // Output 1: MySQL database
            streamToWS(cleanData),    // Output 2: WebSocket broadcast
        ]);

        // ── STEP 3: LOG RESULTS ──────────────────────────────────────────────────
        if (dbResult.status === 'rejected') {
            console.error('❌ Pipeline [DB]:  Stream failed —', dbResult.reason?.message);
        } else {
            console.log('✅ Pipeline [DB]:  Stream completed');
        }

        if (wsResult.status === 'rejected') {
            console.error('❌ Pipeline [WS]:  Stream failed —', wsResult.reason?.message);
        } else {
            console.log('✅ Pipeline [WS]:  Stream completed');
        }

        console.log('─'.repeat(60));
    });

    // Begin the API polling loop
    apiClient.start();
}

/**
 * Stop the pipeline gracefully (e.g., on SIGTERM / server shutdown).
 */
function stopPipeline() {
    apiClient.stop();
    console.log('🛑 Pipeline stopped gracefully');
}

module.exports = { startPipeline, stopPipeline };
