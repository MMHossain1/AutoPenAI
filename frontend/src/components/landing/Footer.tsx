export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/5 bg-white/70 dark:bg-background-dark/50 pt-12 pb-12 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6">
        {/* Footer Grid */}
        <div className="flex justify-center gap-40 pb-12">
          {/* Platform Links */}
          <div>
            <h5 className="text-slate-900 dark:text-white font-bold mb-6 text-xl">Platform</h5>
            <ul className="space-y-3 text-slate-500 dark:text-slate-500 text-sm">
              <li>
                <a href="#" className="hover:text-navy transition-colors">
                  Vulnerability Scanning
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-navy transition-colors">
                  Asset Mapping
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-navy transition-colors">
                  Compliance Audit
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-navy transition-colors">
                  Integrations
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h5 className="text-slate-900 dark:text-white font-bold mb-6 text-xl">Resources</h5>
            <ul className="space-y-3 text-slate-500 dark:text-slate-500 text-sm">
              <li>
                <a href="#" className="hover:text-navy transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-navy transition-colors">
                  Security Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-navy transition-colors">
                  Vulnerability DB
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-navy transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h5 className="text-slate-900 dark:text-white font-bold mb-6 text-xl">Company</h5>
            <ul className="space-y-3 text-slate-500 dark:text-slate-500 text-sm">
              <li>
                <a href="#" className="hover:text-navy transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-navy transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-navy transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-navy transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-slate-200 dark:border-white/5 pt-10 flex items-center justify-center">
          <p className="text-slate-600 dark:text-slate-600 text-sm text-center">© 2026 AutopenAI Security. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
