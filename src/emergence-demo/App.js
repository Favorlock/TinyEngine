import API from '../engine/API.js';

let System = API.System;

class BackgroundRenderSystem extends System {
    constructor(ctx) {
        super();
        this.ctx = ctx;
        this.hue = 0.0;
        this.saturation = 50;
        this.lightness = 50;
    }

    update(entities, time, dt) {
        this.ctx.save();
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.restore();
    }
}

class DebugSystem extends System {
    constructor() {
        super();
        this.dirty = false;
    }

    update() {
        if (API.InputManager.getKeyboard('PageDown') && tickDivisor > 1) {
            tickDivisor -= 1;
            engine.tickHandler.maxFrameTime = 1 / tickDivisor;
        }

        if (API.InputManager.getKeyboard('PageUp') && tickDivisor < 60) {
            tickDivisor += 1;
            engine.tickHandler.maxFrameTime = 1 / tickDivisor;
        }

        if (API.InputManager.getKeyboard('`')) {
            engine.debug = !engine.debug;
            API.InputManager.clear('`', 'keyboard');
        }
    }
}

class SaveSystem extends System {
    constructor(cas) {
        super();
        this.cas = cas;
        this.snapshot;
    }

    update(entities, time, dt) {
        if (API.InputManager.getKeyboard('s')) {
            this.save();
        } else if (API.InputManager.getKeyboard('l') && this.snapshot) {
            this.load();
        }
    }

    save() {
        this.snapshot = this.cas.snapshot();
    }

    load() {
        this.cas.restore(this.snapshot);
        this.snapshot = null;
    }
}

class CellularAutomataSystem extends System {
    constructor(ctx, rows, columns, w = 1, h = 1) {
        super();
        this.ctx = ctx;
        this.rows = rows;
        this.columns = columns;
        this.width = w;
        this.height = h;
        this.next = this.createGrid();
        this.current = this.createGrid();
    }

    snapshot() {
        let next = [];
        let current = [];

        for (let i in this.next) {
            next.push(this.next[i].slice(0))
        }

        for (let i in this.current) {
            current.push(this.current[i].slice(0))
        }

        return {
            rows: this.rows,
            columns: this.columns,
            width: this.width,
            height: this.height,
            next: next,
            current: current
        }
    }

    restore(snapshot) {
        Object.assign(this, snapshot);
    }

    update(entities, time, dt) {
        if (!engine.debug) this.generateNextGeneration();
        this.draw();
    }

    generateNextGeneration() {
        this.swap();
        this.sanitize();

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                let livingNeighborCount = 0;

                for (let v = -1; v <= 1; v++) {
                    for (let h = -1; h <= 1; h++) {
                        if (row == 0 && v < 0) continue;
                        if (row == this.rows - 1 && v > 0) continue;
                        if (col == 0 && h < 0) continue;
                        if (col == this.columns - 1 && h > 0) continue;
                        if (v == 0 && h == 0) continue;
                        livingNeighborCount += this.current[row + v][col + h];
                    }
                }

                if (this.current[row][col] == 1 && livingNeighborCount < 2) {
                    this.next[row][col] = 0;
                } else if (this.current[row][col] == 1 && livingNeighborCount > 3) {
                    this.next[row][col] = 0;
                } else if (this.current[row][col] == 0 && livingNeighborCount == 3) {
                    this.next[row][col] = 1;
                } else {
                    this.next[row][col] = this.current[row][col];
                }
            }
        }
    }

    draw() {
        this.ctx.fillStyle = 'white';
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                if (this.next[row][col] == 1) {
                    this.ctx.fillRect(col * this.width, row * this.height, this.width, this.height);
                }
            }
        }
    }

    createGrid() {
        let grid = new Array(this.rows);
        for (let i = 0; i < this.rows; i++) {
            grid[i] = new Array(this.columns).fill(0);
        }
        return grid;
    }

    sanitize() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                if (col == 0 || col == this.columns - 1 || row == 0 || row == this.rows - 1) {
                    this.next[row][col] = 0;
                }
            }
        }
    }

    swap() {
        let tmp = this.current;
        this.current = this.next;
        this.next = tmp;
    }

    createAutomata(arr, x, y, center = false, swapX = false, swapY = false) {
        let cx = center ? -Math.floor(arr[0].length / 2) : 0;
        let cy = center ? -Math.floor(arr.length / 2) : 0;
        for (let row = 0; row < arr.length; row++) {
            let tr = swapY ? arr.length - row - 1 : row;
            for (let col = 0; col < arr[row].length; col++) {
                let tc = swapX ? arr[tr].length - col - 1 : col;
                if (arr[tr][tc] == 0) continue;

                let r = y + row + cy;
                let c = x + col + cx;

                if (r >= 0 && r <= this.rows && c >= 0 && c < this.columns) {
                    this.next[r][c] = 1;
                }
            }
        }
    }

    createAutomataFromQuarter(arr, x, y, center = false, gap = 0) {
        if (center) {
            x = x - Math.floor(arr[0].length / 2);
            y = y - Math.floor(arr.length / 2);

            if (gap) {
                x -= Math.ceil(gap / 2);
                y -= Math.ceil(gap / 2);
            }
        }

        this.createAutomata(arr, x, y, center);
        this.createAutomata(arr, x + arr[0].length + gap, y, center, true, false);
        this.createAutomata(arr, x, y + arr.length + gap, center, false, true);
        this.createAutomata(arr, x + arr[0].length + gap, y + arr.length + gap, center, true, true);
    }
}

let width, height;
let canvas = document.getElementById('viewport');
let ctx = canvas.getContext('2d');
let engine;
let tickDivisor = 30;

let gosperGliderGun = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

let achimsp11 = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]

let pulsar = [
    [0, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1],
    [0, 0, 1, 1, 1, 0],
]

let pentadecathlon = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]

let destination = 'http://24.16.255.56:8888';

API.InputManager.init(canvas);

window.onload = function () {
    let assetManager = new API.AssetManager();
    assetManager.downloadAll(function () {
        width = 1024;
        height = 768;
        let ecs = new API.ECS();

        let config = {
            canvas: canvas,
            ctx: ctx,
            width: width,
            height: height,
            tickHandler: new API.SemiFixedTimestep(canvas, 1 / tickDivisor),
            ecs: ecs
        };

        // Show the canvas when ready
        canvas.style.display = 'inline';

        // Start the game
        engine = new API.Engine(config);
        engine.init();

        let pd = 4;
        let cas;

        // Register all systems in the order to be executed.
        ecs.addSystem(new DebugSystem());
        ecs.addSystem(new BackgroundRenderSystem(ctx));
        ecs.addSystem((cas = new CellularAutomataSystem(ctx, height / pd, width / pd, pd, pd)));
        ecs.addSystem(new SaveSystem(cas));

        cas.createAutomataFromQuarter(achimsp11, cas.columns / 4, cas.rows / 2, true);
        cas.createAutomataFromQuarter(achimsp11, cas.columns / 4 * 3, cas.rows / 2, true);
        cas.createAutomataFromQuarter(pulsar, cas.columns / 2, cas.rows / 4, true, 1);
        cas.createAutomataFromQuarter(pulsar,cas.columns / 2, cas.rows / 4 * 3, true, 1);

        cas.createAutomata(pentadecathlon, cas.columns / 2, cas.rows / 2, true);

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                cas.createAutomata(gosperGliderGun, i ? cas.columns / 4 * 3 : cas.columns / 4,
                    j ? cas.rows / 8 * 7 : cas.rows / 8,
                    true, i, j);
            }
        }

        engine.start();
    });
};