import app, { connectDB } from '../app.js';

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
