interface FeatureCardProps {
  icon: string
  title: string
  description: string
  linkText?: string
  accentColor: 'navy' | 'cyan' | 'green'
}

function FeatureCard({ icon, title, description, linkText, accentColor }: FeatureCardProps) {
  const borderColor = {
    navy: 'hover:border-navy/50',
    cyan: 'hover:border-accent-cyan/50',
    green: 'hover:border-accent-green/50'
  }[accentColor]

  const bgColor = {
    navy: 'bg-navy/10 group-hover:bg-navy',
    cyan: 'bg-accent-cyan/10 group-hover:bg-accent-cyan',
    green: 'bg-accent-green/10 group-hover:bg-accent-green'
  }[accentColor]

  const textColor = {
    navy: 'text-navy group-hover:text-white',
    cyan: 'text-accent-cyan group-hover:text-background-dark',
    green: 'text-accent-green group-hover:text-background-dark'
  }[accentColor]

  const linkColor = {
    navy: 'text-navy',
    cyan: 'text-accent-cyan',
    green: 'text-accent-green'
  }[accentColor]

  return (
    <div className={`glass-effect group p-8 rounded-2xl ${borderColor} transition-all duration-300`}>
      <div className={`w-11 h-11 ${bgColor} rounded-xl flex items-center justify-center mb-5 ${textColor} transition-all`}>
        <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <h4 className="text-xl font-bold mb-3">{title}</h4>
      <p className="text-slate-400 leading-relaxed">{description}</p>
      {linkText ? (
        <div className="mt-8 pt-6 border-t border-white/5">
          <a href="#" className={`${linkColor} font-bold text-sm transition-colors hover:opacity-80`}>
            {linkText}
          </a>
        </div>
      ) : null}
    </div>
  )
}

export default function Features() {
  const features = [
    {
      icon: 'verified_user',
      title: 'Real-time Scanning',
      description: 'Crawls your entire site and probes every page for the most critical web vulnerabilities',

      accentColor: 'navy' as const
    },
    {
      icon: 'psychology',
      title: 'AI-Powered Reports',
      description: 'Get a plain-English executive summary for stakeholders or a full technical breakdown for developers. Both include severity ratings and actionable remediation steps.',

      accentColor: 'cyan' as const
    },
    {
      icon: 'description',
      title: 'Instant PDF Reports',
      description: 'Generate executive summaries and detailed technical remediation reports in seconds to share with stakeholders.',

      accentColor: 'green' as const
    }
  ]

  return (
    <section className="relative max-w-7xl mx-auto px-6 pt-10 pb-16">
      {/* Gradient fade-in at top for smooth transition from Hero */}
      <div className="absolute -top-32 inset-x-0 h-32 bg-gradient-to-b from-background-dark/0 to-transparent pointer-events-none"></div>
      <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
        <div className="max-w-2xl">
          <h2 className="text-navy text-lg font-bold uppercase tracking-[0.2em] mb-4">Core Capabilities</h2>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight">Advanced Security Suite for Modern Web Apps</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </section>
  )
}
