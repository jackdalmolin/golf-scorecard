import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import { ref, onValue, set } from "firebase/database";
import { db } from "./firebase";

const ScorecardPage = () => {
  const [tournaments, setTournaments] = useState({});
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [selectedTeamName, setSelectedTeamName] = useState(null);
  const [course, setCourse] = useState(null);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");

  // Fetch tournaments once at mount
  useEffect(() => {
    const tournamentRef = ref(db, "tournaments");
    onValue(tournamentRef, (snapshot) => {
      const data = snapshot.val() || {};
      setTournaments(data);

      const keys = Object.keys(data);
      if (keys.length > 0) {
        // Get the selected tournament from localStorage or use the most recent one
        const savedTournament = localStorage.getItem("selected-tournament");
        const mostRecent = keys.sort().reverse()[0];
        const tournamentToSelect = savedTournament && keys.includes(savedTournament) ? savedTournament : mostRecent;
        setSelectedTournament(tournamentToSelect);
      }
    });
  }, []);

  // Update selected tournament
  useEffect(() => {
    if (selectedTournament && tournaments[selectedTournament]) {
      const { course, teams } = tournaments[selectedTournament];
      setCourse(course);
      
      // Ensure teams is an array and initialize scores and notes arrays if they don't exist
      let teamsArray = [];
      if (Array.isArray(teams)) {
        teamsArray = teams;
      } else if (teams && typeof teams === 'object') {
        teamsArray = Object.values(teams);
      }
      
      // Initialize missing scores and notes for each team
      teamsArray = teamsArray.map(team => {
        return {
          ...team,
          scores: team.scores || Array(18).fill(null),
          notes: team.notes || Array(18).fill("")
        };
      });
      
      setTeams(teamsArray);
      
      // Try to select a team from localStorage or the first one
      const savedTeam = localStorage.getItem("focused-team-name");
      if (savedTeam && teamsArray.some(t => t.name === savedTeam)) {
        setSelectedTeamName(savedTeam);
      } else if (teamsArray.length > 0) {
        setSelectedTeamName(teamsArray[0].name);
      }
    }
  }, [selectedTournament, tournaments]);

  const updateScore = (holeIdx, val) => {
    try {
      const updated = [...teams];
      const teamIndex = updated.findIndex((t) => t.name === selectedTeamName);
      if (teamIndex === -1) {
        setError("Team not found. Please try again.");
        return;
      }

      // Make sure scores array exists and is the right length
      if (!updated[teamIndex].scores) {
        updated[teamIndex].scores = Array(18).fill(null);
      }
      
      updated[teamIndex].scores[holeIdx] = val;
      setTeams(updated);

      // Save to database
      set(ref(db, `tournaments/${selectedTournament}/teams/${teamIndex}/scores`), updated[teamIndex].scores)
        .catch(err => {
          console.error("Error saving score:", err);
          setError("Failed to save score. Please try again.");
        });
    } catch (err) {
      console.error("Error updating score:", err);
      setError("An error occurred while updating the score.");
    }
  };

  const updateNote = (holeIdx, val) => {
    try {
      const updated = [...teams];
      const teamIndex = updated.findIndex((t) => t.name === selectedTeamName);
      if (teamIndex === -1) {
        setError("Team not found. Please try again.");
        return;
      }

      // Make sure notes array exists and is the right length
      if (!updated[teamIndex].notes) {
        updated[teamIndex].notes = Array(18).fill("");
      }
      
      updated[teamIndex].notes[holeIdx] = val;
      setTeams(updated);

      // Save to database
      set(ref(db, `tournaments/${selectedTournament}/teams/${teamIndex}/notes`), updated[teamIndex].notes)
        .catch(err => {
          console.error("Error saving note:", err);
          setError("Failed to save note. Please try again.");
        });
    } catch (err) {
      console.error("Error updating note:", err);
      setError("An error occurred while updating the note.");
    }
  };

  const updatePar = (holeIdx, val) => {
    try {
      const updated = [...(course?.holes || Array(18).fill(4))];
      updated[holeIdx] = val || 4;
      const newCourse = { ...course, holes: updated };
      setCourse(newCourse);

      // Save to database
      set(ref(db, `tournaments/${selectedTournament}/course/holes`), updated)
        .catch(err => {
          console.error("Error saving par value:", err);
          setError("Failed to save par value. Please try again.");
        });
    } catch (err) {
      console.error("Error updating par:", err);
      setError("An error occurred while updating the par value.");
    }
  };

  const calculateTotal = (scores, holes) => {
    if (!scores || !holes) return 0;
    return scores.reduce((acc, s, i) => (s != null ? acc + (s - holes[i]) : acc), 0);
  };

  const getResultStyle = (score, par) => {
    if (score == null) return "text-gray-400";
    const diff = score - par;
    if (diff === -2) return "border-2 border-green-700 rounded-full px-2 font-bold text-green-800";
    if (diff === -1) return "border border-green-700 rounded-full px-2 text-green-800";
    if (diff === 1) return "border border-red-600 px-2 text-red-600";
    if (diff >= 2) return "border-2 border-red-600 px-2 text-red-600";
    return "text-gray-500";
  };

  const renderScorecard = () => {
    const teamList = Array.isArray(teams) ? teams : Object.values(teams);
    const team = teamList.find((t) => t.name === selectedTeamName);

    if (!team || !course?.holes) {
      return <p className="text-gray-600">No team or course data found. Please select a valid team and tournament.</p>;
    }

    // Ensure scores and notes are initialized
    if (!team.scores) team.scores = Array(18).fill(null);
    if (!team.notes) team.notes = Array(18).fill("");

    const total = calculateTotal(team.scores, course.holes);

    return (
      <div className="mt-6 border rounded-md overflow-hidden shadow-md">
        <div className="bg-green-800 text-white text-lg font-semibold px-4 py-2">
          Total: {total >= 0 ? `+${total}` : total}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-800 font-semibold">
            <tr>
              <th className="p-2 border">Hole</th>
              <th className="p-2 border">Par</th>
              <th className="p-2 border">Score</th>
              <th className="p-2 border">Result</th>
              <th className="p-2 border">Notes</th>
            </tr>
          </thead>
          <tbody>
            {course.holes.map((par, idx) => (
              <tr key={idx} className="even:bg-white odd:bg-gray-50">
                <td className="p-2 text-center border">{idx + 1}</td>
                <td className="p-2 text-center border">
                  <input
                    type="number"
                    value={par}
                    onChange={(e) => updatePar(idx, parseInt(e.target.value))}
                    className="w-12 text-center border rounded"
                  />
                </td>
                <td className="p-2 text-center border">
                  <input
                    type="number"
                    value={team.scores[idx] ?? ""}
                    onChange={(e) =>
                      updateScore(idx, e.target.value === "" ? null : parseInt(e.target.value))
                    }
                    placeholder="-"
                    className="w-12 text-center border rounded"
                  />
                </td>
                <td className="p-2 text-center border">
                  {team.scores[idx] != null ? (
                    <span className={getResultStyle(team.scores[idx], par)}>
                      {team.scores[idx]}
                    </span>
                  ) : (
                    "-"
                  )}
                    
                </td>
                <td className="p-2 border">
                  <input
                    type="text"
                    value={team.notes[idx] ?? ""}
                    onChange={(e) => updateNote(idx, e.target.value)}
                    placeholder="Add notes..."
                    className="w-full border rounded p-1 text-sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-serif">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-green-800 mb-4">Scorecard</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
              <button 
                className="ml-2 font-bold"
                onClick={() => setError("")}
              >
                ×
              </button>
            </div>
          )}

          <div className="mb-4">
            <label className="block font-medium mb-1">Select Tournament</label>
            <select
              value={selectedTournament || ""}
              onChange={(e) => {
                setSelectedTournament(e.target.value);
                setSelectedTeamName(null);
                localStorage.setItem("selected-tournament", e.target.value);
              }}
              className="w-full p-2 border rounded"
            >
              <option value="" disabled>Select a tournament</option>
              {Object.keys(tournaments).map((name, idx) => (
                <option key={idx} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {selectedTournament && (
            <div className="mb-6">
              <label className="block font-medium mb-1">Select Team</label>
              <select
                value={selectedTeamName || ""}
                onChange={(e) => {
                  setSelectedTeamName(e.target.value);
                  localStorage.setItem("focused-team-name", e.target.value);
                }}
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>Select team</option>
                {teams.map((team, idx) => (
                  <option key={idx} value={team.name}>{team.name}</option>
                ))}
              </select>
            </div>
          )}

          {selectedTeamName && renderScorecard()}
        </div>
      </div>
    </>
  );
};

export default ScorecardPage;