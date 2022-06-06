import { useState, useEffect, useRef, useMemo, createRef } from 'react'
import { MatchGame, Status } from 'brackets-model';
import { BracketsManager } from 'brackets-manager';
import { InMemoryDatabase } from 'brackets-memory-db';

const URL = 'https://raw.githubusercontent.com/Drarig29/brackets-viewer.js/master/demo/db.json';

async function render(){
  // const data = await fetch(URL).then(res => res.json());
  // console.log(manager.get.storage.data)
  const data = await manager.get.tournamentData(1234);

  // console.log(data);

  const b = document.getElementById("bracketsViewer");
  b.innerHTML = '';

  console.log('rendering: ', data);

  window.bracketsViewer.render({
    stages: data.stage,
    matches: data.match,
    matchGames: data.match_game,
    participants: data.participant
  });

}

const storage = new InMemoryDatabase();
const manager = new BracketsManager(storage);

    (async() => {
      await manager.create({
        name: 'Initial Stage',
        tournamentId: 1234,
        type: 'single_elimination',
        settings: {
          size: 4,
          balanceByes: true,
          grandFinal: 'simple'
        },
        seeding: [
          'Team 1',
          'Team 2',
          'Team 3'
        ]
      });
    })();

function App() {
  const [matchGames, setMatchGames] = useState<any[]>([]);
  const matchesDomRef = useRef<any>(null);
  const opponent1 = useMemo<React.Ref<any>[]>(() => Array.from({length: matchGames.length}).map(() => createRef()), [matchGames.length]);
  const opponent2 = useMemo<React.Ref<any>[]>(() => Array.from({length: matchGames.length}).map(() => createRef()), [matchGames.length]);

  useEffect(() => {
    render();
  }, []);

  return (
    <div className="App">
      <div id='bracketsViewer' className="brackets-viewer"></div>
      <button onClick={ async () => {
        const data = await manager.get.tournamentData(1234);
        setMatchGames(data.match);
      }}> Show Matches </button>
      

      <button onClick={() => {
        render();
      }}> Render </button>
      
      <button onClick={async () => {

        await manager.update.matchChildCount('stage', 0, 1); // Set Bo2 for all the stage.
        
      }}> Update Child Count </button>

      <button onClick={() => {
        /* manager.reset; */
      }}> Reset </button>      

      <div ref={matchesDomRef}>
        { matchGames.map((m, index) =>
          
	  <div key={m.id}>
            { m?.opponent1?.id } vs { m?.opponent2?.id }
	    <input name="" type="number" ref={opponent1[index]}/>
	    <input name="" type="number" ref={opponent2[index]}/>
	    <button onClick={async () => {

              if(m.status === Status.Locked) {
                console.log(m.status);
                return;
              }

              let score1 = opponent1[index]?.current.value || 0;
              let score2 = opponent2[index]?.current.value || 0;

              await manager.update.match({
                id: m.id,
                opponent1: { id: m.opponent1.id, score: score1, result: score1 > score2 ? 'win' : 'loss' },
                opponent2: { id: m?.opponent2?.id, score: score2, result: score2 > score1 ? 'win' : 'loss' }
              })

              const data = await manager.get.tournamentData(1234);              

              render();
            }}> Submit Score </button>
	    <button onClick={ async () => {
              await manager.reset.matchResults(m.id);
              render();
            }}> Reset Game </button>
          </div>

        )}
      </div>

    </div>
  )
}

export default App
