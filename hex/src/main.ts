import { createPostfix } from "typescript";
import { Hex } from "./data/Hex.js";

export enum Orientation {
    pointy,
    flat
}

export type Point = {
    x: number,
    y: number
};
export type HexPoint = {
    q: number,
    r: number,
    s: number
};

export class Base {
    b0: number;
    b1: number;
    b2: number;
    b3: number;
    f0: number;
    f1: number;
    f2: number;
    f3: number;

    constructor(orientation: Orientation) {
        if (orientation == Orientation.pointy) {
            this.f0 = Math.sqrt(3);
            this.f1 = Math.sqrt(3) / 2.;
            this.f2 = 0;
            this.f3 = 3 / 2;
            this.b0 = Math.sqrt(3) / 3;
            this.b1 = -1 / 3;
            this.b2 = 0
            this.b3 = 2 / 3.;

        } else {
            this.f0 = 3 / 2;
            this.f1 = 0;
            this.f2 = Math.sqrt(3) / 2.;
            this.f3 = Math.sqrt(3);
            this.b0 = 2 / 3.;
            this.b1 = 0
            this.b2 = -1 / 3;
            this.b3 = Math.sqrt(3) / 3;
        }
    }
};
export type Layout = {
    origin: Point,
    orientation: Orientation,
    tile_size: number,
    base: Base
}

export class MainCanvas {

    public mouse_pos: Point;
    public html_canvas: HTMLCanvasElement | null;
    public layout: Layout;
    public hexes: Map<String, Hex>;

    constructor() {
        this.mouse_pos = { x: 0, y: 0 };
        this.html_canvas = document.getElementById("canvas-ctn") as HTMLCanvasElement;
        this.html_canvas.width = window.innerWidth;
        this.html_canvas.height = window.innerHeight;

        const rect = this.html_canvas?.getBoundingClientRect();

        this.layout = {
            origin: {
                x: rect.x + rect.width / 2.,
                y: rect.y + rect.height / 2.
            },
            orientation: Orientation.pointy,
            tile_size: 40,
            base: new Base(Orientation.pointy)
        };

        this.hexes = new Map();

        const maximum_value: number = 5;
        const minimum_value: number = -maximum_value;

        const q_list: number[] = Array.from(Array(maximum_value - minimum_value + 1).keys()).map(x => x + minimum_value);
        const r_list: number[] = Array.from(Array(maximum_value - minimum_value + 1).keys()).map(x => x + minimum_value);

        q_list.forEach(
            q => r_list.forEach(
                r => {
                    if (Math.abs(q + r) <= maximum_value) {
                        this.hexes.set(q.toString() + " " + r.toString(), new Hex(q, r));
                    }
                }
            )
        );

        this.html_canvas.addEventListener('mousemove', evt => this.onMouseMove(evt), false);

    }

    public onMouseMove(evt: MouseEvent) {
        const rect = this.html_canvas?.getBoundingClientRect();
        this.mouse_pos = {
            x: rect ? evt.clientX - rect.x : 0,
            y: rect ? evt.clientY - rect.y : 0
        };
    }

    public pixel_to_hex(p: Point) {
        const pt: Point = {
            x: (p.x - this.layout.origin.x) / this.layout.tile_size,
            y: (p.y - this.layout.origin.y) / this.layout.tile_size
        };
        const q_float = this.layout.base.b0 * pt.x + this.layout.base.b1 * pt.y;
        const r_float = this.layout.base.b2 * pt.x + this.layout.base.b3 * pt.y;
        return this.hex_round(q_float, r_float, -q_float - r_float);
    }

    public hex_round(q_float: number, r_float: number, s_float: number): HexPoint {
        let q = Math.round(q_float)
        let r = Math.round(r_float)
        let s = Math.round(s_float)

        let q_diff = Math.abs(q - q_float)
        let r_diff = Math.abs(r - r_float)
        let s_diff = Math.abs(s - s_float)

        if (q_diff > r_diff && q_diff > s_diff) {
            q = -r - s;
        } else if (r_diff > s_diff) {
            r = -q - s;
        } else {
            s = -q - r;
        }

        return {
            "q": q,
            "r": r,
            "s": s
        };
    }
}

const main_canvas = new MainCanvas();
if (!main_canvas) throw new Error("Problem with context generation !");

window.addEventListener('resize', evt => {
    main_canvas.html_canvas = document.getElementById("canvas-ctn") as HTMLCanvasElement;
    const rect = main_canvas.html_canvas?.getBoundingClientRect();
    main_canvas.html_canvas.width = window.innerWidth;
    main_canvas.html_canvas.height = window.innerHeight;
    main_canvas.layout.origin = {
        x: rect.x + rect.width / 2.,
        y: rect.y + rect.height / 2.
    };
}, false);

setInterval(
    () => {
        const html_canvas = main_canvas.html_canvas
        if (!html_canvas) throw new Error("Problem with context generation !");
        const main_context = html_canvas?.getContext("2d");
        if (!main_context) throw new Error("Problem with context generation !");
        main_context.clearRect(0, 0, html_canvas.width, html_canvas.height);

        const active_coordinates = main_canvas.pixel_to_hex(main_canvas.mouse_pos)
        main_canvas.hexes.forEach((hex, _) => hex.setInactive());
        main_canvas.hexes.get(active_coordinates.q.toString() + " " + active_coordinates.r.toString())?.setActive();

        main_canvas.hexes.forEach(
            (hex, _) => hex.draw(main_canvas, main_context)
        );
    },
    1000. / 30.
);