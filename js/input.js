/**
 * input.js
 * Turns keyboard presses into two game-friendly callbacks:
 *   onMove(delta)  -> move the highlighted square (left -1, right +1, down +3)
 *   onPlace()      -> place a mark (Space, Up Arrow or Enter)
 */
(function (global) {
  'use strict';

  const { CONFIG } = global.TTT;

  const PLACE_KEYS = new Set(['Space', 'ArrowUp', 'Enter']);
  const MOVE_KEYS = {
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowDown: CONFIG.columns, // wraps from the bottom row back to the top
  };

  class Input {
    constructor() {
      this.onMove = () => {};
      this.onPlace = () => {};
      this._onKeyDown = this._onKeyDown.bind(this);
    }

    attach() {
      window.addEventListener('keydown', this._onKeyDown);
    }

    detach() {
      window.removeEventListener('keydown', this._onKeyDown);
    }

    _onKeyDown(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (PLACE_KEYS.has(e.code)) {
        e.preventDefault(); // stop Space / arrows scrolling the page
        if (!e.repeat) this.onPlace();
      } else if (e.code in MOVE_KEYS) {
        e.preventDefault();
        this.onMove(MOVE_KEYS[e.code]);
      }
    }
  }

  global.TTT.Input = Input;
})(window);
