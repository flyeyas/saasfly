interface ChartCardProps {
  title: string;
  data: {
    name: string;
    value: number;
  }[];
  className?: string;
}

export function ChartCard({ title, data, className }: ChartCardProps) {
  const maxValue = Math.max(...data.map(item => item.value));
  const trend = data.length > 1 ? data[data.length - 1]!.value - data[data.length - 2]!.value : 0;
  const trendPercentage = data.length > 1 && data[data.length - 2]!.value !== 0 ? ((trend / data[data.length - 2]!.value) * 100).toFixed(1) : '0';
  const trendIcon = trend > 0 ? '↗' : trend < 0 ? '↘' : '→';
  const trendColorClass = trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral';

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <div className={`stat-card-change ${trendColorClass}`} style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)'
        }}>
          <span>{trendIcon}</span>
          <span>{trend > 0 ? '+' : ''}{trendPercentage}%</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          return (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <span style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--gray-600)' 
              }}>{item.name}</span>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-2)' 
              }}>
                <div style={{
                  width: '80px',
                  height: '8px',
                  backgroundColor: 'var(--gray-200)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    backgroundColor: 'var(--primary-500)',
                    borderRadius: 'var(--radius-full)',
                    width: `${percentage}%`,
                    transition: 'width var(--duration-normal) var(--ease-out)'
                  }} />
                </div>
                <span style={{ 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: 'var(--font-medium)',
                  minWidth: '48px',
                  textAlign: 'right',
                  color: 'var(--gray-900)'
                }}>{item.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}