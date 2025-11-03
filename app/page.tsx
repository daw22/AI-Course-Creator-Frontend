"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import useUserStore from "@/state/user";
import usePortalStore from "@/state/portal";
import useCreationStore from "@/state/creationState";

export default function HomePage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const open = usePortalStore((state) => state.openPortal);
  const currentState = useCreationStore((state) => state.currentState);

  const features = [
    {
      title: "AI-Generated Content",
      description: "Create comprehensive courses in seconds with advanced AI",
    },
    {
      title: "Personalized Learning",
      description: "Courses adapt to your learning pace and style",
    },
    {
      title: "Interactive Quizzes",
      description: "Test your knowledge with AI-crafted quiz questions",
    },
    {
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics",
    },
    {
      title: "Expert Curriculum",
      description: "Curriculum designed by AI experts and professionals",
    },
    {
      title: "Instant Access",
      description: "Start learning immediately after course creation",
    },
  ];
  const toCreateCourse = () => {
    if (user) {
      router.push("/CreateCourse");
    } else {
      // open sign in modal
      open("signIn");
    }
  };
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 pt-20 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-tight mb-6">
            Create AI-Powered Courses Tailored to Your Level
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-light">
            Generate personalized learning courses in minutes. From beginner to
            expert, create the perfect curriculum for any topic.
          </p>
          <button
            onClick={toCreateCourse}
            className="px-8 sm:px-10 py-4 border border-white text-white font-light text-sm sm:text-base tracking-widest uppercase hover:bg-blue-900 hover:text-white transition-all duration-300 ease-out active:scale-95 flex items-center gap-3 mx-auto group"
          >
            Create Course
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-center mb-16">
            Why Choose Our Course Generator
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 border border-gray-800 hover:border-gray-600 transition-all duration-300 group cursor-pointer"
              >
                <h3 className="text-xl font-light text-white mb-4 group-hover:text-gray-200 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 font-light text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-black border-t border-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-8">
            Ready to Start Learning?
          </h2>
          <p className="text-gray-400 text-lg mb-12 font-light">
            Create your first AI-generated course today and experience personalized learning like never before.
          </p>
          <button
            onClick={toCreateCourse}
            className="px-8 sm:px-10 py-4 border border-white text-white font-light text-sm sm:text-base tracking-widest uppercase hover:bg-blue-900 hover:text-white transition-all duration-300 ease-out active:scale-95 flex items-center gap-3 mx-auto group"
          >
            Get Started Now
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-black border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-white font-light text-lg mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 font-light text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-light text-lg mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 font-light text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-light text-lg mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 font-light text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-light text-lg mb-4">Follow</h4>
              <ul className="space-y-2 text-gray-400 font-light text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center text-gray-400 font-light text-sm">
            <p>&copy; 2025 AI Course Generator. All rights reserved.</p>
            <p>Crafted for learners everywhere</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        body {
          margin: 0;
          padding: 0;
          background-color: #000000;
        }
      `}</style>
    </div>
  );
}



