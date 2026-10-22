/**
 * config.js
 * Constants shared across modules. Everything hangs off the global `TTT` namespace.
 */
(function (global) {
  'use strict';

  const TTT = (global.TTT = global.TTT || {});

  TTT.CONFIG = Object.freeze({
    marks: Object.freeze({ X: 'X', O: 'O' }),
    cellCount: 9,
    columns: 3,
    centreCell: 4,

    // Every winning combination of cell indexes (rows, columns, diagonals).
    winLines: Object.freeze([
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ]),

    gameOverDelayMs: 800,    // pause so players can see the winning line first
    restartLockoutMs: 300,   // stops key-mashing from instantly skipping Game Over
    storageKey: 'tic-tac-toe:scores',
  });
})(window);
