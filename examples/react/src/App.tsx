import React, { useState } from "react";
import { useDemoGhost } from "@demoghost/react";
import { click, type, wait, highlight } from "demoghost";

export const App: React.FC = () => {
  const { play, isPlaying } = useDemoGhost();
  const [items, setItems] = useState<string[]>(["Initial Project"]);
  const [text, setText] = useState("");

  const handlePlay = () => {
    play([
      click("#todo-input"),
      type("#todo-input", "Interactive React Demo"),
      wait(200),
      click("#add-btn"),
      highlight(".item:last-child", { duration: 1000 })
    ]);
  };

  const handleAdd = () => {
    if (!text) return;
    setItems([...items, text]);
    setText("");
  };

  return (
    <div style={{ padding: 40, maxWidth: 500, margin: "0 auto" }}>
      <h2>React DemoGhost Integration</h2>
      <button onClick={handlePlay} disabled={isPlaying} style={{ marginBottom: 20 }}>
        {isPlaying ? "Playing..." : "Play Live Demo"}
      </button>

      <div>
        <input
          id="todo-input"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="New Task"
          style={{ padding: 8, marginRight: 8 }}
        />
        <button id="add-btn" onClick={handleAdd} style={{ padding: 8 }}>
          Add
        </button>
      </div>

      <ul style={{ marginTop: 20 }}>
        {items.map((item, i) => (
          <li key={i} className="item" style={{ padding: 6 }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};
