/**
 * main.js
 * Entry point: find the DOM elements and boot the game.
 */
(function (global) {
  'use strict';

  window.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);

    const game = new global.TTT.Game({
      board: $('board'),
      status: $('status'),
      overlay: $('game-over'),
      result: $('game-over-title'),
      restartButton: $('restart-btn'),
      resetScoresButton: $('reset-scores-btn'),
      scores: { X: $('score-x'), O: $('score-o'), draws: $('score-draw') },
    });

    game.init();
    global.tttGame = game; // handy for debugging in the console
  });
})(window);
