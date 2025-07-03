import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { FiFileText, FiRefreshCw } from "react-icons/fi";

const Sidebar = ({ user, onSelect }) => {
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSavedRoadmaps = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch saved roadmaps", error);
    } else {
      setSavedRoadmaps(data);
    }
    setLoading(false);
  };

useEffect(() => {
  console.log("Sidebar user.id:", user?.id); 
  if (user?.id) {
    fetchSavedRoadmaps();
  }
}, [user]);

  return (
    <aside className="w-full sm:w-72 bg-white border-r border-gray-200 p-4 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FiFileText />
          Saved Roadmaps
        </h2>
        <button
          onClick={fetchSavedRoadmaps}
          className="text-gray-500 hover:text-blue-600"
          title="Refresh"
        >
          <FiRefreshCw className="animate-spin-once" />
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : savedRoadmaps.length === 0 ? (
        <p className="text-sm text-gray-400">No saved roadmaps found.</p>
      ) : (
        <ul className="space-y-3">
          {savedRoadmaps.map((roadmap) => (
            <li
              key={roadmap.id}
              className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 cursor-pointer transition-all"
              onClick={() =>
                onSelect({
                  topic: roadmap.topic,
                  roadmap: roadmap.roadmap,
                })
              }
            >
              <p className="font-medium text-gray-700 truncate">{roadmap.topic}</p>
              <p className="text-xs text-gray-400">
                {new Date(roadmap.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default Sidebar;
