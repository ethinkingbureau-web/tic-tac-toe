/**
 * game.js
 * The controller: owns turn order, the cursor and the state machine
 * (playing -> ending -> over), and connects Board, Scoreboard, Input and UI.
 */
(function (global) {
  'use strict';

  const { CONFIG, Board, Scoreboard, Input, UI } = global.TTT;
  const { X, O } = CONFIG.marks;

  const STATE = Object.freeze({ PLAYING: 'playing', ENDING: 'ending', OVER: 'over' });
  const other = (mark) => (mark === X ? O : X);

  class Game {
    /**
     * @param {object} els DOM references (see UI)
     * @param {{burst:function(number, number):void}} [fireworks] optional effects module
     */
    constructor(els, fireworks) {
      this.fireworks = fireworks || null;
      this.board = new Board();
      this.scoreboard = new Scoreboard();
      this.input = new Input();
      this.ui = new UI(els);

      this.state = STATE.PLAYING;
      this.startingMark = X;   // alternates each round so neither player always goes first
      this.current = X;
      this.cursor = CONFIG.centreCell;
      this.keyboardActive = false; // show the highlight only once the keyboard or mouse is used
      this.result = null;
      this.overAt = 0;
    }

    init() {
      this.ui.buildBoard({
        onCellClick: (i) => this._handleCellClick(i),
        onCellHover: (i) => this._setCursor(i),
      });
      this.ui.bindRestart(() => this.restart());
      this.ui.bindResetScores(() => {
        this.scoreboard.reset();
        this.ui.renderScores(this.scoreboard.scores);
      });

      this.input.onMove = (delta) => this._moveCursor(delta);
      this.input.onPlace = () => this._handlePlaceKey();
      this.input.attach();

      this.ui.renderScores(this.scoreboard.scores);
      this._render();
    }

    /* ------------------------------ actions ------------------------------ */

    /** @returns {boolean} true if a mark was placed */
    place(index) {
      if (this.state !== STATE.PLAYING) return false;

      if (!this.board.place(index, this.current)) {
        this.ui.rejectCell(index); // square already taken
        return false;
      }

      this.result = this.board.getResult();
      if (this.result) {
        this._endRound();
      } else {
        this.current = other(this.current);
      }
      this._render();
      return true;
    }

    restart() {
      if (this.state !== STATE.OVER) return;
      if (performance.now() - this.overAt < CONFIG.restartLockoutMs) return;

      this.board.reset();
      this.startingMark = other(this.startingMark);
      this.current = this.startingMark;
      this.cursor = CONFIG.centreCell;
      this.result = null;
      this.state = STATE.PLAYING;

      this.ui.hideGameOver();
      this._render();
    }

    /* ------------------------------ internals ------------------------------ */

    _endRound() {
      this.state = STATE.ENDING;
      this.scoreboard.record(this.result.winner);
      this.ui.renderScores(this.scoreboard.scores);

      // Let players see the winning line before the Game Over screen appears.
      setTimeout(() => {
        this.state = STATE.OVER;
        this.overAt = performance.now();
        this.ui.showGameOver(this.result.winner ? `${this.result.winner} wins!` : "It's a draw!");
      }, CONFIG.gameOverDelayMs);
    }

    _handlePlaceKey() {
      if (this.state === STATE.OVER) {
        this.restart();
        return;
      }
      // First key press only reveals the highlight, so nothing is placed by surprise.
      if (!this.keyboardActive) {
        this.keyboardActive = true;
        this._render();
        return;
      }
      // Mouse clicks already launch a firework (see Fireworks.attach); keyboard placements get one here.
      if (this.place(this.cursor) && this.fireworks) {
        const { x, y } = this.ui.getCellCenter(this.cursor);
        this.fireworks.burst(x, y);
      }
    }

    _handleCellClick(index) {
      this.cursor = index;
      this.place(index);
    }

    _moveCursor(delta) {
      if (this.state !== STATE.PLAYING) return;
      const n = CONFIG.cellCount;
      // First key press just reveals the highlight; later presses move it.
      if (this.keyboardActive) this.cursor = (this.cursor + delta + n) % n;
      this.keyboardActive = true;
      this._render();
    }

    _setCursor(index) {
      if (this.state !== STATE.PLAYING) return;
      this.cursor = index;
      this.keyboardActive = true;
      this._render();
    }

    _render() {
      this.ui.renderBoard({
        cells: this.board.cells,
        cursor: this.cursor,
        showCursor: this.keyboardActive && this.state === STATE.PLAYING,
        winLine: this.result ? this.result.line : null,
      });

      if (this.state === STATE.PLAYING) {
        const m = this.current;
        this.ui.setStatus(`<span class="mark-${m.toLowerCase()}">${m}</span>'s turn`);
      } else if (this.result && this.result.winner) {
        const w = this.result.winner;
        this.ui.setStatus(`<span class="mark-${w.toLowerCase()}">${w}</span> wins!`);
      } else {
        this.ui.setStatus("It's a draw!");
      }
    }
  }

  global.TTT.Game = Game;
})(window);
