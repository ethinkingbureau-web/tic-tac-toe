/**
 * scoreboard.js
 * Tracks wins for X and O plus draws, and remembers them between visits.
 */
(function (global) {
  'use strict';

  const { CONFIG } = global.TTT;
  const EMPTY = Object.freeze({ X: 0, O: 0, draws: 0 });

  class Scoreboard {
    constructor() {
      this.scores = this._load();
    }

    /** @param {string|null} winner 'X', 'O', or null for a draw */
    record(winner) {
      if (winner) this.scores[winner] += 1;
      else this.scores.draws += 1;
      this._save();
    }

    reset() {
      this.scores = { ...EMPTY };
      this._save();
    }

    _load() {
      try {
        const saved = JSON.parse(localStorage.getItem(CONFIG.storageKey));
        if (saved && ['X', 'O', 'draws'].every((k) => Number.isInteger(saved[k]) && saved[k] >= 0)) {
          return { X: saved.X, O: saved.O, draws: saved.draws };
        }
      } catch (_) {
        /* storage unavailable or corrupt: start fresh */
      }
      return { ...EMPTY };
    }

    _save() {
      try {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(this.scores));
      } catch (_) {
        /* ignore */
      }
    }
  }

  global.TTT.Scoreboard = Scoreboard;
})(window);
