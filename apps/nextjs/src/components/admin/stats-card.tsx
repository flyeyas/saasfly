import { cn } from "@saasfly/ui";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  className,
}: StatsCardProps) {
  return (
    <div className={cn("stat-card", className)}>
      <div className="stat-card-header">
        <div className="stat-card-content">
          <h3 className="stat-card-title">{title}</h3>
          <div className="stat-card-value">{value}</div>
          {change && (
            <div
              className={cn(
                "stat-card-change",
                changeType === "positive" && "positive",
                changeType === "negative" && "negative",
                changeType === "neutral" && "neutral"
              )}
            >
              {change}
            </div>
          )}
        </div>
        {icon && (
          <div className="stat-card-icon" style={{
            backgroundColor: changeType === 'positive' ? 'var(--success-100)' : changeType === 'negative' ? 'var(--error-100)' : 'var(--primary-100)',
            color: changeType === 'positive' ? 'var(--success-500)' : changeType === 'negative' ? 'var(--error-500)' : 'var(--primary-500)'
          }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}