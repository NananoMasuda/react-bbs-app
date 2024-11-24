import React, { useEffect, useState } from "react";
import { createTheme, ThemeProvider, CssBaseline, Typography, Button, Container } from "@mui/material";
import BASE_URL from "./config";
import "./App.css";

type Thread = {
  id: number;
  title: string;
};

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#ff9800" }, // オレンジアクセント
    background: { default: "#121212", paper: "#1e1e1e" },
    text: { primary: "#e0e0e0", secondary: "#bbb" },
  },
});

const App: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]); // スレッド一覧
  const [offset, setOffset] = useState<number>(0); // 現在のオフセット
  const [loading, setLoading] = useState<boolean>(true); // ローディング状態
  const [error, setError] = useState<string | null>(null); // エラーメッセージ
  const [hasMore, setHasMore] = useState<boolean>(true); // 次のデータがあるかどうか

  // スレッド一覧を取得する関数
  const fetchThreads = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/threads?offset=${offset}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data: Thread[] = await response.json();

      setThreads((prevThreads) => [...prevThreads, ...data]); // 取得データを既存データに追加
      setHasMore(data.length === 10); // 取得データが10件未満なら次のデータはない
      setLoading(false);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  // 初回データ取得
  useEffect(() => {
    fetchThreads();
  }, [offset]);

  // 次のデータを取得する関数
  const loadMore = () => {
    if (!hasMore || loading) return; // 次のデータがない、またはローディング中なら実行しない
    setOffset((prevOffset) => prevOffset + 10); // オフセットを更新
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container className="app-container">
        <Typography variant="h4" className="app-title">
          スレッド一覧
        </Typography>
        {error && <Typography className="error-message">エラー: {error}</Typography>}
        <ul className="thread-list">
          {threads.map((thread) => (
            <li key={thread.id} className="thread-item">
              <span className="thread-author"> - {thread.title}</span>
            </li>
          ))}
        </ul>
        <Button
          className="load-more-button"
          onClick={loadMore}
          disabled={loading || !hasMore}
          variant="contained"
          color="primary"
        >
          {loading ? "読み込み中..." : hasMore ? "さらに読み込む" : "すべて読み込み済み"}
        </Button>
      </Container>
    </ThemeProvider>
  );
};

export default App;
