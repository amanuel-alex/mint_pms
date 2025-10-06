"use client";
import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import {footerPages} from "@/lib/footerPages";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"


import { Button } from "@/components/ui/button";
import { 
  ArrowRight,
  CheckCircle2, 
  Users, 
  Shield, 
  Zap, 
  BarChart3, 
  Calendar,
  FileText,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  X,
  Eye,
  Search,
  Filter,
  TrendingUp,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Mail
} from "lucide-react";

// Data for dynamic content
const initialStats = [
  { label: "Active Projects", value: 0, suffix: "+" },
  { label: "Team Members", value: 0, suffix: "+" },
  { label: "Success Rate", value: 0, suffix: "%" },
  { label: "Client Satisfaction", value: 4.9, suffix: "/5" }
];

const featuresData = [
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Bring your team together with real-time collaboration tools and seamless communication.",
      details: "Our Team Collaboration feature brings your people together no matter where they are. " +
          "Work on projects in real time with shared documents, task boards," +
          " and integrated chat. Brainstorm ideas using digital whiteboards and" +
          " track progress transparently. Notifications and reminders ensure " +
          "deadlines are never missed. Role-based permissions let you control " +
          "access while keeping sensitive work secure. " +
          "Seamless integration with email and calendar tools reduces context switching." +
          " Collaboration history is saved automatically so nothing gets lost. By centralizing communication and workflows, your team stays aligned, productive, and motivated."
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with advanced encryption and regular backups.",
      details: "Security is at the core of our platform, giving your team confidence that data is always protected. We use enterprise-grade encryption for data in transit and at rest, ensuring sensitive information remains private. Regular automated backups safeguard your projects against accidental loss or system failures. Access is controlled with multi-factor authentication and role-based permissions. Continuous monitoring detects threats in real time, while compliance with industry standards keeps your organization audit-ready. Our infrastructure is built on reliable cloud architecture with minimal downtime. Disaster recovery protocols guarantee resilience even in worst-case scenarios. With security and reliability handled, your team can focus fully on innovation and growth."

  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance ensures your team stays productive without delays.",
      details: "Our platform is engineered for speed, so your team never loses momentum waiting for tools to load. Every interaction is optimized for instant responsiveness, from opening dashboards to collaborating in real time. Advanced caching and performance tuning reduce delays, even under heavy workloads. Cloud-based scaling ensures the system adapts smoothly as your team grows. Optimized code paths keep workflows efficient and prevent bottlenecks. Background tasks are processed asynchronously so you can keep working without interruptions. Updates and deployments run seamlessly with minimal downtime. With lightning-fast performance at its core, your team can stay productive, focused, and ahead of schedule."

  }
];

