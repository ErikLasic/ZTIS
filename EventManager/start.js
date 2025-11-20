#!/usr/bin/env node

/**
 * Startup script for Render deployment
 * - Checks if database exists
 * - Initializes database if needed
 * - Starts the server
 */

const { spawn } = require('child_process');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

console.log('🚀 Starting EventManager...');

// Check if database exists and has tables
const dbExists = fs.existsSync('./database.db');

if (!dbExists) {
    console.log('📦 Database file not found, will initialize...');
    initializeDatabase();
} else {
    // Check if tables exist
    const db = new sqlite3.Database('./database.db');
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
        db.close();
        
        if (err) {
            console.error('❌ Error checking database:', err.message);
            process.exit(1);
        }
        
        if (!row) {
            console.log('📦 Database exists but tables not found, initializing...');
            initializeDatabase();
        } else {
            console.log('✅ Database already initialized');
            startServer();
        }
    });
}

function initializeDatabase() {
    console.log('🔧 Running database initialization...');
    
    const initProcess = spawn('node', ['init-db.js'], {
        stdio: 'inherit'
    });
    
    initProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`❌ Database initialization failed with code ${code}`);
            process.exit(1);
        }
        console.log('✅ Database initialized successfully');
        startServer();
    });
    
    initProcess.on('error', (err) => {
        console.error('❌ Failed to start initialization:', err);
        process.exit(1);
    });
}

function startServer() {
    console.log('🌐 Starting Express server...');
    
    const serverProcess = spawn('node', ['server.js'], {
        stdio: 'inherit'
    });
    
    serverProcess.on('error', (err) => {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    });
    
    // Forward signals to server process
    process.on('SIGTERM', () => {
        serverProcess.kill('SIGTERM');
    });
    
    process.on('SIGINT', () => {
        serverProcess.kill('SIGINT');
    });
}
