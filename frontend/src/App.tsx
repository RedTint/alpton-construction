import { useWizardStore } from './stores/wizardStore';
import { WizardFlow } from './components/features/wizard/WizardFlow';

function App() {
  const { setOpen } = useWizardStore();

  return (
    <div className="bg-surface font-body text-on-surface antialiased overflow-x-hidden">
      <WizardFlow />
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl flex justify-between items-center px-8 py-4 max-w-[1440px] left-1/2 -translate-x-1/2 no-line-rule tonal-shift-only">
        <div className="text-xl font-black tracking-tighter text-slate-900 font-headline uppercase truncate max-w-[50%] md:max-w-none">
          Alpton Construction
        </div>
        <div className="hidden md:flex items-center space-x-10">
          <a className="text-slate-900 border-b-2 border-slate-900 pb-1 font-headline tracking-[-0.02em] font-bold text-sm uppercase" href="#">Projects</a>
          <a className="text-slate-500 font-medium hover:text-slate-900 transition-colors font-headline tracking-[-0.02em] text-sm uppercase" href="#">Process</a>
          <a className="text-slate-500 font-medium hover:text-slate-900 transition-colors font-headline tracking-[-0.02em] text-sm uppercase" href="#">Services</a>
          <a className="text-slate-500 font-medium hover:text-slate-900 transition-colors font-headline tracking-[-0.02em] text-sm uppercase" href="#">About</a>
        </div>
        <button 
          onClick={() => setOpen(true)}
          className="hidden sm:block bg-primary text-on-primary structural-gradient px-6 py-2.5 rounded-sm font-headline font-bold text-xs tracking-wider uppercase scale-95 hover:scale-100 active:scale-95 transition-all cursor-pointer"
        >
          BUILD NOW, PAY LATER
        </button>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-[100svh] flex items-center pt-20 overflow-hidden bg-primary">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover opacity-60" 
            alt="Modern architectural masterpiece" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3gYWby2KexJ_WfTJiOfT25NH5QJgPojj7wzUNh9bgBcc-vQvPXvB5h7QEUfC5-lUicaCAj2_k3dl61EB1SkIENrop4UIqAWpAW64pcrGoVvke4k1-mGQCtYSLKiU7TGCJhc5DodYFkP3PC9kjsTfUva46ftkvPC4uVHCuZ1aahfIeI-OGAR8nzF1SRNMeiacTWqXPvFlOdBl3j-gxVw49xGZJHr7r629dy712132kfSNAnmE_cdLm7EZAWeOgM3Z_PvNiY8BdKh8"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/40 to-transparent"></div>
        </div>
        <div className="container mx-auto px-6 md:px-8 relative z-10">
          <div className="max-w-4xl">
            <span className="inline-block px-4 py-1.5 mb-6 bg-secondary text-on-secondary font-label text-[10px] tracking-[0.2em] uppercase font-bold rounded-sm shadow-lg">
              The Architectural Monolith
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-headline font-extrabold text-on-primary leading-[0.9] tracking-[-0.04em] mb-8 drop-shadow-lg">
              BUILD YOUR DREAM.<br/>
              <span className="text-on-primary-container">WORRY ABOUT COST LATER.</span>
            </h1>
            <p className="text-lg sm:text-xl text-on-primary/80 font-body max-w-xl mb-10 leading-relaxed drop-shadow-md">
              Structural integrity meets financial sophistication. Alpton Construction delivers bespoke architectural excellence with flexible capital solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <button 
                onClick={() => setOpen(true)}
                className="bg-secondary text-on-secondary px-8 py-5 rounded-sm font-headline font-bold text-sm tracking-widest uppercase hover:brightness-110 transition-all cursor-pointer shadow-xl text-center"
              >
                BUILD NOW, PAY LATER
              </button>
              <button className="border border-on-primary/20 text-on-primary px-8 py-5 rounded-sm font-headline font-bold text-sm tracking-widest uppercase hover:bg-on-primary/10 transition-all cursor-pointer architectural-blur text-center">
                View Portfolio
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-12 right-12 hidden lg:flex items-center gap-8 text-on-primary/40 font-label text-xs tracking-[0.3em] uppercase mix-blend-screen">
          <div className="flex flex-col items-end">
            <span>PROJECT ID</span>
            <span className="text-on-primary">ALP-2024-082</span>
          </div>
          <div className="h-12 w-[1px] bg-on-primary/20"></div>
          <div className="flex flex-col items-end">
            <span>LOCATION</span>
            <span className="text-on-primary">AUSTIN, TX</span>
          </div>
        </div>
      </header>

      {/* Portfolio Gallery */}
      <section className="py-24 sm:py-32 bg-surface">
        <div className="container mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-20 gap-8">
            <div>
              <span className="text-secondary font-label text-xs tracking-[0.2em] uppercase font-bold mb-4 block">Selected Works</span>
              <h2 className="text-4xl sm:text-5xl font-headline font-extrabold text-primary tracking-[-0.02em]">The Portfolio</h2>
            </div>
            <p className="max-w-md text-on-surface-variant font-body leading-relaxed">
              A curated selection of our most prestigious residential projects, where form and function exist in perfect geometric harmony.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 relative group overflow-hidden bg-surface-container-low cursor-pointer rounded-sm shadow-sm hover:shadow-xl transition-all duration-500">
              <img className="w-full aspect-[4/3] sm:aspect-[16/9] object-cover transition-transform duration-700 group-hover:scale-105" alt="Ultra-modern white villa" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpx8iTGO-nU6aA8_x0IPU3H87Ay5dDHBmGLYb4O8uqtvBBvLTQLYaZzPHp9RI5SjPLBaMYle_4OK_wAE0NDmVQufGBXNReysjgheG8fFx4BQ9_DiFNsUjamgUtlT4JMaBlvFcAy36ZP_f00Sxf1ReyaMXgnyswl8QIaS1pJKX6CDms4ae3pzA2mvPIYH66hylGenfnXSBZk-UWcFge0ij9QEAIezt5PAMCjEiZ0JDC1lrB62nUKPtfdHI-8krIaXxp5Fo7IRIaRDQ" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-6 right-6 architectural-blur bg-surface/20 px-4 py-2 rounded-sm text-on-primary/60 font-label text-[10px] tracking-widest uppercase z-10">
                Alpton Monogram • 2024
              </div>
              <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 md:translate-y-4 md:group-hover:translate-y-0 z-10">
                <h3 className="text-on-primary font-headline text-2xl font-bold">The Obsidian House</h3>
                <p className="text-on-primary/70 font-label text-xs tracking-widest uppercase mt-2">Austin, Texas</p>
              </div>
            </div>
            <div className="md:col-span-4 relative group overflow-hidden bg-surface-container-low cursor-pointer rounded-sm shadow-sm hover:shadow-xl transition-all duration-500">
              <img className="w-full aspect-square md:aspect-auto md:h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Interior living room" src="https://lh3.googleusercontent.com/aida-public/AB6AXuADxslsFFEjyz2x-Eq6zd1X6_Gox_lOaAILPItegWzth4zLOFAGfri0RNp8xHvZe4B7GKksHbfMXfmoy2gLBJfXdLiql55afZS8Erwl0Yz4UWd7jvZpDMOyURCQlSfKqAaOoVfsdGnIV3OyFQFXKqxnBqBO3rR58enhqg5vX7E2_M7JhpV4vApLRuIOODnuniVx-681cLs7_SnAgcDJ7D5NkcAUyoyUEjcZZmVhBrfw-76yzLEcXKHPYZYQGO9LzbxonNLH4QlKPvI" />
              <div className="absolute bottom-6 right-6 architectural-blur bg-surface/20 px-4 py-2 rounded-sm text-on-primary/60 font-label text-[10px] tracking-widest uppercase z-10">
                Alpton Monogram • 2023
              </div>
            </div>
            <div className="md:col-span-4 relative group overflow-hidden bg-surface-container-low cursor-pointer rounded-sm shadow-sm hover:shadow-xl transition-all duration-500">
              <img className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105" alt="Facade details" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFKuNuchOHUrypno6mFpQHCwJe_BmyjNE_-bF7zhPEDxo1GutfWLFVJR7Q9JwPcf3O2s5J9zpAwkMLt2xJW7Z1hU1bcYGm19XRs1H1GVlcT1dNuwvyV15qA61VqXGhAmLvD1TD5XdfcX0N_ouKNbtzMs5VPg9WrNkEuv62Mvy1DB1dAkog4mZaMFUl5pBg4CXWpzjW_p1qQtZNT-9sZN84NLrDpmtTL2eycMlDxLNYmkr1bzaGkYju5_wsYRbax2wxQJfHSS53SkE" />
              <div className="absolute bottom-4 right-4 architectural-blur bg-surface/20 px-3 py-1.5 rounded-sm text-on-primary/60 font-label text-[8px] tracking-widest uppercase z-10">
                Alpton Monogram • 2024
              </div>
            </div>
            <div className="md:col-span-4 relative group overflow-hidden bg-surface-container-low cursor-pointer rounded-sm shadow-sm hover:shadow-xl transition-all duration-500">
              <img className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105" alt="Beachfront estate" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdLG_FFt0-LYaRwNf3knORcNHXvq7l-gTlPuXhwzau0Y2JHpUoR7yCoD0AxDiigw-FPJyFXav11RKDkz88rfNCQfScPMLzQWYpn-oopczIFWIFaA6T_hSTWqFQuyPLxi2tzraRddTmiGPao2rkjgQ5S6kKoLWQkNyaTohA2HQM71V3jXX_jOYMPXa_jmHR8UDWy903gW1LNpi0TfMxrkvj2uphpN5maS2mVwFcdr1QPRoQZ6vGuWVej-D__hjgvhnshn1zD5iMql0" />
              <div className="absolute bottom-4 right-4 architectural-blur bg-surface/20 px-3 py-1.5 rounded-sm text-on-primary/60 font-label text-[8px] tracking-widest uppercase z-10">
                Alpton Monogram • 2022
              </div>
            </div>
            <div className="md:col-span-4 relative group overflow-hidden bg-surface-container-low cursor-pointer rounded-sm shadow-sm hover:shadow-xl transition-all duration-500">
              <img className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105" alt="Modern kitchen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhMcJJWegfEoZ43ZF-NO4162STndy19RNKgH1uzYefqfOiW0UQNtF1T2AGXKivoAzBaQWNinhGYEGgzM0pevCysGY57RXTmyIHqsMU9oXyB4GCCVj4q-9nyWRYtE0PhqkXMcD4pWNlG1AEvlvOAKUANr4fF-kBez4GRi7mvnhFfOO6XHM1Y2Bq2MNC919zB9Xfut7KPe-9BEr58cmW018SF60M6n0K0yCj16IGXUBn4lVrqCipkV5Y17VYoa2Z3J7u-zc_w93TR4U" />
              <div className="absolute bottom-4 right-4 architectural-blur bg-surface/20 px-3 py-1.5 rounded-sm text-on-primary/60 font-label text-[8px] tracking-widest uppercase z-10">
                Alpton Monogram • 2024
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 sm:py-32 bg-surface-container-low">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-2xl mb-16 sm:mb-24">
            <span className="text-secondary font-label text-xs tracking-[0.2em] uppercase font-bold mb-4 block">Expertise</span>
            <h2 className="text-4xl sm:text-5xl font-headline font-extrabold text-primary tracking-[-0.02em] mb-8">Architectural Services</h2>
            <p className="text-on-surface-variant font-body text-lg leading-relaxed">
              We transcend standard contracting by integrating finance, design, and structural engineering into a single monolithic experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="flex flex-col space-y-8 p-8 sm:p-10 bg-surface-container-lowest border-l-4 border-secondary shadow-[0_20px_40px_rgba(25,28,29,0.04)] rounded-r-sm hover:-translate-y-2 transition-transform duration-300">
              <span className="material-symbols-outlined text-4xl text-primary">architecture</span>
              <h3 className="text-2xl font-headline font-bold text-primary">Conceptual Design</h3>
              <p className="text-on-surface-variant font-body leading-relaxed flex-grow">
                Translating your vision into precise geometric blueprints that push the boundaries of modern residential architecture.
              </p>
              <a className="group flex items-center gap-2 font-label text-xs font-bold tracking-widest uppercase text-primary mt-auto" href="#">
                Learn More <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </a>
            </div>
            <div className="flex flex-col space-y-8 p-8 sm:p-10 bg-surface-container-lowest rounded-sm hover:-translate-y-2 transition-transform duration-300 shadow-sm">
              <span className="material-symbols-outlined text-4xl text-primary">foundation</span>
              <h3 className="text-2xl font-headline font-bold text-primary">Structural Build</h3>
              <p className="text-on-surface-variant font-body leading-relaxed flex-grow">
                Precision-engineered construction utilizing high-grade slate, oak, and steel for a home built to last generations.
              </p>
              <a className="group flex items-center gap-2 font-label text-xs font-bold tracking-widest uppercase text-primary mt-auto" href="#">
                Learn More <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </a>
            </div>
            <div className="flex flex-col space-y-8 p-8 sm:p-10 bg-surface-container-lowest rounded-sm hover:-translate-y-2 transition-transform duration-300 shadow-sm">
              <span className="material-symbols-outlined text-4xl text-primary">payments</span>
              <h3 className="text-2xl font-headline font-bold text-primary">Deferred Capital</h3>
              <p className="text-on-surface-variant font-body leading-relaxed flex-grow">
                Our signature financial model allowing you to begin construction now with flexible payment structures aligned to project phases.
              </p>
              <a className="group flex items-center gap-2 font-label text-xs font-bold tracking-widest uppercase text-primary mt-auto" href="#">
                Learn More <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Company Profile Section */}
      <section className="py-24 sm:py-32 bg-surface overflow-hidden">
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div className="relative order-2 lg:order-1 mt-10 lg:mt-0">
              <div className="absolute -top-6 -left-6 sm:-top-10 sm:-left-10 w-48 h-48 sm:w-64 sm:h-64 bg-surface-container-high -z-10 rounded-sm"></div>
              <img className="w-full aspect-[4/5] object-cover relative z-10 rounded-sm shadow-xl" alt="Architect" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDE8gHhOIUAp89cbGZJXEAneltcQ5lZZtXcH8ijSTb-8dX6NSwxbSo2crH4Uez_m0gXta__4fruA-2MCxit1jpiWgi2agEH4Seiy310lXuvj0HJBSJqGEszQzqkrrLoG7tdcbVzyJJpXkPgH6mqxCwlvfGiwOg4h-AgGcYA7x0xR8B-_iHsQdkF0KOCYrtzUbZLmRwDY2YbLNvvSt8cV2dUdRKN1kSV5v2wmzu72hWfa_e_USzzghmQLzGVG4Gh9tLAy9RXetXm-jg" />
              <div className="absolute -bottom-6 -right-6 sm:bottom-10 sm:-right-10 w-40 h-40 sm:w-48 sm:h-48 structural-gradient flex items-center justify-center p-6 sm:p-8 z-20 rounded-sm shadow-[0_20px_40px_rgba(25,28,29,0.15)]">
                <p className="text-on-primary font-headline font-black text-3xl sm:text-4xl tracking-tighter leading-none text-center drop-shadow-sm">
                  25+<br/><span className="text-[10px] sm:text-sm font-label tracking-widest uppercase font-medium mt-2 block">Years of<br/>Integrity</span>
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-secondary font-label text-xs tracking-[0.2em] uppercase font-bold mb-4 block">Company Profile</span>
              <h2 className="text-4xl sm:text-5xl font-headline font-extrabold text-primary tracking-[-0.02em] mb-8 leading-tight">Structural Integrity<br/>through Sophistication.</h2>
              <div className="space-y-6 text-on-surface-variant font-body text-base sm:text-lg leading-relaxed">
                <p>
                  Founded in 1999, Alpton Construction was born from a singular vision: to treat the building process with the same level of intellectual rigor as the design phase.
                </p>
                <p>
                  We don't just build houses; we manufacture sanctuaries. Our team of in-house architects, financial analysts, and master craftsmen work in unison to eliminate the friction typically associated with custom builds.
                </p>
                <div className="pt-8 grid grid-cols-2 gap-6 sm:gap-8 border-t border-surface-container-high mt-10">
                  <div>
                    <h4 className="font-headline font-bold text-primary text-lg sm:text-xl mb-2">Precision</h4>
                    <p className="text-sm">Meticulous attention to every structural joint and finish.</p>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-primary text-lg sm:text-xl mb-2">Innovation</h4>
                    <p className="text-sm">Integrating the latest sustainable building technologies.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 sm:py-24 bg-primary structural-gradient text-on-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="container mx-auto px-6 md:px-8 text-center max-w-4xl relative z-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-headline font-extrabold tracking-tight mb-8">Ready to define your legacy?</h2>
          <p className="text-lg sm:text-xl text-on-primary/60 mb-10 sm:mb-12">Start your journey today with our Build Now, Pay Later program.</p>
          <button 
            onClick={() => setOpen(true)}
            className="bg-secondary text-on-secondary w-full sm:w-auto px-10 sm:px-12 py-5 rounded-sm font-headline font-bold text-sm tracking-[0.2em] uppercase hover:scale-105 transition-transform active:scale-95 cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:brightness-110"
          >
            Request a Consultation
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full mt-auto bg-surface-container-low tonal-shift">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 px-8 lg:px-12 py-16 border-t border-surface-container-high">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="font-headline font-extrabold text-primary mb-6 uppercase tracking-tighter text-xl">Alpton Construction</div>
            <p className="text-on-surface-variant font-body text-xs leading-loose lg:pr-8 max-w-sm">
              High-end architectural construction for those who demand structural excellence and financial flexibility.
            </p>
          </div>
          <div className="col-span-1">
            <h4 className="font-label text-xs tracking-wide uppercase font-semibold text-primary mb-6">Explore</h4>
            <ul className="space-y-4">
              <li><a className="text-on-surface-variant font-label text-xs tracking-wide uppercase font-bold hover:text-primary transition-colors" href="#">Contact Us</a></li>
              <li><a className="text-on-surface-variant font-label text-xs tracking-wide uppercase font-bold hover:text-primary transition-colors" href="#">Company Profile</a></li>
            </ul>
          </div>
          <div className="col-span-1">
            <h4 className="font-label text-xs tracking-wide uppercase font-semibold text-primary mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a className="text-on-surface-variant font-label text-xs tracking-wide uppercase font-bold hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="text-on-surface-variant font-label text-xs tracking-wide uppercase font-bold hover:text-primary transition-colors" href="#">Terms of Service</a></li>
            </ul>
          </div>
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h4 className="font-label text-xs tracking-wide uppercase font-semibold text-primary mb-6">Newsletter</h4>
            <div className="flex rounded-sm overflow-hidden shadow-sm max-w-sm">
              <input className="bg-surface-container-highest border-none text-[10px] sm:text-xs tracking-widest uppercase p-4 w-full focus:outline-none focus:ring-1 focus:ring-secondary text-primary" placeholder="EMAIL ADDRESS" type="email" />
              <button className="bg-primary p-4 text-on-primary hover:bg-primary-container transition-colors cursor-pointer flex items-center justify-center w-12"><span className="material-symbols-outlined text-sm">arrow_forward</span></button>
            </div>
          </div>
        </div>
        <div className="px-8 lg:px-12 py-8 border-t border-surface-container-high flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-on-surface-variant font-label text-[10px] tracking-wide uppercase font-semibold text-center sm:text-left">
            © 2026 Alpton Construction. Structural Integrity through Sophistication.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