const testimonialsData = [
  {
    initials: "SJ",
    quote: "MinT has transformed how we manage our projects. The interface is intuitive and the features are exactly what we needed.",
    name: "Sarah Johnson",
    role: "Project Manager, TechCorp",
    company: "TechCorp",
    success: "40% increase in project delivery speed"
  },
  {
    initials: "MC",
    quote: "The best project management tool we've used. It's helped us increase our team's productivity by 40%.",
    name: "Michael Chen",
    role: "CTO, InnovateX",
    company: "InnovateX",
    success: "60% reduction in project delays"
  },
  {
    initials: "AL",
    quote: "Outstanding platform that has revolutionized our project delivery timeline and team coordination.",
    name: "Amanda Lee",
    role: "Senior Director, GlobalTech",
    company: "GlobalTech",
    success: "95% client satisfaction rate"
  },
  {
    initials: "RK",
    quote: "MinT's examination features have given us unprecedented visibility into project health and risks.",
    name: "Robert Kim",
    role: "Program Director, FutureSystems",
    company: "FutureSystems",
    success: "50% faster risk identification"
  }
];

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [statsData, setStatsData] = useState(initialStats);
  const [animatedStats, setAnimatedStats] = useState(initialStats.map(() => 0));
  const [isVisible, setIsVisible] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showDemo, setShowDemo] = useState(false);
    const [openIndex, setOpenIndex] = useState<number | null>(null)
  const statsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const fullText = "Experience";

  // Typing effect for hero section
  useEffect(() => {
    if (typingIndex < fullText.length && isTyping) {
      const timeout = setTimeout(() => {
        setTypingText(fullText.slice(0, typingIndex + 1));
        setTypingIndex(typingIndex + 1);
      }, 150);
      return () => clearTimeout(timeout);
    } else if (typingIndex === fullText.length) {
      setTimeout(() => setIsTyping(false), 2000);
    }
  }, [typingIndex, isTyping]);

  // Animated counters
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          animateCounters();
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Fetch dynamic stats for the homepage
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [adminRes, teamRes] = await Promise.all([
          fetch('/api/admin/stats', { cache: 'no-store' }),
          fetch('/api/team-members', { cache: 'no-store' })
        ]);
        const adminData = adminRes.ok ? await adminRes.json() : null;
        const teamData = teamRes.ok ? await teamRes.json() : [];

        const totalProjects = adminData?.totalProjects || 0;
        const activeProjects = adminData?.projectCounts?.ACTIVE || 0;
        const completedProjects = adminData?.projectCounts?.COMPLETED || 0;
        const teamMembers = Array.isArray(teamData) ? teamData.length : 0;

        const successRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

        const updated = [
          { label: 'Active Projects', value: activeProjects, suffix: '+' },
          { label: 'Team Members', value: teamMembers, suffix: '+' },
          { label: 'Success Rate', value: successRate, suffix: '%' },
          { label: 'Client Satisfaction', value: 4.9, suffix: '/5' }
        ];
        setStatsData(updated);

        // If the stats are already visible, re-run the animation to new targets
        if (isVisible) {
          animateCounters();
        }
      } catch (e) {
        // Ignore errors and keep initial stats
      }
    };
    fetchStats();
  }, [isVisible]);

  const animateCounters = () => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setAnimatedStats(statsData.map((stat, index) => {
        const targetValue = stat.value;
        const currentValue = Math.floor(targetValue * progress);
        return currentValue;
      }));

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedStats(statsData.map(stat => stat.value));
      }
    }, stepDuration);
  };

  // Auto-playing testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonialsData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonialsData.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => 
      prev === 0 ? testimonialsData.length - 1 : prev - 1
    );
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  return (
    <>
      <Head>
        <title>Ministry Project Management System</title>
        <meta
          name="description"
          content="Official project tracking system for the Ministry of Innovation and Technology"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        {/* Gradient overlays - left and right sides */}
        <div className="absolute left-0 top-0 w-96 h-full bg-gradient-to-r from-purple-500/20 to-transparent blur-3xl"></div>
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-blue-500/20 to-transparent blur-3xl"></div>
        
        {/* Creative side elements - left side */}
        <div className="absolute left-0 top-1/4 w-32 h-32 bg-gradient-to-r from-purple-500/30 to-transparent rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute left-0 top-1/2 w-24 h-24 bg-gradient-to-r from-pink-500/25 to-transparent rounded-full blur-xl animate-bounce"></div>
        <div className="absolute left-0 bottom-1/3 w-20 h-20 bg-gradient-to-r from-indigo-500/20 to-transparent rounded-full blur-lg animate-pulse"></div>
        
        {/* Creative side elements - right side */}
        <div className="absolute right-0 top-1/3 w-28 h-28 bg-gradient-to-l from-blue-500/30 to-transparent rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute right-0 top-2/3 w-32 h-32 bg-gradient-to-l from-cyan-500/25 to-transparent rounded-full blur-xl animate-pulse"></div>
        <div className="absolute right-0 bottom-1/4 w-24 h-24 bg-gradient-to-l from-teal-500/20 to-transparent rounded-full blur-lg animate-bounce"></div>
        
        {/* Floating creative elements - left side */}
        <div className="absolute left-10 top-1/4 w-4 h-4 bg-purple-500/40 rounded-full animate-ping"></div>
        <div className="absolute left-20 top-1/2 w-3 h-3 bg-pink-500/30 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        <div className="absolute left-16 bottom-1/3 w-2 h-2 bg-indigo-500/50 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
        
        {/* Floating creative elements - right side */}
        <div className="absolute right-12 top-1/3 w-3 h-3 bg-blue-500/40 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute right-8 top-2/3 w-4 h-4 bg-cyan-500/30 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute right-20 bottom-1/4 w-2 h-2 bg-teal-500/50 rounded-full animate-ping" style={{animationDelay: '2.5s'}}></div>
        
        {/* Content wrapper */}
        <div className="relative z-10">
        {/* Header */}
          <header className="bg-[#087684] shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-2">
                <img
                  src="/logo.png"
                  alt="MinT"
                    className="w-10 h-10 rounded-lg object-contain animate-pulse"
                />
                <h1 className="text-2xl font-bold text-white">PMS</h1>
                </div>
              <nav className="flex items-center space-x-6">
                <Link 
                href="/login"
                    className="px-4 py-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all duration-300 font-medium hover:scale-105"
              >
                access system
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="text-center" ref={heroRef}>
              <div className="inline-block bg-gradient-to-r from-[#087684]/10 to-[#087684]/5 text-[#087684] px-6 py-3 rounded-full text-sm font-semibold mb-8 animate-bounce shadow-sm border border-[#087684]/20">
              Ministry of Innovation and Technology
            </div>
              <div className="mb-8">
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
                  <span className="block">Transform Your</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#087684] to-[#065a66]">
                    Project Management
                  </span>
                  <span className="block text-gray-800">
                    {typingText}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </span>
            </h1>
              </div>
              <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
                Streamline your workflow, enhance collaboration, and deliver projects with 
                <span className="text-[#087684] font-semibold"> precision</span> using our comprehensive management platform.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-[#087684] to-[#065a66] hover:from-[#065a66] hover:to-[#087684] text-white px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                    Get Started
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-2 border-[#087684] text-[#087684] bg-white hover:bg-gradient-to-r hover:from-[#087684] hover:to-[#065a66] hover:text-white px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  onClick={() => setShowDemo(true)}
                >
                  Watch Demo
                </Button>
              </div>
          </div>

          {/* Stats Section */}
            <div ref={statsRef} className="mt-15 grid grid-cols-2 md:grid-cols-4 gap-6">
              {statsData.map((stat, index) => (
                <div 
                  key={index} 
                  className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
                >
                  <p className="text-4xl font-bold text-[#087684] mb-2 group-hover:text-[#065a66] transition-colors duration-300">
                    {isVisible ? animatedStats[index] : 0}{stat.suffix}
                  </p>
                  <p className="text-gray-600 font-medium group-hover:text-gray-800 transition-colors duration-300">{stat.label}</p>
                </div>
              ))}
            </div>

          {/* Features Section */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-center mb-16">
              Everything You Need to <span className="text-[#087684]">Succeed</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuresData.map((feature, index) => (
                  <div 
                    key={index}
                    className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#087684]/30 group cursor-pointer transform hover:-translate-y-2"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-[#087684]/10 to-[#065a66]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-[#087684] group-hover:to-[#065a66] transition-all duration-300 group-hover:scale-110">
                      <feature.icon className="h-8 w-8 text-[#087684] group-hover:text-white transition-all duration-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 group-hover:text-[#087684] transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                      <Dialog open={openIndex === index} onOpenChange={(isOpen) => setOpenIndex(isOpen ? index : null)}>
                          <DialogTrigger asChild>
                              <button className="text-[#087684] font-semibold inline-flex items-center hover:underline group-hover:translate-x-2 transition-all duration-300">
                                  Learn more
                                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                              </button>
                          </DialogTrigger>

                          {/* Fullscreen or large content */}
                          <DialogContent className="max-w-4xl w-full h-[90vh] overflow-y-auto p-6">
                              <DialogHeader>
                                  <DialogTitle className="text-2xl font-bold">{feature.title}</DialogTitle>
                              </DialogHeader>
                              <div className="mt-4 text-gray-700 leading-relaxed">
                                  {feature.details}
                              </div>
                          </DialogContent>
                      </Dialog>
                  </div>
                ))}
            </div>
          </div>

          {/* Enhanced Testimonials Section */}
          <div className="mt-18 bg-gradient-to-br from-[#087684]/5 to-white rounded-3xl shadow-lg p-12 border border-[#087684]/10">
            <h2 className="text-3xl font-bold text-center mb-8">
              Trusted by <span className="text-[#087684]">Leading Teams</span>
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Join thousands of successful organizations that have transformed their project management with MinT
            </p>
            
            <div className="relative">
              <div className="bg-white p-10 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#087684]/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#065a66]/5 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#087684] to-[#065a66] rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">
                          {testimonialsData[currentTestimonial].initials}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 font-medium">5.0 rating</span>
                      </div>
                      <p className="text-gray-700 mb-5 text-lg leading-relaxed font-medium">
                        "{testimonialsData[currentTestimonial].quote}"
                      </p>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4">
                        <p className="text-green-800 text-sm font-semibold flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Success: {testimonialsData[currentTestimonial].success}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {testimonialsData[currentTestimonial].name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {testimonialsData[currentTestimonial].role}
                        </p>
                        <p className="text-sm text-[#087684] font-semibold">
                          {testimonialsData[currentTestimonial].company}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Testimonial Controls */}
              <div className="flex justify-center items-center mt-8 space-x-4">
                <button
                  onClick={prevTestimonial}
                  className="p-3 rounded-full bg-[#087684]/10 hover:bg-[#087684]/20 transition-colors duration-300 hover:scale-110"
                >
                  <ChevronLeft className="h-5 w-5 text-[#087684]" />
                </button>
                <button
                  onClick={toggleAutoPlay}
                  className="p-3 rounded-full bg-[#087684]/10 hover:bg-[#087684]/20 transition-colors duration-300 hover:scale-110"
                >
                  {isAutoPlaying ? (
                    <Pause className="h-5 w-5 text-[#087684]" />
                  ) : (
                    <Play className="h-5 w-5 text-[#087684]" />
                  )}
                </button>
                <button
                  onClick={nextTestimonial}
                  className="p-3 rounded-full bg-[#087684]/10 hover:bg-[#087684]/20 transition-colors duration-300 hover:scale-110"
                >
                  <ChevronRight className="h-5 w-5 text-[#087684]" />
                </button>
              </div>
              
              {/* Enhanced Testimonial Indicators */}
              <div className="flex justify-center mt-6 space-x-3">
                {testimonialsData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      index === currentTestimonial 
                        ? 'bg-[#087684] scale-125 shadow-lg' 
                        : 'bg-[#087684]/30 hover:bg-[#087684]/50 hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">10,000+</h3>
                <p className="text-gray-600">Successful Projects Delivered</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">500+</h3>
                <p className="text-gray-600">Trusted Organizations</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">99.9%</h3>
                <p className="text-gray-600">Uptime & Reliability</p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}





      <footer className="bg-[#087684] text-white mt-24">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-[#087684] text-xl font-bold">M</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">MinT</h3>
                </div>
                <p className="text-gray-300 mb-6">
                  Empowering innovation through technology and efficient project management.
                </p>
                {/* Social Media Links */}
                <div className="flex space-x-4">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                    <Youtube className="h-5 w-5" />
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-6 text-white">Product</h4>
                <ul className="space-y-4">
                  <li><Link href="/info/features" className="text-gray-300 hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="/info/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link href="/info/security" className="text-gray-300 hover:text-white transition-colors">Security</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-6 text-white">Company</h4>
                <ul className="space-y-4">
                  <li><Link href="/info/about" className="text-gray-300 hover:text-white transition-colors">About</Link></li>
                  <li><Link href="/info/blog" className="text-gray-300 hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="/info/careers" className="text-gray-300 hover:text-white transition-colors">Careers</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-6 text-white">Support</h4>
                <ul className="space-y-4">
                  <li><Link href="/info/help" className="text-gray-300 hover:text-white transition-colors">Help Center</Link></li>
                  <li><Link href="/info/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
                  <li><Link href="/info/status" className="text-gray-300 hover:text-white transition-colors">Status</Link></li>
                </ul>
                {/* Contact Info */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors cursor-pointer">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">info@mint.gov.et</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 mt-12 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-300 text-sm text-center md:text-left">
                  © {new Date().getFullYear()} Ministry of Innovation and Technology. All rights reserved.
                </p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                  <Link href="/info/privacy" className="text-gray-300 hover:text-white text-sm transition-colors">Privacy Policy</Link>
                  <Link href="/info/terms" className="text-gray-300 hover:text-white text-sm transition-colors">Terms of Service</Link>
                  <Link href="/info/cookies" className="text-gray-300 hover:text-white text-sm transition-colors">Cookie Policy</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Demo Modal */}
        {showDemo && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#087684] to-[#065a66] text-white p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Project Examination Demo</h3>
                  <p className="text-white/80">See how our system helps you examine and track projects</p>
                </div>
                <button
                  onClick={() => setShowDemo(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Demo Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Project Overview */}
                  <div className="bg-gray-50 rounded-2xl p-6 shadow-md border border-gray-100 mb-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <Eye className="h-6 w-6 text-[#087684]" />
                      <h4 className="text-lg font-semibold">Project Examination</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="font-medium">Digital Transformation</span>
                        <span className="text-green-600 font-semibold">Active</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="font-medium">Infrastructure Upgrade</span>
                        <span className="text-yellow-600 font-semibold">Review</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="font-medium">Security Enhancement</span>
                        <span className="text-blue-600 font-semibold">Planning</span>
                      </div>
                    </div>
                  </div>

                  {/* Examination Tools */}
                  <div className="bg-gray-50 rounded-2xl p-6 shadow-md border border-gray-100 mb-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <Search className="h-6 w-6 text-[#087684]" />
                      <h4 className="text-lg font-semibold">Examination Tools</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                        <Filter className="h-5 w-5 text-[#087684]" />
                        <span>Advanced Filtering</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                        <TrendingUp className="h-5 w-5 text-[#087684]" />
                        <span>Progress Tracking</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                        <BarChart3 className="h-5 w-5 text-[#087684]" />
                        <span>Analytics Dashboard</span>
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="lg:col-span-2 bg-gray-50 rounded-2xl p-6 shadow-md border border-gray-100 mb-4">
                    <h4 className="text-lg font-semibold mb-4">Project Examination Features</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg">
                        <h5 className="font-semibold text-[#087684] mb-2">Real-time Monitoring</h5>
                        <p className="text-sm text-gray-600">Track project progress, milestones, and deliverables in real-time</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <h5 className="font-semibold text-[#087684] mb-2">Risk Assessment</h5>
                        <p className="text-sm text-gray-600">Identify and evaluate potential risks with automated alerts</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <h5 className="font-semibold text-[#087684] mb-2">Performance Analytics</h5>
                        <p className="text-sm text-gray-600">Generate comprehensive reports and performance insights</p>
                      </div>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="lg:col-span-2 text-center bg-gradient-to-r from-[#087684]/10 to-[#065a66]/10 rounded-2xl p-6">
                    <h4 className="text-xl font-bold text-[#087684] mb-2">Ready to Start Examining Your Projects?</h4>
                    <p className="text-gray-600 mb-4">Join thousands of teams who trust our platform for project management</p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <Link href="/login">
                        <Button className="bg-[#087684] hover:bg-[#065a66] text-white px-6 py-2 rounded-full">
                          Get Started Now
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        className="border-[#087684] text-[#087684] hover:bg-[#087684] hover:text-white px-6 py-2 rounded-full"
                        onClick={() => setShowDemo(false)}
                      >
                        Close Demo
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}

// Feature Card Component
function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-5 bg-white border border-gray-200 rounded-xl shadow hover:shadow-lg transition duration-300">
      <h3 className="text-lg font-semibold text-blue-700 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
