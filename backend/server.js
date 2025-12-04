const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies (for later monitor endpoints)
app.use(express.json());

/**
 * Serve static frontend files from ../public
 * So http://localhost:3000/ will load your index.html
 */
app.use(express.static(path.join(__dirname, "..", "public")));

/**
 * In-memory mock active calls.
 * Shape matches what your frontend already expects.
 */
const activeCalls = [
  {
    conversationId: "c-demo1",
    agentId: "agent-1",
    agentName: "Alice Johnson",
    agentExtension: "201",
    callerNumber: "+1 (555) 123-4567",
    direction: "Inbound",
    startedAt: Date.now() - 45_000, // 45s ago
    status: "ACTIVE",
    lastUpdated: Date.now() - 1_000
  },
  {
    conversationId: "c-demo2",
    agentId: "agent-2",
    agentName: "Brian Smith",
    agentExtension: "202",
    callerNumber: "+1 (555) 987-6543",
    direction: "Outbound",
    startedAt: Date.now() - 2 * 60_000, // 2min ago
    status: "ACTIVE",
    lastUpdated: Date.now() - 5_000
  }
];

/**
 * Simple health check:
 * GET /api/health
 */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

/**
 * Mock active-calls endpoint:
 * GET /api/active-calls
 *
 * Later: this will return real data built from GoTo events.
 */
app.get("/api/active-calls", (req, res) => {
  res.json(activeCalls);
});

/**
 * Mock monitor start endpoint:
 * POST /api/monitor/:conversationId
 *
 * Later: this will call GoTo Devices & Calls to start monitoring.
 */
app.post("/api/monitor/:conversationId", (req, res) => {
  const { conversationId } = req.params;

  // For now, just pretend we started monitoring.
  const mockMonitorCallId = "m-" + Math.random().toString(36).slice(2, 10);

  res.json({
    ok: true,
    conversationId,
    monitorCallId: mockMonitorCallId,
    message: "Monitor started (mock)"
  });
});

/**
 * Mock monitor stop endpoint:
 * POST /api/monitor/:conversationId/stop
 *
 * Later: this will hang up the monitor leg via GoTo.
 */
app.post("/api/monitor/:conversationId/stop", (req, res) => {
  const { conversationId } = req.params;

  res.json({
    ok: true,
    conversationId,
    message: "Monitor stopped (mock)"
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
