import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { trpc } from './trpc';

function App() {
  const [count, setCount] = useState(0);

  const { data } = trpc.taskList.useQuery({ name: 'Hello' });

  const createUser = trpc.createUser.useMutation();

  const handleUserCreation = async () => {
    const res = await createUser.mutateAsync({
      email: 'fabian.simon98@gmail.com',
      expertise: 'UI Design, Researching new Topics and Frontend Engineering',
      role: 'Full-Stack Developer',
      image_url:
        'https://gravatar.com/avatar/0584b215b5b354d0d358b027a289c37e?s=400&d=robohash&r=x',
    });
    console.log(res);
  };

  return (
    <>
      <div>
        <a
          href="https://vitejs.dev"
          target="_blank"
        >
          <img
            src={viteLogo}
            className="logo"
            alt="Vite logo"
          />
        </a>
        <a
          href="https://react.dev"
          target="_blank"
        >
          <img
            src={reactLogo}
            className="logo react"
            alt="React logo"
          />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={handleUserCreation}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
