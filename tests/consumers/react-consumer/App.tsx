import React from "react";
import { DemoGhostProvider, useDemoGhost } from "@demoghostjs/react";
import { click, type } from "demoghost";

function DemoButton() {
  const { play, isPlaying } = useDemoGhost();

  const handleStart = () => {
    play([click("#btn"), type("#input", "Testing React 19 integration")]);
  };

  return (
    <button onClick={handleStart} disabled={isPlaying}>
      {isPlaying ? "Playing..." : "Start Tour"}
    </button>
  );
}

export default function App() {
  return (
    <DemoGhostProvider>
      <main>
        <h1>React Consumer App</h1>
        <DemoButton />
      </main>
    </DemoGhostProvider>
  );
}
