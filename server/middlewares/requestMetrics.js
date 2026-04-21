const metricsStore = {
  startedAt: new Date().toISOString(),
  totalRequests: 0,
  totalErrors: 0,
  byStatus: {},
  byRoute: {},
};

const requestMetrics = (req, res, next) => {
  const started = Date.now();
  metricsStore.totalRequests += 1;

  res.on("finish", () => {
    const routeKey = `${req.method} ${req.path}`;
    const status = String(res.statusCode);
    const durationMs = Date.now() - started;

    metricsStore.byStatus[status] = (metricsStore.byStatus[status] || 0) + 1;
    if (res.statusCode >= 400) metricsStore.totalErrors += 1;

    const route = metricsStore.byRoute[routeKey] || {
      hits: 0,
      errors: 0,
      avgDurationMs: 0,
    };

    route.hits += 1;
    if (res.statusCode >= 400) route.errors += 1;
    route.avgDurationMs = Math.round(
      ((route.avgDurationMs * (route.hits - 1)) + durationMs) / route.hits
    );
    metricsStore.byRoute[routeKey] = route;
  });

  next();
};

const getMetricsSnapshot = () => ({
  ...metricsStore,
  uptimeSeconds: Math.floor(process.uptime()),
});

module.exports = { requestMetrics, getMetricsSnapshot };
