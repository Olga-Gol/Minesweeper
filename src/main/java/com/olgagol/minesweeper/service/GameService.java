package com.olgagol.minesweeper.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.olgagol.minesweeper.model.GameState;
import com.olgagol.minesweeper.model.GameState.Difficulty;

@Service
public class GameService {
    
    private Map<String, GameState> activeGames = new HashMap<>();
    
    public GameState createGame(Difficulty difficulty) {
        GameState newGame = new GameState(difficulty);
        activeGames.put(newGame.getId(), newGame);
        return newGame;
    }
    
    public GameState getGame(String gameId) {
        return activeGames.get(gameId);
    }
    
    public GameState revealTile(String gameId, int x, int y) {
        GameState game = activeGames.get(gameId);
        if (game != null && game.isGameActive()) {
            game.getBoard().revealTile(x,y); 
        }
        return game;
    }
    
    public GameState toggleFlag(String gameId, int x, int y) {
        GameState game = activeGames.get(gameId);
        if (game != null && game.isGameActive()) {
            game.getBoard().toggleFlag(x, y);
        }
        return game;
    }
    
    public GameState updateGameTime(String gameId, int secondsElapsed) {
        GameState game = activeGames.get(gameId);
        if (game != null) {
            game.updateTime(secondsElapsed);
        }
        return game;
    }
    
    public GameState resetGame(String gameId) {
        GameState game = activeGames.get(gameId);
        if (game != null) {
            game.reset();
        }
        return game;
    }
    
    public void removeGame(String gameId) {
        activeGames.remove(gameId);
    }
}