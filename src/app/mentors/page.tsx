"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseStore";
import { Presentation, Loader2, Plus, Trash2, X } from "lucide-react";

interface Team {
  id: string;
  teamName: string;
}

interface Mentor {
  id: string;
  mentorName: string;
  pocName: string;
  isPresent: boolean;
  assignedTeamId: string;
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Mentor Form
  const [mentorName, setMentorName] = useState("");
  const [pocName, setPocName] = useState("");

  const fetchData = async () => {
    try {
      // Fetch Mentors
      const mSnapshot = await getDocs(collection(db, "mentors_2026"));
      let fetchedMentors: Mentor[] = [];
      mSnapshot.forEach((doc) => {
        fetchedMentors.push({ id: doc.id, ...doc.data() } as Mentor);
      });
      setMentors(fetchedMentors);

      // Fetch Teams (for the assignment dropdown)
      const tSnapshot = await getDocs(collection(db, "teams_2026"));
      let fetchedTeams: Team[] = [];
      tSnapshot.forEach((doc) => {
        fetchedTeams.push({ id: doc.id, teamName: doc.data().teamName });
      });
      setTeams(fetchedTeams);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorName || !pocName) return;

    try {
      const newMentor = {
        mentorName,
        pocName,
        isPresent: false,
        assignedTeamId: ""
      };
      
      const docRef = await addDoc(collection(db, "mentors_2026"), newMentor);
      setMentors([...mentors, { id: docRef.id, ...newMentor }]);
      setIsModalOpen(false);
      setMentorName(""); setPocName("");
    } catch (error) {
      console.error("Error adding mentor:", error);
    }
  };

  const handleDeleteMentor = async (mentorId: string) => {
    if (!confirm("Are you sure you want to remove this mentor?")) return;
    try {
      await deleteDoc(doc(db, "mentors_2026", mentorId));
      setMentors(mentors.filter(m => m.id !== mentorId));
    } catch (error) {
      console.error("Error deleting mentor:", error);
    }
  };

  const handlePresenceToggle = async (mentorId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Optimistic UI
    setMentors(prev => prev.map(m => m.id === mentorId ? { ...m, isPresent: newStatus } : m));
    
    try {
      await updateDoc(doc(db, "mentors_2026", mentorId), { isPresent: newStatus });
    } catch (error) {
      console.error("Error updating presence:", error);
      // Revert
      setMentors(prev => prev.map(m => m.id === mentorId ? { ...m, isPresent: currentStatus } : m));
    }
  };

  const handleTeamAssignment = async (mentorId: string, teamId: string) => {
    // Optimistic UI
    const previousState = [...mentors];
    setMentors(prev => prev.map(m => m.id === mentorId ? { ...m, assignedTeamId: teamId } : m));

    try {
      await updateDoc(doc(db, "mentors_2026", mentorId), { assignedTeamId: teamId });
    } catch (error) {
      console.error("Error assigning team:", error);
      setMentors(previousState);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Mentors Management</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Manage mentors, track their arrival presence, and assign them to teams.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#00b0f0] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#009ad4] transition-colors shadow-sm"
          >
            {/* @ts-ignore */}
            <Plus className="h-5 w-5" /> Add Mentor
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#00b0f0]" />
          </div>
        ) : mentors.length === 0 ? (
           <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-10 text-center flex flex-col items-center">
             {/* @ts-ignore */}
             <Presentation className="h-12 w-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400 font-medium text-lg">No mentors added yet.</p>
            <p className="text-zinc-500 text-sm mt-1">Click the Add Mentor button above to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900 shadow">
            <table className="min-w-full divide-y divide-zinc-800">
              <thead className="bg-zinc-900/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Mentor Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Point of Contact</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">Present?</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Assigned Team</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-transparent">
                {mentors.map((mentor) => (
                  <tr key={mentor.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-zinc-200">{mentor.mentorName}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-zinc-400">{mentor.pocName}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                       <input
                          type="checkbox"
                          className="h-5 w-5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900 cursor-pointer"
                          checked={mentor.isPresent}
                          onChange={() => handlePresenceToggle(mentor.id, mentor.isPresent)}
                        />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                       <select
                          value={mentor.assignedTeamId}
                          onChange={(e) => handleTeamAssignment(mentor.id, e.target.value)}
                          className="w-full max-w-[200px] rounded-lg border border-zinc-800 bg-zinc-950 py-1.5 px-3 text-sm text-zinc-300 focus:ring-2 focus:ring-[#00b0f0] outline-none"
                        >
                          <option value="">-- Unassigned --</option>
                          {teams.map(t => (
                            <option key={t.id} value={t.id}>{t.teamName}</option>
                          ))}
                        </select>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                       <button onClick={() => handleDeleteMentor(mentor.id)} className="text-zinc-500 hover:text-red-400 transition-colors">
                       {/* @ts-ignore */}
                          <Trash2 className="h-5 w-5 inline-block" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Mentor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">Add New Mentor</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                {/* @ts-ignore */}
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateMentor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Mentor Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={mentorName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMentorName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#00b0f0] outline-none" 
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">POC Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={pocName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPocName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#00b0f0] outline-none" 
                  placeholder="Who is managing this mentor?"
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                   Cancel
                 </button>
                 <button type="submit" className="bg-[#00b0f0] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#009ad4] transition-colors shadow-sm">
                   Save Mentor
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
