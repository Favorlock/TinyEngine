import API from '../engine/API.js';

let Entity = API.Entity;
let System = API.System;
let TransformComponent = API.Components.TransformComponent;
let AnimatorComponent = API.Components.AnimatorComponent;
let Animation = API.Animation;
let ImageUtils = API.ImageUtils;

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
        if (API.InputManager.getKeyboard('`', 'win') && !this.dirty) {
            engine.debug = !engine.debug;
            this.dirty = true;
        } else if (!API.InputManager.getKeyboard('`', 'win') && this.dirty) {
            this.dirty = false;
        }
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

    update(entities, time, dt) {
        this.generateNextGeneration()
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
                    this.next[row][col] = [0];
                }
            }
        }
    }

    swap() {
        let tmp = this.current;
        this.current = this.next;
        this.next = tmp;
    }

    createPulsar(x, y, center = false) {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                for (let r = 0; r < 6; r++) {
                    for (let c = 0; c < 6; c++) {
                        let set = 0;

                        if (i) {
                            if (r > 0 && r < 4 && (c == 0 || c == 5)) set = 1;
                        } else {
                            if (r > 1 && r < 5 && (c == 0 || c == 5)) set = 1;
                        }

                        if (j) {
                            if ((r == 0 || r == 5)&& c > 0 && c < 4) set = 1;
                        } else {
                            if ((r == 0 || r == 5)&& c > 1 && c < 5) set = 1;
                        }

                        let row = i * 6 + i + r + y;
                        let col = j * 6 + j + c + x;

                        if (center) {
                            row -= 7;
                            col -= 7;
                        }

                        if (set && row >= 0 && row < this.rows && col >= 0 && col < this.columns) {
                            this.next[row][col] = 1;
                        }
                    }
                }
            }
        }
    }

    createAutomata(arr, x, y, center = false) {
        let cx = center ? -Math.floor(arr[0].length / 2) : 0;
        let cy = center ? -Math.floor(arr.length / 2) : 0;
        for (let row = 0; row < arr.length; row++) {
            for (let col = 0; col < arr[row].length; col++) {
                if (arr[row][col] == 0) continue;

                let r = y + row + cy;
                let c = x + col + cx;

                if (r >= 0 && r <= this.rows && c >= 0 && c < this.columns) {
                    this.next[r][c] = 1;
                }
            }
        }
    }
}

let width, height;
let canvas = document.getElementById('viewport');
let ctx = canvas.getContext('2d');
let engine;

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
            tickHandler: new API.SemiFixedTimestep(canvas),
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

        cas.createPulsar(cas.columns / 2, cas.rows / 2, true);
        cas.createAutomata(gosperGliderGun, 20, 1);

        engine.start();
    });
};