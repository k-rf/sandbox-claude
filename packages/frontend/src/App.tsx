import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Counter from './components/Counter';
import TodoList from './components/TodoList';
import ApiDemo from './components/ApiDemo';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header>
          <h1>Claude Code デモアプリ</h1>
          <nav>
            <Link to="/">ホーム</Link>
            <Link to="/counter">カウンター</Link>
            <Link to="/todos">TODOリスト</Link>
            <Link to="/api">API連携</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/counter" element={<Counter />} />
            <Route path="/todos" element={<TodoList />} />
            <Route path="/api" element={<ApiDemo />} />
          </Routes>
        </main>

        <footer>
          <p>Powered by Claude Code</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function Home() {
  return (
    <div className="home">
      <h2>ようこそ！</h2>
      <p>このモノレポでClaude Codeの様々な機能を試すことができます。</p>
      <ul>
        <li>React + TypeScript フロントエンド</li>
        <li>Node.js + Express バックエンド</li>
        <li>共有TypeScriptライブラリ</li>
        <li>Python CLIツール</li>
      </ul>
    </div>
  );
}

export default App;
