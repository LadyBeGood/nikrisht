

/**
 * This is an AI generated port of my custom React BottomSheet component from my other project: 
 * https://github.com/LadyBeGood/youtube/blob/master/src/components/Overlays/BottomSheet.tsx 
 */
class BottomSheet extends HTMLElement {
    static get observedAttributes() {
        return [
            'type',
            'open',
            'overlay',
            'low',
            'middle',
            'high',
            'height'
        ];
    }

    constructor() {
        super();

        // Defaults
        this._type = 1;
        this._open = false;
        this._overlay = true;
        this._low = 0;
        this._middle = 50;
        this._high = 100;
        this._height = '';

        // Internal state
        this._isFullscreen = false;
        this._bottomSheetHeight = 0;
        this._isPointerDown = false;
        this._startY = 0;
        this._oldTranslateY = 50;
        this._translateY = 100;
        this._didDrag = false;
        this._pointerId = -1;
        this._pointerDownTarget = null;

        // Constants
        this.SNAP_THRESHOLD = 5;
        this.ANIMATION_DURATION = 250;

        this.attachShadow({ mode: 'open' });
        this._render();
    }

    connectedCallback() {
        this._updateSnapPoints();
        this._measureHeight();
        this._bindEvents();
        this._syncOpenState(true);
    }

    disconnectedCallback() {
        this._unbindEvents();
        document.body.style.overflowY = '';
        document.body.style.overscrollBehaviorY = '';
        document.documentElement.style.overscrollBehaviorY = '';
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        switch (name) {
            case 'type':
                this._type = parseInt(newValue) || 1;
                this._updateTypeStyles();
                break;
            case 'open':
                this._open = newValue !== null && newValue !== 'false';
                this._syncOpenState();
                break;
            case 'overlay':
                this._overlay = newValue !== 'false';
                this._updateOverlayVisibility();
                break;
            case 'low':
                this._low = parseFloat(newValue) || 0;
                this._updateSnapPoints();
                break;
            case 'middle':
                this._middle = parseFloat(newValue) || 50;
                this._updateSnapPoints();
                break;
            case 'high':
                this._high = parseFloat(newValue) || 100;
                this._updateSnapPoints();
                break;
            case 'height':
                this._height = newValue || '';
                if (this._sheet) this._sheet.style.height = this._height;
                break;
        }
    }

    // ---------- Public API ----------
    get open() {
        return this._open;
    }
    set open(value) {
        if (value) this.setAttribute('open', '');
        else this.removeAttribute('open');
    }

    show() { this.open = true; }
    hide() { this.open = false; }

    // ---------- Private helpers ----------
    _updateSnapPoints() {
        this._snapLow = 100 - this._low;
        this._snapMiddle = 100 - this._middle;
        this._snapHigh = 100 - this._high;
    }

    _measureHeight() {
        if (!this._sheet) return;
        this._bottomSheetHeight = this._sheet.getBoundingClientRect().height || window.innerHeight;
    }

    _syncOpenState(isInitial = false) {
        if (this._open) {
            this._translateY = this._snapMiddle;
            this._oldTranslateY = this._snapMiddle;
            if (this._overlayEl) {
                this._overlayEl.style.height = '100%';
                this._overlayEl.classList.add('visible');
            }
            document.body.style.overflowY = 'hidden';
        } else {
            this._translateY = 100;
            if (this._overlayEl) this._overlayEl.classList.remove('visible');

            if (!isInitial) {
                setTimeout(() => {
                    if (this._overlayEl) this._overlayEl.style.height = '0';
                }, this.ANIMATION_DURATION);
            }
            document.body.style.overflowY = '';
        }
        this._applyTransform();
    }

    _applyTransform() {
        if (!this._sheet) return;
        this._sheet.style.transform = `translateY(${this._open ? this._translateY : 100}%)`;
        this._sheet.style.transitionProperty = this._isPointerDown ? 'none' : 'transform';
    }

    _updateTypeStyles() {
        if (!this._content || !this._sheet) return;

        this._sheet.classList.toggle('type-1', this._type === 1);
        this._sheet.classList.toggle('type-2', this._type !== 1);
        this._content.classList.toggle('type-1', this._type === 1);
        this._content.classList.toggle('type-2', this._type !== 1);
    }

    _updateOverlayVisibility() {
        if (this._overlayEl) {
            this._overlayEl.style.display = this._overlay ? 'block' : 'none';
        }
    }

    _setFullscreen(value) {
        this._isFullscreen = value;

        // Control content scrolling
        if (this._scrollContainer) {
            this._scrollContainer.style.overflowY = value ? 'auto' : 'hidden';
        }

        if (value) {
            document.body.style.overscrollBehaviorY = 'none';
            document.documentElement.style.overscrollBehaviorY = 'none';
        } else {
            document.body.style.overscrollBehaviorY = '';
            document.documentElement.style.overscrollBehaviorY = '';
        }
    }

    // ---------- Event handlers ----------
    _bindEvents() {
        this._overlayEl?.addEventListener('click', () => this._close());

        this._sheet.addEventListener('touchstart', this._onTouchStart, { passive: true });
        this._sheet.addEventListener('touchmove', this._onTouchMove, { passive: false });
        this._sheet.addEventListener('touchend', this._onTouchEnd);

        this._sheet.addEventListener('mousedown', this._onMouseDown);
        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mouseup', this._onMouseUp);

        this._sheet.addEventListener('pointerdown', this._onPointerDown);
        this._sheet.addEventListener('pointerup', this._onPointerUp);
    }

    _unbindEvents() {
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('mouseup', this._onMouseUp);
    }

