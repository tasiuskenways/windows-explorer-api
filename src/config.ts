export const config = {
  databaseUrl: process.env.DATABASE_URL ?? "postgres://explorer:explorer@localhost:5432/explorer",
  port: Number(process.env.API_PORT ?? 3000),
  defaultPageLimit: 100,
  maxPageLimit: 500,
  maxTreeNodes: 5000,
};
