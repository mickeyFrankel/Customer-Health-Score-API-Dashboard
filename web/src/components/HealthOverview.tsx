import './HealthOverview.css';

type HealthOverviewProps = {
  health: {
    status: 'ok' | 'degraded';
    uptimeSeconds: number;
    region: string;
    timestamp: string;
    dbStatus: 'ok' | 'degraded';
  };
};

const STATUS_COPY: Record<'ok' | 'degraded', string> = {
  ok: 'Operational',
  degraded: 'Degraded',
};

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}h ${minutes}m ${remainingSeconds}s`;
}

export function HealthOverview({ health }: HealthOverviewProps) {
  const lastUpdated = new Date(health.timestamp).toLocaleString();

  return (
    <section className={`health-overview health-overview--${health.status}`}>
      <header>
        <h1>Customer Health</h1>
        <p className="health-overview__status" role="status">
          Platform status: <strong>{STATUS_COPY[health.status]}</strong>
        </p>
      </header>

      <dl className="health-overview__grid">
        <div>
          <dt>Uptime</dt>
          <dd>{formatDuration(health.uptimeSeconds)}</dd>
        </div>
        <div>
          <dt>Primary region</dt>
          <dd>{health.region}</dd>
        </div>
        <div>
          <dt>Database</dt>
          <dd>{STATUS_COPY[health.dbStatus]}</dd>
        </div>
        <div>
          <dt>Last update</dt>
          <dd>{lastUpdated}</dd>
        </div>
      </dl>
    </section>
  );
}
