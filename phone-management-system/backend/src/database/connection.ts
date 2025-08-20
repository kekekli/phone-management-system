import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const DATABASE_PATH = process.env.DATABASE_URL || './database/app.db';

class Database {
  private db: sqlite3.Database | null = null;

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    const dbDir = path.dirname(DATABASE_PATH);
    
    // 确保数据库目录存在
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new sqlite3.Database(DATABASE_PATH, (err) => {
      if (err) {
        console.error('数据库连接失败:', err.message);
        process.exit(1);
      } else {
        console.log('数据库连接成功');
        this.enableForeignKeys();
      }
    });
  }

  private enableForeignKeys(): void {
    if (this.db) {
      this.db.run('PRAGMA foreign_keys = ON');
    }
  }

  public getConnection(): sqlite3.Database {
    if (!this.db) {
      throw new Error('数据库连接未初始化');
    }
    return this.db;
  }

  public async run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('数据库连接未初始化'));
        return;
      }

      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('数据库连接未初始化'));
        return;
      }

      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  public async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('数据库连接未初始化'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  public async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('数据库连接已关闭');
          resolve();
        }
      });
    });
  }
}

export const database = new Database();
export default database;