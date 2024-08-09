export abstract class Badge {
    max = 99;

    constructor(max = 99) {
        this.max = max;
    }

    // 如果超过最大值，则显示为 99+
    protected formatVal(val: number): string {
        return val > this.max ? `${this.max}+` : String(val);
    }

    // 校验
    protected checkVal(val: number): boolean {
        return Number.isInteger(val) && val > 0;
    }

    abstract update(val: number): void;

    abstract clear(): void;
}
