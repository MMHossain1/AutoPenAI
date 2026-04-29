interface StatCardProps {
  icon: string
  label: string
  value: string
  accentColor: 'green' | 'navy' | 'cyan'
}

function StatCard({ icon, label, value, accentColor }: StatCardProps) {
  const colorClass = {
    green: 'bg-accent-green/10 text-accent-green',
    navy: 'bg-navy/10 text-navy',
    cyan: 'bg-accent-cyan/10 text-accent-cyan'
  }[accentColor]

  return (
    <div className="glass-effect p-8 rounded-xl flex items-center gap-6">
      <div className={`h-12 w-12 rounded-full ${colorClass} flex items-center justify-center`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
}

export default function Stats() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon="check_circle"
          label="Systems Online"
          value="100% Uptime"
          accentColor="green"
        />
        <StatCard
          icon="security"
          label="Vulnerabilities Found"
          value="2.4M Detected"
          accentColor="navy"
        />
        <StatCard
          icon="data_exploration"
          label="Scans Completed"
          value="150k+ Secure"
          accentColor="cyan"
        />
      </div>
    </section>
  )
}
