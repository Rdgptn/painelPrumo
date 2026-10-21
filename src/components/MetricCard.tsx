import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  context: string;
  icon: LucideIcon;
  tone: 'navy' | 'green' | 'rose' | 'slate';
  featured?: boolean;
}

export function MetricCard({
  label,
  value,
  context,
  icon: Icon,
  tone,
  featured = false,
}: MetricCardProps) {
  return (
    <article className={`metric-card ${featured ? 'metric-card-featured' : ''}`}>
      <div className="metric-topline">
        <span className="metric-label">{label}</span>
        <span className={`metric-icon metric-icon-${tone}`} aria-hidden="true">
          <Icon size={17} strokeWidth={1.8} />
        </span>
      </div>
      <strong className="metric-value">{value}</strong>
      <span className="metric-context">{context}</span>
    </article>
  );
}
