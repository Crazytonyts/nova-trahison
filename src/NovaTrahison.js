import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";

const cards = [
  { type: "action", name: "Réparer un module", effect: "+1 Influence" },
  { type: "action", name: "Prendre un secteur", effect: "+2 Influence" },
  { type: "sabotage", name: "Explosion", effect: "-1 Influence à l'adversaire" },
  { type: "defense", name: "Bouclier", effect: "Bloque un sabotage" },
];

function getRandomCard() {
  return cards[Math.floor(Math.random() * cards.length)];
}

export default function NovaTrahison() {
  const [lobbyId, setLobbyId] = useState("lobby1");
  const [playerId, setPlayerId] = useState("player1");
  const [gameData, setGameData] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "games", lobbyId), (docSnap) => {
      if (docSnap.exists()) {
        setGameData(docSnap.data());
      } else {
        setGameData(null);
      }
    });
    return () => unsub();
  }, [lobbyId]);

  const joinLobby = async () => {
    const docRef = doc(db, "games", lobbyId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        players: {
          [playerId]: {
            hand: [getRandomCard(), getRandomCard(), getRandomCard()],
            selected: null,
            influence: 0,
          },
        },
        step: "select",
      });
    } else {
      await updateDoc(docRef, {
        [`players.${playerId}`]: {
          hand: [getRandomCard(), getRandomCard(), getRandomCard()],
          selected: null,
          influence: 0,
        },
      });
    }
  };

  const selectCard = async (card) => {
    const docRef = doc(db, "games", lobbyId);
    await updateDoc(docRef, {
      [`players.${playerId}.selected`]: card,
    });
  };

  if (!gameData) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Nova Trahison - Lobby</h1>
        <input
          type="text"
          placeholder="Nom du lobby"
          value={lobbyId}
          onChange={(e) => setLobbyId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Votre ID"
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
        />
        <button onClick={joinLobby}>Rejoindre</button>
      </div>
    );
  }

  const player = gameData.players[playerId];
  const opponentId = Object.keys(gameData.players).find((id) => id !== playerId);
  const opponent = gameData.players[opponentId];

  return (
    <div style={{ padding: 20 }}>
      <h1>Nova Trahison - {lobbyId}</h1>
      <h2>Vous êtes : {playerId}</h2>

      <div>
        <h3>Votre influence : {player.influence}</h3>
        <div>
          {gameData.step === "select" &&
            player.hand.map((card, idx) => (
              <button
                key={idx}
                onClick={() => selectCard(card)}
                style={{ margin: 5 }}
              >
                {card.name} ({card.effect})
              </button>
            ))}
          {player.selected && <p>Carte jouée : {player.selected.name}</p>}
        </div>
      </div>

      <div>
        <h3>Adversaire : {opponentId ?? "En attente"}</h3>
        <p>Influence : {opponent?.influence ?? "?"}</p>
        {opponent?.selected && <p>Carte jouée : {opponent.selected.name}</p>}
      </div>
    </div>
  );
}
