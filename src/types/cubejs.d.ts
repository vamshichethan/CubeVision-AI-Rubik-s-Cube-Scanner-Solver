declare module 'cubejs' {
  type CubeStateJson = {
    cp: number[];
    co: number[];
    ep: number[];
    eo: number[];
  };

  class Cube {
    static initSolver(): void;
    static fromString(facelets: string): Cube;
    static random(): Cube;
    static inverse(algorithm: string | number[] | number): string | number[] | number;

    constructor(state?: Cube | CubeStateJson);
    init(state: Cube | CubeStateJson): void;
    identity(): void;
    toJSON(): CubeStateJson;
    asString(): string;
    clone(): Cube;
    randomize(): void;
    isSolved(): boolean;
    move(algorithm: string | number[] | number): Cube;
    solve(): string;
  }

  export default Cube;
}
