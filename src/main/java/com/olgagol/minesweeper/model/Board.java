package com.olgagol.minesweeper.model;

import java.util.LinkedList;
import java.util.Queue;
import java.util.Random;

public class Board {
    private Tile[][] tiles;
    private int width;
    private int height;
    private int numKittens;
    private boolean gameOver;
    private boolean hasWon;
    
    // Direction arrays for BFS
    private static final int[] DROWS = new int[] { 0, 1, -1, 0, 1, -1, 1, -1 };
    private static final int[] DCOLS = new int[] { 1, 0, 0, -1, 1, -1, -1, 1 };
    
    public Board(int width, int height, int numKittens) {
        this.width = width;
        this.height = height;
        this.numKittens = numKittens;
        this.gameOver = false;
        this.hasWon = false;
        
        // Initialize the board
        initializeBoard();
        placeKittens();
    }
    
    private void initializeBoard() {
        tiles = new Tile[width][height];
        
        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                // Place walls around edges
                if (x == 0 || x == width - 1 || y == 0 || y == height - 1) {
                    tiles[x][y] = new Tile(Tile.WALL);
                } else {
                    tiles[x][y] = new Tile(Tile.UNREVEALED);
                }
            }
        }
    }
    
    private void placeKittens() {
        Random random = new Random();
        int kittensPlaced = 0;
        
        while (kittensPlaced < numKittens) {
            int x = random.nextInt(width - 2) + 1; // Avoid walls
            int y = random.nextInt(height - 2) + 1; // Avoid walls
            
            if (tiles[x][y].getType() != Tile.UNREVEALED_KITTEN) {
                tiles[x][y].setType(Tile.UNREVEALED_KITTEN);
                tiles[x][y].setKittenValue(random.nextInt(8)); // 0-7 for different kitten sprites
                kittensPlaced++;
            }
        }
    }
    
    public void revealTile(int x, int y) {
        if (!isValid(x, y) || gameOver || tiles[x][y].isFlagged()) {
            return;
        }
        
        bfs(x, y);
        
        // Check win condition
        if (checkWinCondition()) {
            gameOver = true;
            hasWon = true;
        }
    }
    
    private void bfs(int x, int y) {
        Queue<int[]> queue = new LinkedList<>();
        queue.offer(new int[] { x, y });
        
        while (!queue.isEmpty()) {
            int[] coordinates = queue.poll();
            int currentX = coordinates[0];
            int currentY = coordinates[1];
            
            // Skip if already revealed or flagged
            if (tiles[currentX][currentY].isRevealed() || tiles[currentX][currentY].isFlagged()) {
                continue;
            }
            
            // Check if kitten
            if (tiles[currentX][currentY].getType() == Tile.UNREVEALED_KITTEN) {
                tiles[currentX][currentY].setType(Tile.REVEALED_KITTEN);
                gameOver = true;
                hasWon = false;
                revealAllKittens();
                return;
            }
            
            // Count neighboring kittens
            int neighboringKittens = countNeighboringKittens(currentX, currentY);
            
            if (neighboringKittens > 0) {
                // Set tile to show number of neighboring kittens
                tiles[currentX][currentY].setType(neighboringKittens);
            } else {
                // Empty tile with no neighboring kittens
                tiles[currentX][currentY].setType(Tile.EMPTY);
                
                // Explore neighbors ONLY if this is an empty tile
                for (int i = 0; i < 8; i++) {
                    int newX = currentX + DROWS[i];
                    int newY = currentY + DCOLS[i];
                    
                    // Only add unrevealed, non-kitten tiles to the queue
                    if (isValid(newX, newY) && 
                        tiles[newX][newY].getType() == Tile.UNREVEALED &&
                        !tiles[newX][newY].isFlagged()) {
                        queue.offer(new int[] { newX, newY });
                    }
                }
            }
        }
    }
    
    private int countNeighboringKittens(int x, int y) {
        int count = 0;
        
        for (int i = 0; i < 8; i++) {
            int newX = x + DROWS[i];
            int newY = y + DCOLS[i];
            
            if (isValid(newX, newY) && 
                (tiles[newX][newY].getType() == Tile.UNREVEALED_KITTEN || 
                 tiles[newX][newY].getType() == Tile.REVEALED_KITTEN)) {
                count++;
            }
        }
        
        return count;
    }
    
    private boolean checkWinCondition() {
        for (int x = 1; x < width - 1; x++) {
            for (int y = 1; y < height - 1; y++) {
                // If there's an unrevealed tile that's not a kitten, game isn't won yet
                if (tiles[x][y].getType() == Tile.UNREVEALED) {
                    return false;
                }
            }
        }
        return true;
    }
    
    public void toggleFlag(int x, int y) {
        if (isValid(x, y) && !gameOver && !tiles[x][y].isRevealed()) {
            tiles[x][y].toggleFlag();
        }
    }
    
    public void revealAllKittens() {
        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                if (tiles[x][y].getType() == Tile.UNREVEALED_KITTEN) {
                    tiles[x][y].setType(Tile.REVEALED_KITTEN);
                }
                tiles[x][y].setFlagged(false);
            }
        }
    }
    
    private boolean isValid(int x, int y) {
        return x > 0 && y > 0 && x < width - 1 && y < height - 1;
    }
    
    // Getters and setters
    public Tile getTile(int x, int y) {
        return tiles[x][y];
    }
    
    public int getWidth() {
        return width;
    }
    
    public int getHeight() {
        return height;
    }
    
    public int getNumKittens() {
        return numKittens;
    }
    
    public boolean isGameOver() {
        return gameOver;
    }
    
    public boolean hasWon() {
        return hasWon;
    }
    
    public void reset() {
        gameOver = false;
        hasWon = false;
        initializeBoard();
        placeKittens();
    }
    
    // For JSON serialization
    public Tile[][] getTiles() {
        return tiles;
    }
}