/**
 * ui.js
 * All DOM work lives here. The game logic never touches the page directly.
 */
(function (global) {
  'use strict';

  const { CONFIG } = global.TTT;

  const MARK_SVG = {
    X: '<svg viewBox="0 0 100 100" aria-hidden="true" class="mark--x">' +
       '<path class="stroke" pathLength="100" d="M18 18 L82 82"/>' +
       '<path class="stroke" pathLength="100" d="M82 18 L18 82"/></svg>',
    O: '<svg viewBox="0 0 100 100" aria-hidden="true" class="mark--o">' +
       '<circle class="stroke" pathLength="100" cx="50" cy="50" r="33"/></svg>',
  };

  class UI {
    /**
     * @param {object} els DOM references
     * @param {HTMLElement} els.board
     * @param {HTMLElement} els.status
     * @param {HTMLElement} els.overlay
     * @param {HTMLElement} els.result
     * @param {HTMLButtonElement} els.restartButton
     * @param {HTMLButtonElement} els.resetScoresButton
     * @param {{X:HTMLElement, O:HTMLElement, draws:HTMLElement}} els.scores
     */
    constructor(els) {
      this.els = els;
      this.cellEls = [];
      this._rendered = Array(CONFIG.cellCount).fill(null);
    }

    /** Creates the nine squares once. Handlers are supplied by the game. */
    buildBoard({ onCellClick, onCellHover }) {
      for (let i = 0; i < CONFIG.cellCount; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.setAttribute('role', 'gridcell');
        cell.addEventListener('click', () => onCellClick(i));
        cell.addEventListener('pointerenter', (e) => {
          if (e.pointerType === 'mouse') onCellHover(i);
        });
        this.els.board.appendChild(cell);
        this.cellEls.push(cell);
      }
    }

    /**
     * @param {{cells:(string|null)[], cursor:number, showCursor:boolean, winLine:number[]|null}} view
     */
    renderBoard({ cells, cursor, showCursor, winLine }) {
      this.cellEls.forEach((el, i) => {
        // Only rewrite a square when its mark changes, so the draw animation plays once.
        if (this._rendered[i] !== cells[i]) {
          el.innerHTML = cells[i] ? MARK_SVG[cells[i]] : '';
          this._rendered[i] = cells[i];
        }
        el.classList.toggle('cell--filled', cells[i] !== null);
        el.classList.toggle('cell--cursor', showCursor && i === cursor);
        el.classList.toggle('cell--win', Boolean(winLine && winLine.includes(i)));
        el.setAttribute('aria-label', `Square ${i + 1}: ${cells[i] || 'empty'}`);
      });
    }

    rejectCell(index) {
      const el = this.cellEls[index];
      el.classList.remove('cell--rejected');
      void el.offsetWidth; // restart the CSS animation
      el.classList.add('cell--rejected');
    }

    setStatus(html) {
      this.els.status.innerHTML = html;
    }

    renderScores(scores) {
      this.els.scores.X.textContent = scores.X;
      this.els.scores.O.textContent = scores.O;
      this.els.scores.draws.textContent = scores.draws;
    }

    showGameOver(message) {
      this.els.result.textContent = message;
      this.els.overlay.hidden = false;
      this.els.restartButton.focus({ preventScroll: true });
    }

    hideGameOver() {
      this.els.overlay.hidden = true;
      this.els.restartButton.blur(); // so Space doesn't re-trigger the button
    }

    bindRestart(handler) {
      this.els.restartButton.addEventListener('click', handler);
    }

    bindResetScores(handler) {
      this.els.resetScoresButton.addEventListener('click', (e) => {
        handler();
        e.currentTarget.blur();
      });
    }
  }

  global.TTT.UI = UI;
})(window);
