package com.olgagol.minesweeper.model;

public class Tile {
    
    // Constants for tile types (similar to your original code)
    public static final int WALL = 0;
    public static final int UNREVEALED = -1;
    public static final int EMPTY = -2;
    public static final int UNREVEALED_KITTEN = -3;
    public static final int REVEALED_KITTEN = -4;
    
    private int type;
    private boolean flagged;
    private int kittenValue; // Used for drawing specific kitten images (0-7)
    
    public Tile(int type) {
        this.type = type;
        this.flagged = false;
        this.kittenValue = 0;
    }
    
    // Getters and setters
    public int getType() {
        return type;
    }
    
    public void setType(int type) {
        this.type = type;
    }
    
    public boolean isFlagged() {
        return flagged;
    }
    
    public void setFlagged(boolean flagged) {
        this.flagged = flagged;
    }
    
    public void toggleFlag() {
        this.flagged = !this.flagged;
    }
    
    public int getKittenValue() {
        return kittenValue;
    }
    
    public void setKittenValue(int kittenValue) {
        this.kittenValue = kittenValue;
    }
    
    public boolean isRevealed() {
        return type != UNREVEALED && type != UNREVEALED_KITTEN;
    }
    
    public boolean isKitten() {
        return type == UNREVEALED_KITTEN || type == REVEALED_KITTEN;
    }
}