export default class PositionBuilder {
  private readonly xTotal: number;
  private readonly yTotal: number;
  private used: Array<Array<number>>;
  constructor (xTotal: number, yTotal: number) {
    this.xTotal = xTotal
    this.yTotal = yTotal
    this.used = []
  }

  public init (): void {
    this.used = []
    for (let i = 0; i < this.yTotal; i++) {
      const arr : any[] = [];
      for (let j = 0; j < this.xTotal; j++) {
        arr.push(0)
      }
      this.used.push(arr)
    }
  }

  private findEmptyPoint (width: number, height: number): any {
    const considerSize = (curI: number, curJ: number): boolean => {
      for (let i = curI; i < curI + height; i++) {
        for (let j = curJ; j < curJ + width; j++) {
          if (j >= this.used[i].length) {
            return false
          }
          if (this.used[i][j] === 1) {
            return false
          }
        }
      }
      return true
    }
    const fill = (curI: number, curJ: number): void => {
      for (let i = curI; i < curI + height; i++) {
        for (let j = curJ; j < curJ + width; j++) {
          this.used[i][j] = 1
        }
      }
    }
    for (let i = 0; i < this.used.length; i++) {
      for (let j = 0; j < this.used[i].length; j++) {
        if (this.used[i][j] === 0) {
          if (considerSize(i, j)) {
            fill(i, j)
            return {
              x: j,
              y: i
            }
          }
        }
      }
    }
    return false
  }

  public checkEmptyAndInside (x: number, y: number, w: number, h: number, xP: number, yP: number, wP: number, hP: number): boolean {
    const isValid = true
    // check if rect is outside paper.
    if (x < 0 || y < 0 || x + w > this.xTotal || y + h > this.yTotal) {
      return false
    }
    if (x === xP && y === yP && w === wP && h === hP) {
      return true
    }
    for (let i = y; i < y + h; i++) {
      for (let j = x; j < x + w; j++) {
        if ((i >= yP && i < yP + hP) && (j >= xP && j < xP + wP)) {
        } else {
          if (this.used[i][j] === 1) {
            return false
          }
        }
      }
    }
    return isValid
  }

  public addWithoutValue (width: number, height: number): any {
    const result = this.findEmptyPoint(width, height)
    if (result) {
      this.addWithValue(width, height, result.x, result.y)
      return {
        x: result.x,
        y: result.y
      }
    } else {
      return false
    }
  }

  public addWithValue (width: number, height: number, x: number, y: number): void {
    for (let i = y; i < y + height; i++) {
      for (let j = x; j < x + width; j++) {
        this.used[i][j] = 1
      }
    }
  }

  public removePoints (width: number, height: number, x: number, y: number): void {
    for (let i = y; i < y + height; i++) {
      for (let j = x; j < x + width; j++) {
        this.used[i][j] = 0
      }
    }
  }
}
