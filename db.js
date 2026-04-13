import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

export async function getDb() {
  if (db) return db;

  db = await open({
    filename: path.join(__dirname, 'fintrack.db'),
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA foreign_keys = ON;');
  return db;
}
