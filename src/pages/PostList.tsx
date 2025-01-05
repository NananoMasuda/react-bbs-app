import React, { useCallback, useEffect, useState } from "react";
import {
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  CircularProgress,
  Box,
  TextField,
  Alert,
} from "@mui/material";
import BASE_URL from "../config";
import { useParams } from "react-router-dom";

type Post = {
  id: string;
  post: string;
};

const PostList: React.FC = () => {
  const { thread_id } = useParams<{ thread_id: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState<string>(""); // フォーム入力値
  const [offset, setOffset] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // 投稿一覧を取得
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/threads/${thread_id}/posts?offset=${offset}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      if (data.posts && Array.isArray(data.posts)) {
        setPosts((prevPosts) => [...prevPosts, ...data.posts]);
        setHasMore(data.posts.length === 10);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [thread_id, offset]);

  // 初期データ取得
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 新しい投稿をサーバーに送信
  const handlePostSubmit = async () => {
    if (newPost.trim() === "") {
      setFormError("投稿内容を入力してください。");
      return;
    }

    try {
      setFormError(null);
      setFormSuccess(null);

      // サーバーに新しい投稿を送信
      const response = await fetch(`${BASE_URL}/threads/${thread_id}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ post: newPost }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      setNewPost(""); // フォーム入力をリセット
      setFormSuccess("投稿が完了しました！");

      // 投稿後に投稿一覧をリセットして再取得
      setOffset(0); // offset をリセット
      const data = await fetch(
        `${BASE_URL}/threads/${thread_id}/posts?offset=0`
      ).then((res) => res.json());

      // サーバーから取得したデータで完全に上書き
      setPosts(data.posts || []);
      setHasMore(data.posts.length === 10);
    } catch (err) {
      console.error("エラー詳細:", err);
      setFormError("投稿に失敗しました。もう一度試してください。");
    }
  };

  // 投稿のロード
  const loadMore = () => {
    if (!hasMore || loading) return;
    setOffset((prevOffset) => prevOffset + 10);
  };

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        投稿一覧 (スレッドID: {thread_id})
      </Typography>
      {error && (
        <Typography color="error" align="center" gutterBottom>
          エラー: {error}
        </Typography>
      )}

      {/* 投稿フォーム */}
      <Box marginBottom={2}>
        <Typography variant="h5">新しい投稿を追加</Typography>
        {formError && <Alert severity="error">{formError}</Alert>}
        {formSuccess && <Alert severity="success">{formSuccess}</Alert>}
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          marginTop={1}
          style={{
            backgroundColor: "#ffffff",
            padding: "16px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <TextField
            label="投稿内容"
            variant="outlined"
            fullWidth
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            InputProps={{
              style: { color: "#000000" }, // 文字色を黒に変更
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handlePostSubmit}
          >
            投稿
          </Button>
        </Box>
      </Box>

      {/* 投稿一覧 */}
      {posts.length === 0 && !loading && (
        <Typography align="center" gutterBottom>
          投稿が見つかりません。
        </Typography>
      )}
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        gap={3}
        marginTop={2}
      >
        {posts.map((post) => (
          <Box
            key={post.id}
            width={{ xs: "100%", sm: "48%", md: "30%" }}
            display="flex"
            flexDirection="column"
          >
            <Card>
              <CardContent>
                <Typography variant="body1" gutterBottom>
                  {post.post}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  投稿ID: {post.id}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* ロードボタン */}
      <div style={{ textAlign: "center", margin: "16px 0" }}>
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

      {/* スレッド一覧に戻るボタン */}
      <Box display="flex" justifyContent="center" marginTop={2}>
        <Button variant="contained" color="info" href="/threads">
          スレッド一覧に戻る
        </Button>
      </Box>
    </Container>
  );
};

export default PostList;
