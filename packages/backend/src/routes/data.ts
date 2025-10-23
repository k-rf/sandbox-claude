import express from "express";

export const dataRouter = express.Router();

// Sample data
const sampleData = {
  users: [
    { id: 1, name: "田中太郎", email: "tanaka@example.com" },
    { id: 2, name: "佐藤花子", email: "sato@example.com" },
    { id: 3, name: "鈴木一郎", email: "suzuki@example.com" },
  ],
  stats: {
    totalUsers: 3,
    activeUsers: 2,
    lastUpdate: new Date().toISOString(),
  },
};

// GET all data
dataRouter.get("/", (req, res) => {
  res.json(sampleData);
});

// GET users only
dataRouter.get("/users", (req, res) => {
  res.json(sampleData.users);
});

// GET specific user
dataRouter.get("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const user = sampleData.users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

// GET stats
dataRouter.get("/stats", (req, res) => {
  res.json(sampleData.stats);
});
