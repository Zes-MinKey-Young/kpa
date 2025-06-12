interface PositionEntity<T> {
    target: T;
    x: number;
    y: number;
    height: number;
    width: number;
    priority: number;
}

class SelectionManager<T> {
    positions: PositionEntity<T>[]
    constructor() {

    }
    refresh() {
        this.positions = []
    }
    add(entity: PositionEntity<T>) {
        this.positions.push(entity)
        return {
            annotate: (context: CanvasRenderingContext2D, canvasX: number, canvasY: number) => {
                context.save();
                context.fillStyle = "pink";
                context.fillText(`${shortenFloat(entity.x, 1)}, ${shortenFloat(entity.y, 1)}`, canvasX, canvasY - 10);
                context.restore();
            },
        }
    }
    click(x: number, y: number): undefined | PositionEntity<T> {
        const positions = this.positions;
        console.log(positions, x, y)
        const len = positions.length;
        let i = 0;
        let selected, priority = -1;
        for (; i < len; i++) {
            const pos = positions[i];
            if (pointIsInRect(x, y, pos, pos.width, pos.height)) {
                if (pos.priority > priority) {
                    selected = pos;
                    priority = pos.priority
                }
            }
        }
        return selected;
    }
}