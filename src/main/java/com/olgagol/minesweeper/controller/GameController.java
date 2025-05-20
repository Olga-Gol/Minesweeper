package com.olgagol.minesweeper.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.olgagol.minesweeper.model.GameState;
import com.olgagol.minesweeper.model.GameState.Difficulty;
import com.olgagol.minesweeper.service.GameService;

@Controller
public class GameController {
    
    @Autowired
    private GameService gameService;
    
    @GetMapping("/")
    public String showMainMenu() {
        return "index";
    }
    
    @GetMapping("/game")
    public String newGame(@RequestParam(defaultValue = "EASY") Difficulty difficulty, Model model) {
        GameState game = gameService.createGame(difficulty);
        model.addAttribute("gameId", game.getId());
        model.addAttribute("difficulty", difficulty);
        return "game";
    }
    
    @GetMapping("/game/{gameId}")
    @ResponseBody
    public GameState getGameState(@PathVariable String gameId) {
        return gameService.getGame(gameId);
    }
    
    @PostMapping("/game/{gameId}/reveal")
    @ResponseBody
    public GameState revealTile(
            @PathVariable String gameId,
            @RequestParam int x,
            @RequestParam int y) {
        return gameService.revealTile(gameId, x, y);
    }
    
    @PostMapping("/game/{gameId}/flag")
    @ResponseBody
    public GameState toggleFlag(
            @PathVariable String gameId,
            @RequestParam int x,
            @RequestParam int y) {
        return gameService.toggleFlag(gameId, x, y);
    }
    
    @PostMapping("/game/{gameId}/time")
    @ResponseBody
    public GameState updateTime(
            @PathVariable String gameId,
            @RequestParam int seconds) {
        return gameService.updateGameTime(gameId, seconds);
    }
    
    @PostMapping("/game/{gameId}/reset")
    @ResponseBody
    public GameState resetGame(@PathVariable String gameId) {
        return gameService.resetGame(gameId);
    }
    
    @PostMapping("/game/{gameId}/delete")
    public ResponseEntity<Void> deleteGame(@PathVariable String gameId) {
        gameService.removeGame(gameId);
        return ResponseEntity.ok().build();
    }
}