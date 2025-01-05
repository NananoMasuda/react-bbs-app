import React, { useState } from "react";
import { Container, Typography, TextField, Button, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../config";

const API_URL = `${BASE_URL}/threads`;

const ThreadNew: React.FC = () => {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const createThread = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create thread: ${response.status}`);
      }

      // 成功したら一覧ページに遷移し、メッセージを渡す
      navigate("/threads", { state: { message: "更新しました！" } });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        新規スレッド作成
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={createThread}>
        <TextField
          label="スレッドタイトル"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ backgroundColor: "#f5f5f5", borderRadius: "4px" }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!title.trim() || loading}
          style={{ marginTop: "16px" }}
        >
          {loading ? "作成中..." : "作成"}
        </Button>
      </form>
    </Container>
  );
};

export default ThreadNew;
