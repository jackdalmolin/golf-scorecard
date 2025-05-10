import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { db } from "./firebase";
import { ref, set } from "firebase/database";

const defaultHoles = Array(18).fill(4);

const CreateMatch = () => {
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState("");
  const [date, setDate] = useState("");
  const [teams, setTeams] = useState(["", "", "", "", "", "", "", ""]); // Changed from 4 to 8 empty strings
  const [error, setError] = useState("");

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
          <label className="block font-medium mb-2">Teams (up to 8)</label>
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
      </div>
    </>
  );
};

export default CreateMatch;
