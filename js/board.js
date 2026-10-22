/**
 * board.js
 * Pure game rules: no DOM, no timers. Easy to reason about and test.
 */
(function (global) {
  'use strict';

  const { CONFIG } = global.TTT;

  class Board {
    constructor() {
      this.reset();
    }

    reset() {
      this.cells = Array(CONFIG.cellCount).fill(null);
    }

    isEmpty(index) {
      return this.cells[index] === null;
    }

    /** Places a mark. Returns false if the cell is taken or out of range. */
    place(index, mark) {
      if (!Number.isInteger(index) || index < 0 || index >= CONFIG.cellCount) return false;
      if (!this.isEmpty(index)) return false;
      this.cells[index] = mark;
      return true;
    }

    /**
     * @returns {{winner: string|null, line: number[]|null} | null}
     *   a win, a draw (winner and line are null), or null while play continues
     */
    getResult() {
      for (const line of CONFIG.winLines) {
        const [a, b, c] = line;
        const mark = this.cells[a];
        if (mark && mark === this.cells[b] && mark === this.cells[c]) {
          return { winner: mark, line };
        }
      }
      if (this.cells.every((cell) => cell !== null)) return { winner: null, line: null };
      return null;
    }
  }

  global.TTT.Board = Board;
})(window);
