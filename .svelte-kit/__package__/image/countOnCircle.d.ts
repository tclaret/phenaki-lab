export declare function countObjectsOnCircle(img: any, circle: any, opts?: {}): Promise<{
    count: number;
    samples: any[];
    mask: boolean[];
    groups: number[];
    positions: {
        start: number;
        end: number;
        mid: number;
        angle: number;
    }[];
    canvas: HTMLCanvasElement;
}>;
