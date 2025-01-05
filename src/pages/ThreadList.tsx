import React, { useCallback, useEffect, useState } from "react";
import {
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  CircularProgress,
  Box,
  Alert,
} from "@mui/material";
import BASE_URL from "../config";
import "../styles/ThreadList.css";
import { useLocation } from "react-router-dom";

type Thread = {
  id: number;
  title: string;
};

const ThreadList: React.FC = () => {
  const location = useLocation();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/threads?offset=${offset}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data: Thread[] = await response.json();
      setThreads((prevThreads) => [...prevThreads, ...data]);
      setHasMore(data.length === 10);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  useEffect(() => {
    if (location.state?.message) {
      const timer = setTimeout(() => {
        location.state.message = null;
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    setOffset((prevOffset) => prevOffset + 10);
  };

  return (
    <Container className="thread-list-container">
      {location.state?.message && (
        <Alert severity="success" style={{ marginBottom: "16px" }}>
          {location.state.message}
        </Alert>
      )}
      <Typography variant="h4" align="center" gutterBottom>
        スレッド一覧
      </Typography>
      {error && (
        <Typography color="error" align="center" gutterBottom>
          エラー: {error}
        </Typography>
      )}

      {threads.length === 0 && !loading && (
        <Typography align="center" gutterBottom>
          スレッドが見つかりません。
        </Typography>
      )}

      {/* スレッド一覧 */}
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        gap={3}
        marginTop={2}
      >
        {threads.map((thread) => (
          <Box
            key={thread.id}
            width={{ xs: "100%", sm: "48%", md: "30%" }}
            display="flex"
            flexDirection="column"
          >
            <Card className="thread-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {thread.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  スレッドID: {thread.id}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* ロードボタン */}
      <div className="load-more-container">
        {loading ? (
          <CircularProgress />
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={loadMore}
            disabled={!hasMore}
          >
            {hasMore ? "さらに読み込む" : "すべて読み込み済み"}
          </Button>
        )}
      </div>

      {/* 新規スレッド作成ボタン */}
      <Box display="flex" justifyContent="center" marginTop={2}>
        <Button variant="contained" color="success" href="/threads/new">
          新規スレッド作成
        </Button>
      </Box>
    </Container>
  );
};

export default ThreadList;
