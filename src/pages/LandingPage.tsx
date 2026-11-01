import { Link } from 'react-router-dom';
import {
  Leaf,
  Droplets,
  Bell,
  Calendar,
  Heart,
  BookOpen,
  BarChart3,
  Sprout,
  Sun,
  CloudRain,
  ArrowRight,
  CheckCircle2,
  Star,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const FEATURES = [
  {
    icon: Droplets,
    title: 'Smart Watering Reminders',
    description: 'Never let a thirsty plant down. Get personalized watering reminders based on each plant\'s unique needs.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Leaf,
    title: 'Personalized Plant Care',
    description: 'Custom care schedules tailored to each plant\'s requirements — from succulents to tropical beauties.',
    color: 'bg-mint text-primary',
  },
  {
    icon: Sprout,
    title: 'Fertilizing Schedules',
    description: 'Keep your plants nourished with timely fertilizing reminders for healthy, vibrant growth.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Heart,
    title: 'Plant Health Tracking',
    description: 'Log health observations, symptoms, and photos. Track your plant\'s recovery and progress.',
    color: 'bg-red-50 text-error',
  },
  {
    icon: BookOpen,
    title: 'Growth Journal',
    description: 'Document your plant\'s growth with photos, height measurements, and observations over time.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: BarChart3,
    title: 'Garden Analytics',
    description: 'Visualize your care history, completion rates, and plant trends with beautiful charts.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: Sun,
    title: 'Plant Identification Support',
    description: 'Browse our library of 20+ plants with detailed care guides to identify and understand your plants.',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    icon: CloudRain,
    title: 'Weather-Aware Suggestions',
    description: 'Get care suggestions based on weather conditions when configured with a location service.',
    color: 'bg-cyan-50 text-cyan-600',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Add Your Plants',
    description: 'Add your plants to PlantPal. Search our library of 20+ plant profiles or create a custom plant entry.',
    icon: Leaf,
  },
  {
    step: '02',
    title: 'Customize Their Care Schedules',
    description: 'Set up personalized watering, fertilizing, misting, and other care schedules that fit your routine.',
    icon: Calendar,
  },
  {
    step: '03',
    title: 'Receive Reminders & Track Growth',
    description: 'Get timely reminders, mark tasks complete, and watch your plants thrive with regular care.',
    icon: Bell,
  },
];

const PREVIEW_PLANTS = [
  {
    name: 'Monstera',
    scientific: 'Monstera deliciosa',
    difficulty: 'Easy',
    light: 'Bright indirect',
    water: 'Weekly',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&auto=format&fit=crop',
    badge: 'Popular',
  },
  {
    name: 'Snake Plant',
    scientific: 'Dracaena trifasciata',
    difficulty: 'Easy',
    light: 'Low to bright',
    water: 'Every 2-6 weeks',
    image: 'https://images.unsplash.com/photo-1593691509543-c55fb32e33f5?w=400&auto=format&fit=crop',
    badge: 'Beginner-friendly',
  },
  {
    name: 'Peace Lily',
    scientific: 'Spathiphyllum wallisii',
    difficulty: 'Easy',
    light: 'Low to medium',
    water: 'Weekly',
    image: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=400&auto=format&fit=crop',
    badge: 'Air purifier',
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-primary-50 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-primary">PlantPal</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted hover:text-primary transition-colors">How It Works</a>
            <a href="#library" className="text-sm text-muted hover:text-primary transition-colors">Plant Library</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-primary hover:text-primary-600 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary btn">
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-mint transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5 text-primary" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-50 space-y-2">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm text-muted hover:text-primary hover:bg-mint rounded-lg transition-colors">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm text-muted hover:text-primary hover:bg-mint rounded-lg transition-colors">How It Works</a>
            <a href="#library" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm text-muted hover:text-primary hover:bg-mint rounded-lg transition-colors">Plant Library</a>
            <div className="flex gap-3 px-4 pt-2">
              <Link to="/login" className="btn-outline btn flex-1 justify-center" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn-primary btn flex-1 justify-center" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cream via-white to-mint overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-mint border border-primary-100 rounded-full text-sm text-primary font-medium mb-6">
                <Leaf className="w-4 h-4" />
                Smart Plant Care App
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-darkText leading-tight mb-6">
                Your Plants Deserve the{' '}
                <span className="gradient-text">Best Care.</span>
              </h1>
              <p className="text-lg text-muted leading-relaxed mb-8 max-w-lg">
                Never forget to water, feed, or care for your plants again. Organize your garden, receive timely reminders, and watch your plants thrive.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/register" className="btn-primary btn btn-lg">
                  Start My Garden
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#features" className="btn-outline btn btn-lg">
                  Explore Features
                </a>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-12">
                {[
                  { value: '20+', label: 'Plant Profiles' },
                  { value: '100%', label: 'Free to Use' },
                  { value: '∞', label: 'Plants to Track' },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-bold text-primary">{value}</p>
                    <p className="text-sm text-muted">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — hero image */}
            <div className="relative lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop"
                  alt="Beautiful indoor plants arranged in a cozy home setting"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />

                {/* Floating card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Droplets className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-darkText">Watering Reminder</p>
                      <p className="text-xs text-muted">Your Monstera is due today</p>
                    </div>
                    <div className="ml-auto">
                      <span className="badge badge-green">Due today</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-mint rounded-2xl flex items-center justify-center shadow-card">
                <span className="text-3xl">🌿</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-darkText mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Care for Your Plants</span>
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              PlantPal combines smart reminders, care tracking, and plant knowledge to help your garden flourish.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="card p-6 hover:shadow-card-hover transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} transition-transform group-hover:scale-110`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-darkText mb-2 text-base">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-darkText mb-4">
              Get Started in <span className="gradient-text">3 Simple Steps</span>
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              From adding your first plant to receiving your first reminder — it takes minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, description, icon: Icon }, index) => (
              <div key={step} className="relative">
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary-200 to-transparent z-0" style={{ width: 'calc(100% - 2rem)' }} />
                )}
                <div className="relative z-10 card p-8 text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-glow">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-secondary text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {step.replace('0', '')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-darkText mb-3">{title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plant Library Preview */}
      <section id="library" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-darkText mb-4">
              Explore Our <span className="gradient-text">Plant Library</span>
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              20+ detailed plant profiles with care guides to help you understand and grow any plant.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {PREVIEW_PLANTS.map((plant) => (
              <div key={plant.name} className="card-hover group">
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={plant.image}
                    alt={plant.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="badge badge-green">{plant.badge}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-darkText">{plant.name}</h3>
                  <p className="text-sm text-muted italic mb-3">{plant.scientific}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted flex items-center gap-1"><Star className="w-3 h-3" /> Difficulty</span>
                      <span className="font-medium text-primary">{plant.difficulty}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted flex items-center gap-1"><Sun className="w-3 h-3" /> Light</span>
                      <span className="font-medium text-darkText">{plant.light}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted flex items-center gap-1"><Droplets className="w-3 h-3" /> Water</span>
                      <span className="font-medium text-darkText">{plant.water}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/register" className="btn-outline btn btn-lg">
              Explore Full Library
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="text-5xl mb-6">🌱</div>
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Ready to Grow Your Green Space?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Join thousands of plant lovers who use PlantPal to keep their gardens thriving. It's free to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-2xl hover:bg-cream transition-all duration-200 text-lg shadow-lg hover:shadow-xl active:scale-95"
            >
              Create Your Free Garden
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/40 text-white font-medium rounded-2xl hover:bg-white/10 transition-all duration-200 text-lg"
            >
              Sign In
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-white/70">
            {['No credit card required', 'Free forever', '100% private & secure'].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary-light" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-darkText text-white/70 py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-lg">PlantPal</span>
              </div>
              <p className="text-sm leading-relaxed">Grow Happier. One Reminder at a Time.</p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#library" className="hover:text-white transition-colors">Plant Library</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link to="/forgot-password" className="hover:text-white transition-colors">Reset Password</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 text-center text-sm">
            <p>© {new Date().getFullYear()} PlantPal. Made with 🌿 for plant lovers everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
