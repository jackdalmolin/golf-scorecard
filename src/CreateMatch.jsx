import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { db } from "./firebase";
import { ref, set, get, remove } from "firebase/database";

const defaultHoles = Array(18).fill(4);

const CreateMatch = () => {
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState("");
  const [date, setDate] = useState("");
  const [teams, setTeams] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [tournaments, setTournaments] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch tournaments on component mount
  useEffect(() => {
    const fetchTournaments = async () => {
      const tournamentsRef = ref(db, "tournaments");
      const snapshot = await get(tournamentsRef);
      if (snapshot.exists()) {
        setTournaments(snapshot.val());
      }
    };

    fetchTournaments();
  }, []);

  const handleCreate = async () => {
    if (!courseName || !date) {
      setError("Course name and date are required.");
      return;
    }

    const tournamentName = `${courseName.trim()} (${date})`;

    const newTournament = {
      name: tournamentName,
      course: {
        name: courseName.trim(),
        date,
        holes: defaultHoles,
      },
      teams: teams
        .filter((t) => t.trim())
        .map((name) => ({
          name: name.trim(),
          scores: Array(18).fill(null),
          notes: Array(18).fill(""),
        })),
    };

    try {
      await set(ref(db, `tournaments/${tournamentName}`), newTournament);
      localStorage.setItem("selected-tournament", tournamentName);
      navigate("/scorecard");
    } catch (err) {
      console.error("Error creating tournament:", err);
      setError("Failed to create tournament.");
    }
  };

  const handleDelete = async (tournamentName) => {
    if (window.confirm(`Are you sure you want to delete "${tournamentName}"? This action cannot be undone.`)) {
      try {
        await remove(ref(db, `tournaments/${tournamentName}`));
        
        // Update local state to remove the deleted tournament
        const updatedTournaments = { ...tournaments };
        delete updatedTournaments[tournamentName];
        setTournaments(updatedTournaments);
        
        // If the deleted tournament was selected, clear localStorage
        if (localStorage.getItem("selected-tournament") === tournamentName) {
          localStorage.removeItem("selected-tournament");
        }
      } catch (err) {
        console.error("Error deleting tournament:", err);
        setError("Failed to delete tournament.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Create Match</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block font-medium mb-1">Course Name</label>
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2">Teams (up to 4)</label>
          {teams.map((team, idx) => (
            <input
              key={idx}
              type="text"
              value={team}
              onChange={(e) => {
                const updated = [...teams];
                updated[idx] = e.target.value;
                setTeams(updated);
              }}
              className="w-full p-2 border rounded mb-2"
              placeholder={`Team ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleCreate}
          className="bg-green-600 text-white font-semibold py-2 px-4 rounded hover:bg-green-700"
        >
          Create Tournament
        </button>

        <div className="mt-12 border-t pt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold mb-4">Manage Tournaments</h2>
            <button
              onClick={() => setIsDeleting(!isDeleting)}
              className="text-sm font-medium py-1 px-3 rounded bg-gray-100 hover:bg-gray-200 mb-4"
            >
              {isDeleting ? "Cancel" : "Toggle Delete Mode"}
            </button>
          </div>
          
          {Object.keys(tournaments).length === 0 ? (
            <p className="text-gray-500">No tournaments found.</p>
          ) : (
            <div className="space-y-2">
              {Object.keys(tournaments).map((name) => (
                <div key={name} className="flex justify-between items-center p-3 border rounded bg-gray-50">
                  <span>{name}</span>
                  {isDeleting && (
                    <button
                      onClick={() => handleDelete(name)}
                      className="text-white bg-red-500 hover:bg-red-600 py-1 px-3 rounded text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateMatch;