import React, { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { supabase } from "./supabaseClient";
import Profile from "./Profile";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const [typedText, setTypedText] = useState("");
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  const examples = [
    "Learn Python programming",
    "Master digital marketing",
    "Become a data scientist",
    "Build mobile apps",
    "Study machine learning",
  ];
  useEffect(() => {
    const typeText = () => {
      const currentExample = examples[currentExampleIndex];
      let index = 0;
      setTypedText("");

      const timer = setInterval(() => {
        if (index < currentExample.length) {
          setTypedText(currentExample.substring(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            setCurrentExampleIndex((prev) => (prev + 1) % examples.length);
          }, 2000);
        }
      }, 100);
    };

    typeText();
  }, [currentExampleIndex]);

  const handleGoogleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      console.error("Error during sign in:", error);
    }
  };
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        navigate("/home");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

return (
  <div className="min-h-screen w-full bg-white flex flex-col">
    <header className="flex justify-start items-center h-16 px-6 border-b border-gray-300">
      <h1 className="text-lg sm:text-xl font-light text-black">Learn faster with AI</h1>
    </header>
    <section className="mt-16 sm:mt-24 flex flex-col justify-center items-center text-center px-4">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-6">
          <Zap className="w-4 h-4 mr-2" />
          AI-Powered Learning Revolution
        </div>

        <h1 className="text-[#171616] text-4xl sm:text-6xl md:text-7xl font-semibold leading-tight">
          Roadmap.ai
        </h1>

        <h2 className="text-gray-500 text-base sm:text-lg md:text-xl font-normal mt-4 max-w-2xl mx-auto">
          Transform your learning journey with AI-generated roadmaps. Get personalized, step-by-step plans that adapt to your goals, schedule, and learning style.
        </h2>

        <button
          className="mt-8 sm:mt-10 px-6 py-3 bg-black text-white rounded-full text-sm sm:text-lg hover:bg-gray-800 transition"
          onClick={handleGoogleSignIn}
        >
          Get Started
        </button>
      </div>
    </section>

    <section className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mt-10 mb-12 w-full max-w-xl mx-auto">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      </div>
      <div className="text-left">
        <p className="text-gray-500 text-sm mb-2">What do you want to learn?</p>
        <div className="text-xl sm:text-2xl font-medium text-gray-900 h-8 flex items-center">
          {typedText}
          <span className="ml-1 w-0.5 h-6 bg-blue-600 animate-pulse"></span>
        </div>
      </div>
    </section>
    <footer className="mt-auto py-6 text-center text-xs sm:text-sm text-gray-500 px-2">
      © {new Date().getFullYear()} Roadmap.ai — All rights reserved by pravalgautam
    </footer>

    <Profile />
  </div>
);

};

export default LandingPage;
