import React from 'react';
import { Link } from 'wouter';
import { useAuthStore } from '../stores/auth';
import { 
  ChevronRight, 
  Share2, 
  BarChart2, 
  Users, 
  Search, 
  Lock, 
  Zap,
  ArrowRight,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-100 via-white to-blue-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Collaborative Graph Intelligence
              </h1>
              <p className="text-xl text-gray-600 max-w-lg">
                Transform complex information into interactive knowledge graphs, 
                collaborate with your team, and gain insights in real-time.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                {isAuthenticated ? (
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <Link href="/home">
                      Go to Main Page <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                      <Link href="/auth?tab=register">
                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <Link href="/auth?tab=login">
                        Sign In
                      </Link>
                    </Button>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                  <span>Real-time collaboration</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                  <span>Advanced analytics</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="w-full h-96 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl shadow-lg overflow-hidden">
                {/* This would be a fancy graph visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4/5 h-4/5 relative">
                    {/* Nodes and edges visualization placeholder */}
                    <div className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-blue-500 opacity-80 shadow-lg flex items-center justify-center text-white font-medium">
                      Concept
                    </div>
                    <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-purple-500 opacity-80 shadow-lg flex items-center justify-center text-white font-medium">
                      Knowledge
                    </div>
                    <div className="absolute bottom-1/4 right-1/3 w-14 h-14 rounded-full bg-green-500 opacity-80 shadow-lg flex items-center justify-center text-white font-medium">
                      Data
                    </div>
                    <div className="absolute bottom-1/3 left-1/3 w-16 h-16 rounded-full bg-amber-500 opacity-80 shadow-lg flex items-center justify-center text-white font-medium">
                      Insight
                    </div>
                    {/* Connection lines */}
                    <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                      <line x1="35%" y1="30%" x2="65%" y2="35%" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="2" />
                      <line x1="65%" y1="35%" x2="63%" y2="70%" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="2" />
                      <line x1="63%" y1="70%" x2="35%" y2="65%" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="2" />
                      <line x1="35%" y1="65%" x2="35%" y2="30%" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="2" />
                      <line x1="35%" y1="30%" x2="63%" y2="70%" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="2" />
                      <line x1="35%" y1="65%" x2="65%" y2="35%" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Powerful Multi-User Graph Platform
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Unlock the full potential of your data with collaborative graph visualization and analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-gray-600 mb-4">
                Work together with your team to create, edit, and analyze knowledge graphs in real-time.
              </p>
              <div className="text-primary font-medium flex items-center">
                <span>Learn more</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </Card>

            <Card className="p-6 transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-gray-600 mb-4">
                Gain deep insights with real-time metrics, centrality analysis, and community detection.
              </p>
              <div className="text-primary font-medium flex items-center">
                <span>Learn more</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </Card>

            <Card className="p-6 transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Seamless Sharing</h3>
              <p className="text-gray-600 mb-4">
                Share your graphs with specific team members or make them public for broader collaboration.
              </p>
              <div className="text-primary font-medium flex items-center">
                <span>Learn more</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform simplifies the process of turning complex information into actionable knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Input Your Data</h3>
              <p className="text-gray-600">
                Transform text or upload data to automatically generate intelligent knowledge graphs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Collaborate & Refine</h3>
              <p className="text-gray-600">
                Invite team members to collaborate and refine the graph in real-time.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyze & Share</h3>
              <p className="text-gray-600">
                Analyze relationships, detect patterns, and share insights with your organization.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              What Our Users Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="text-gray-600 italic mb-4">
                "This platform has transformed how our research team collaborates. The graph analytics features help us identify connections we would have otherwise missed."
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <span className="text-gray-600 font-medium">JD</span>
                </div>
                <div>
                  <p className="font-medium">Dr. Jane Doherty</p>
                  <p className="text-sm text-gray-500">Research Director</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-gray-600 italic mb-4">
                "We use the collaborative graphs daily to map customer journeys and identify improvement opportunities. The real-time analytics have been game-changing."
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <span className="text-gray-600 font-medium">MS</span>
                </div>
                <div>
                  <p className="font-medium">Mark Smith</p>
                  <p className="text-sm text-gray-500">Product Manager</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-gray-600 italic mb-4">
                "As an educator, I use this platform to help students visualize complex concepts. The ability to collaboratively build knowledge graphs has revolutionized my teaching."
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <span className="text-gray-600 font-medium">AC</span>
                </div>
                <div>
                  <p className="font-medium">Alicia Chen</p>
                  <p className="text-sm text-gray-500">Professor</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Data into Insights?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Join thousands of teams using our platform to collaborate on knowledge graphs and discover meaningful connections.
          </p>
          {isAuthenticated ? (
            <Button asChild size="lg" variant="secondary">
              <Link href="/home">
                Go to Main Page <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth?tab=register">
                Get Started Today <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Graph Intelligence</h3>
              <p className="text-gray-400 text-sm">
                Transform complex information into interactive, visually compelling knowledge graphs.
              </p>
            </div>
            <div>
              <h4 className="text-white text-sm font-medium mb-4">PRODUCT</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Team Collaboration</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-medium mb-4">COMPANY</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-medium mb-4">LEGAL</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-sm text-gray-400 text-center">
            <p>© {new Date().getFullYear()} Graph Intelligence Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}