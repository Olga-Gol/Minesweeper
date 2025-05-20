package com.olgagol.minesweeper.model;

import java.util.UUID;

public class GameState {
    
    public enum Difficulty {
        EASY, MEDIUM, HARD
    }
    
    private String id;
    private Board board;
    private Difficulty difficulty;
    private int timeRemaining; // in seconds
    private boolean gameActive;
    
    public GameState(Difficulty difficulty) {
        this.id = UUID.randomUUID().toString();
        this.difficulty = difficulty;
        this.gameActive = true;
        
        // Set up based on difficulty (from your original code)
        switch (difficulty) {
            case EASY:
                this.board = new Board(11, 11, 9);
                this.timeRemaining = 4 * 60; // 4 minutes in seconds
                break;
            case MEDIUM:
                this.board = new Board(14, 11, 13);
                this.timeRemaining = 3 * 60; // 3 minutes in seconds
                break;
            case HARD:
                this.board = new Board(17, 11, 16);
                this.timeRemaining = 3 * 60; // 3 minutes in seconds
                break;
            default:
                this.board = new Board(11, 11, 9);
                this.timeRemaining = 4 * 60; // Default to EASY
                break;
        }
    }
    
    public void updateTime(int secondsElapsed) {
        if (gameActive && !board.isGameOver()) {
            timeRemaining -= secondsElapsed;
            
            if (timeRemaining <= 0) {
                timeRemaining = 0;
                board.revealAllKittens();
                gameActive = false;
            }
        }
    }
    
    // Getters and setters
    public String getId() {
        return id;
    }
    
    public Board getBoard() {
        return board;
    }
    
    public Difficulty getDifficulty() {
        return difficulty;
    }
    
    public int getTimeRemaining() {
        return timeRemaining;
    }
    
    public boolean isGameActive() {
        return gameActive && !board.isGameOver();
    }
    
    public String getFormattedTime() {
        int minutes = timeRemaining / 60;
        int seconds = timeRemaining % 60;
        return String.format("%d:%02d", minutes, seconds);
    }
    
    public void reset() {
        board.reset();
        
        // Reset timer based on difficulty
        switch (difficulty) {
            case EASY:
                this.timeRemaining = 4 * 60; // 4 minutes in seconds
                break;
            case MEDIUM:
            case HARD:
                this.timeRemaining = 3 * 60; // 3 minutes in seconds
                break;
            default:
                this.timeRemaining = 4 * 60; // Default to EASY
                break;
        }
        
        gameActive = true;
    }
}