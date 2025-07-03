import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiCheckCircle,
  FiCalendar,
  FiBook,
  FiTarget,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiStar,
  FiExternalLink,
} from "react-icons/fi";
import { generateRoadmap } from "./generateRoadmap";
import Sidebar from "./Sidebar";

const HomeScreen = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [roadmap, setRoadmap] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout error:", error.message);
    else navigate("/");
  };

  const parseRoadmap = (text) => {
    if (!text) return [];
    const parts = text.split(/\n\n+/);
    const result = [];
    let current = null;

    parts.forEach((part) => {
      const header = part.match(/^#{1,6}\s*(.+)/);
      if (header) {
        current = { title: header[1].trim(), content: [] };
        result.push(current);
        return;
      }

      if (current) {
        const lines = part.split("\n").filter((l) => l.trim());
        const contentItems = [];

        lines.forEach((line) => {
          const clean = line.replace(/^[\-\*\•#\s]+/, "").trim();
          const week = clean.match(/^(Week \d+):\s*(.*)$/i);
          if (week) {
            contentItems.push({
              type: "week",
              title: week[1],
              content: week[2],
            });
            return;
          }

          const markdownLink = clean.match(
            /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)(?:\s*-\s*(.+))?/
          );
          if (markdownLink) {
            const [_, label, url, desc] = markdownLink;
            contentItems.push({
              type: "resource",
              url,
              label,
              description: desc || "",
              isYouTube:
                url.includes("youtube.com") || url.includes("youtu.be"),
            });
            return;
          }

          contentItems.push({ type: "item", content: clean });
        });

        const grouped = [];
        let buffer = [];

        contentItems.forEach((item) => {
          if (item.type === "resource") {
            buffer.push(item);
          } else {
            if (buffer.length > 0) {
              grouped.push({ type: "resources", content: buffer });
              buffer = [];
            }
            grouped.push(item);
          }
        });

        if (buffer.length > 0) {
          grouped.push({ type: "resources", content: buffer });
        }

        current.content.push(...grouped);
      }
    });

    return result;
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic before generating.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const roadmapText = await generateRoadmap(topic, isPremium);

      if (roadmapText?.trim()) {
        setRoadmap(roadmapText);
        const sections = parseRoadmap(roadmapText);
        const initialExpanded = {};
        sections.forEach((_, index) => {
          initialExpanded[index] = true;
        });
        setExpandedSections(initialExpanded);

    await supabase.from("roadmaps").insert([
  {
    user_id: user.id,
    topic: topic.trim(),
    roadmap: roadmapText.trim(),
    is_premium: isPremium,
  },
]);

      } else {
        setError("No roadmap returned. Try again.");
        setRoadmap("");
      }
    } catch (err) {
      console.error("Generation failed", err);
      setError("Failed to generate roadmap. Please try again.");
      setRoadmap("");
    }

    setLoading(false);
  };

  const toggleSection = (i) => {
    setExpandedSections((p) => ({ ...p, [i]: !p[i] }));
  };

  const toggleAll = () => {
    const all = Object.values(expandedSections).every(Boolean);
    const newState = {};
    roadmapSections.forEach((_, i) => (newState[i] = !all));
    setExpandedSections(newState);
  };

  const getIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes("stage") || t.includes("phase")) return <FiStar />;
    if (t.includes("week") || t.includes("month")) return <FiClock />;
    if (t.includes("resource") || t.includes("tool")) return <FiBook />;
    return <FiTarget />;
  };

  const roadmapSections = parseRoadmap(roadmap);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white p-4 shadow flex justify-between items-center">
        <h1 className="text-sm text-gray-600">
          {user ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Welcome,{" "}
              <strong className="text-gray-800">
                {user.user_metadata?.username ||
                  user.user_metadata?.name ||
                  user.email}
              </strong>
            </span>
          ) : (
            "Please sign in."
          )}
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
        >
          <FiLogOut /> Logout
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 mt-20 h-[calc(100vh-5rem)]">
        {/* Sidebar */}
        <div className="w-64 h-full overflow-y-auto bg-white border-r shadow">
          <Sidebar
            user={user}
            onSelect={({ topic, roadmap }) => {
              setTopic(topic);
              setRoadmap(roadmap);
              const sections = parseRoadmap(roadmap);
              const init = {};
              sections.forEach((_, i) => (init[i] = true));
              setExpandedSections(init);
            }}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-8 bg-gray-50">
          <div className="w-full max-w-5xl bg-white p-6 rounded-2xl shadow mb-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
                {error}
              </div>
            )}
            <label className="block mb-2 font-medium text-gray-700">
              Enter a topic (e.g. Web3 Developer)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full mb-4 px-4 py-3 border rounded focus:ring-blue-400"
              placeholder="Type your topic..."
            />
            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="mr-2"
                />
                More discriptive way
              </label>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Roadmap"}
              </button>
            </div>
          </div>

          {roadmapSections.length > 0 && (
            <div className="w-full max-w-5xl space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Your {topic} Roadmap</h2>
                <button
                  onClick={toggleAll}
                  className="text-sm text-blue-600"
                >
                  {Object.values(expandedSections).every(Boolean)
                    ? "Collapse All"
                    : "Expand All"}
                </button>
              </div>

              {roadmapSections.map((sec, si) => (
                <section
                  key={si}
                  className="bg-white rounded-2xl shadow flex flex-col"
                >
                  <button
                    onClick={() => toggleSection(si)}
                    className="flex justify-between items-center p-4 border-b"
                  >
                    <div className="flex items-center gap-3 font-semibold">
                      {getIcon(sec.title)}
                      {sec.title}
                    </div>
                    {expandedSections[si] ? (
                      <FiChevronDown />
                    ) : (
                      <FiChevronRight />
                    )}
                  </button>

                  {expandedSections[si] && (
                    <div className="p-6 space-y-4">
                      {sec.content.map((item, i) => {
                        if (item.type === "week") {
                          return (
                            <div key={i} className="p-4 bg-blue-50 rounded">
                              <div className="font-semibold">{item.title}</div>
                              <div>{item.content}</div>
                            </div>
                          );
                        }

                        if (item.type === "resources") {
                          return (
                            <div key={i} className="p-4 bg-purple-50 rounded">
                              <div className="font-semibold mb-2">
                                Resources
                              </div>
                              <div className="space-y-4">
                                {item.content.map((r, ri) =>
                                  r.isYouTube ? (
                                    <div
                                      key={ri}
                                      className="aspect-video rounded overflow-hidden shadow"
                                    >
                                      <iframe
                                        src={`https://www.youtube.com/embed/${(() => {
                                          const u = r.url;
                                          return u.includes("watch?v=")
                                            ? u.split("v=")[1].split("&")[0]
                                            : u.split("/").pop();
                                        })()}`}
                                        title="YouTube video"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full"
                                      />
                                    </div>
                                  ) : (
                                    <a
                                      key={ri}
                                      href={r.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-purple-700 hover:text-purple-900"
                                    >
                                      <FiExternalLink />{" "}
                                      {r.label || r.url}
                                    </a>
                                  )
                                )}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={i} className="flex items-start gap-2">
                            <FiCheckCircle className="text-green-500 mt-1" />
                            <div>{item.content}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HomeScreen;
