import { Layout, Orientation, MainCanvas, Point } from "../main.js";



export class Hex {
    fillStyle: string = "None";
    q: number;
    r: number;
    s: number;
    closed_sides: boolean[];

    constructor(q: number, r: number) {
        this.q = q;
        this.r = r;
        this.s = -(q + r);
        this.closed_sides = Array(6).fill(true);
    }

    public hex_origin(layout: Layout): Point {
        return {
            x: layout.origin.x + layout.tile_size * (layout.base.f0 * this.q + layout.base.f1 * this.r),
            y: layout.origin.y + layout.tile_size * (layout.base.f2 * this.q + layout.base.f3 * this.r)
        }

    }

    public point(origin: Point, index: number, layout: Layout): Point {

        const angle_rad = layout.orientation == Orientation.pointy ? Math.PI / 3 * index - Math.PI / 6 : Math.PI / 3 * index;

        return {
            x: origin.x + Math.cos(angle_rad) * layout.tile_size,
            y: origin.y + Math.sin(angle_rad) * layout.tile_size,
        }
    }

    public setActive() {
        this.fillStyle = "yellow"
    }

    public setInactive() {
        this.fillStyle = "black"
    }

    public draw(main_canvas: MainCanvas, main_context: CanvasRenderingContext2D): void {
        const origin = this.hex_origin(main_canvas.layout);

        const points: Point[] = [
            this.point(origin, 0, main_canvas.layout),
            this.point(origin, 1, main_canvas.layout),
            this.point(origin, 2, main_canvas.layout),
            this.point(origin, 3, main_canvas.layout),
            this.point(origin, 4, main_canvas.layout),
            this.point(origin, 5, main_canvas.layout)
        ];

        main_context.strokeStyle = "white";
        main_context.fillStyle = this.fillStyle;

        main_context.beginPath();
        main_context.moveTo(points[0].x, points[0].y);
        this.closed_sides[0] ? main_context.lineTo(points[1].x, points[1].y) : main_context.moveTo(points[1].x, points[1].y);
        this.closed_sides[1] ? main_context.lineTo(points[2].x, points[2].y) : main_context.moveTo(points[2].x, points[2].y);
        this.closed_sides[2] ? main_context.lineTo(points[3].x, points[3].y) : main_context.moveTo(points[3].x, points[3].y);
        this.closed_sides[3] ? main_context.lineTo(points[4].x, points[4].y) : main_context.moveTo(points[4].x, points[4].y);
        this.closed_sides[4] ? main_context.lineTo(points[5].x, points[5].y) : main_context.moveTo(points[5].x, points[5].y);
        this.closed_sides[5] ? main_context.lineTo(points[0].x, points[0].y) : main_context.moveTo(points[0].x, points[0].y);
        main_context.stroke();
        main_context.fill();
    }
}