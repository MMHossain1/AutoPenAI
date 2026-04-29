import Header from '@/components/landing/Header'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import Footer from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-950 dark:text-white transition-colors duration-300">
      <Header />
      <main className="pt-16">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  )
}