    _close() {
        this.open = false;
        this.dispatchEvent(new CustomEvent('close', { bubbles: true }));
    }

    // Drag logic
    _handleDragStart(pageY) {
        this._isPointerDown = true;
        this._startY = pageY;
        this._sheet.style.cursor = 'grabbing';
        this._measureHeight(); // always measure before drag
    }

    _handleDragMove(pageY) {
        if (!this._isPointerDown) return;

        // Important: only allow sheet drag when content is scrolled to the top
        if (this._isFullscreen && this._scrollContainer?.scrollTop > 0) {
            return;
        }

        this._didDrag = true;
        const dragDistance = pageY - this._startY;

        // Capture pointer after small movement
        if (Math.abs(dragDistance) > 5 && this._pointerDownTarget) {
            try {
                this._pointerDownTarget.setPointerCapture?.(this._pointerId);
            } catch (_) { }
            this._pointerDownTarget = null;
        }

        const newTranslate =
            this._oldTranslateY + (dragDistance / this._bottomSheetHeight) * 100;

        if (newTranslate >= 0 && newTranslate <= 100) {
            this._translateY = newTranslate;
            this._applyTransform();
        }
    }

    _handleDragEnd() {
        if (!this._isPointerDown) return;
        this._isPointerDown = false;
        this._sheet.style.cursor = 'grab';

        let snapped = this._snapMiddle;

        if (this._translateY > this._snapMiddle + this.SNAP_THRESHOLD) {
            this._close();
            return;
        } else if (
            this._translateY > this._snapHigh + this.SNAP_THRESHOLD &&
            this._isFullscreen
        ) {
            this._setFullscreen(false);
            snapped = this._snapMiddle;
        } else if (this._translateY < this._snapMiddle - this.SNAP_THRESHOLD) {
            snapped = this._snapHigh;
            this._setFullscreen(true);
        }

        this._translateY = snapped;
        this._oldTranslateY = snapped;
        this._applyTransform();
    }

    _isScrollable(el) {
        if (!el || el === this._sheet || el === this) return false;

        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;

        return (overflowY === 'auto' || overflowY === 'scroll') &&
            el.scrollHeight > el.clientHeight;
    }
    
    // Event wrappers
    _onTouchStart = (e) => this._handleDragStart(e.touches[0].pageY);
    _onTouchMove = (e) => {
        if (!this._isPointerDown) return;

        const touchY = e.touches[0].pageY;
        const deltaY = touchY - this._startY;

        // Walk up from the touched element to see if we're on a scrollable area
        let target = e.target;
        let scrollable = null;

        while (target && target !== this._sheet) {
            if (this._isScrollable(target)) {
                scrollable = target;
                break;
            }
            target = target.parentElement;
        }

        if (scrollable) {
            const atTop = scrollable.scrollTop <= 0;
            const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1;

            // If the user is trying to scroll the content, let them
            if ((deltaY > 0 && !atTop) || (deltaY < 0 && !atBottom)) {
                return; // important: do NOT preventDefault, do NOT drag the sheet
            }
        }

        // Otherwise drag the sheet
        e.preventDefault();
        this._handleDragMove(touchY);
    };
    _onTouchEnd = () => this._handleDragEnd();

    _onMouseDown = (e) => this._handleDragStart(e.pageY);
    _onMouseMove = (e) => this._handleDragMove(e.pageY);
    _onMouseUp = () => this._handleDragEnd();

    _onPointerDown = (e) => {
        this._pointerDownTarget = e.currentTarget;
        this._pointerId = e.pointerId;
    };

    _onPointerUp = (e) => {
        try {
            e.currentTarget.releasePointerCapture?.(e.pointerId);
        } catch (_) { }
    };

    // ---------- Render ----------
    _render() {
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: contents;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          opacity: 0;
          height: 0;
          z-index: 998;
          transition: opacity ${this.ANIMATION_DURATION}ms;
          pointer-events: none;
        }
        .overlay.visible {
          opacity: 0.7;
          pointer-events: auto;
        }

        .sheet {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          max-height: 100svh;
          z-index: 999;
        /* touch-action: pan-y ; */
          user-select: none;
          cursor: grab;
          transition: transform ${this.ANIMATION_DURATION}ms;
          will-change: transform;
          display: flex;
          flex-direction: column;
        }

        .sheet.type-1 {
          padding: 0 0.5rem 0.5rem;
        }
        .sheet.type-2 {
          background: #282a36;
        }

        .content {
          position: relative;
          display: flex;
          flex-direction: column;
          flex: 1 1 auto;
          min-height: 0;               /* critical for scrolling */
          overflow: hidden;
        }

        .content.type-1 {
          background: #212121;
          border-radius: 0.75rem;
        }
        .content.type-2 {
          height: 100%;
        }

        .handle {
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          height: 20px;
        }
        .handle-bar {
          height: 4px;
          width: 40px;
          border-radius: 9999px;
          background: #606060;
        }

        /* THIS is the scrollable area */
        .scroll-container {
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: hidden;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }
      </style>

      <div class="overlay" part="overlay"></div>

      <div class="sheet" part="sheet">
        <div class="content" part="content">
          <div class="scroll-container">
            <slot></slot>
          </div>
        </div>
      </div>
    `;

        this._overlayEl = this.shadowRoot.querySelector('.overlay');
        this._sheet = this.shadowRoot.querySelector('.sheet');
        this._content = this.shadowRoot.querySelector('.content');
        this._scrollContainer = this.shadowRoot.querySelector('.scroll-container');

        this._updateTypeStyles();
        this._updateOverlayVisibility();
        if (this._height) this._sheet.style.height = this._height;
    }
}

customElements.define('bottom-sheet', BottomSheet);