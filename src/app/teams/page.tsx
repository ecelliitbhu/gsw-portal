"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseStore";
import { UsersRound, Loader2, Plus, Trash2, X } from "lucide-react";

interface Team {
  id: string;
  teamName: string;
  pocName: string;
  sector: string;
  ideaList: string;
  participantIds: string[];
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Team Form State
  const [teamName, setTeamName] = useState("");
  const [pocName, setPocName] = useState("");
  const [sector, setSector] = useState("");
  const [ideaList, setIdeaList] = useState("");

  const fetchTeams = async () => {
    try {
      const snapshot = await getDocs(collection(db, "teams_2026"));
      let fetchedTeams: Team[] = [];
      snapshot.forEach((doc) => {
        fetchedTeams.push({ id: doc.id, ...doc.data() } as Team);
      });
      setTeams(fetchedTeams);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !pocName) return;

    try {
      const newTeam = {
        teamName,
        pocName,
        sector,
        ideaList,
        participantIds: []
      };
      
      const docRef = await addDoc(collection(db, "teams_2026"), newTeam);
      setTeams([...teams, { id: docRef.id, ...newTeam }]);
      setIsModalOpen(false);
      setTeamName(""); setPocName(""); setSector(""); setIdeaList("");
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    try {
      await deleteDoc(doc(db, "teams_2026", teamId));
      setTeams(teams.filter(t => t.id !== teamId));
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Teams Management</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Create teams, assign POCs, and track their sectors and ideas.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#00b0f0] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#009ad4] transition-colors shadow-sm"
          >
            {/* @ts-ignore */}
            <Plus className="h-5 w-5" /> Create Team
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#00b0f0]" />
          </div>
        ) : teams.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-10 text-center flex flex-col items-center">
             {/* @ts-ignore */}
             <UsersRound className="h-12 w-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400 font-medium text-lg">No teams created yet.</p>
            <p className="text-zinc-500 text-sm mt-1">Click the Create Team button above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div key={team.id} className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-lg hover:border-zinc-700 transition-colors">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white truncate pr-4">{team.teamName}</h3>
                    <button onClick={() => handleDeleteTeam(team.id)} className="text-zinc-500 hover:text-red-400 transition-colors">
                      {/* @ts-ignore */}
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Point of Contact</p>
                      <p className="text-zinc-300 font-medium">{team.pocName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Sector</p>
                      <p className="text-zinc-300">{team.sector || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Idea Focus</p>
                      <p className="text-zinc-300 text-sm line-clamp-2">{team.ideaList || "No ideas listed"}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-zinc-800 mt-4 flex items-center justify-between">
                       <p className="text-sm text-zinc-400"><span className="text-white font-medium">{team.participantIds?.length || 0}</span> Participants</p>
                       <button className="text-[#00b0f0] text-sm hover:underline font-medium">Manage Members</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">Create New Team</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                {/* @ts-ignore */}
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTeam} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Team Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={teamName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeamName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#00b0f0] focus:border-transparent outline-none" 
                  placeholder="e.g. Innovators"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">POC Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={pocName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPocName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#00b0f0] focus:border-transparent outline-none" 
                  placeholder="Who is leading this team?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Chosen Sector</label>
                <input 
                  type="text" 
                  value={sector}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSector(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#00b0f0] focus:border-transparent outline-none" 
                  placeholder="e.g. EdTech, FinTech"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Idea List</label>
                <textarea 
                  value={ideaList}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setIdeaList(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#00b0f0] focus:border-transparent outline-none resize-none" 
                  placeholder="Briefly describe the startup idea..."
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                   Cancel
                 </button>
                 <button type="submit" className="bg-[#00b0f0] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#009ad4] transition-colors shadow-sm">
                   Create Team
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
