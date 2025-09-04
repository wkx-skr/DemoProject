namespace Main {
  // 布尔值
  let isDone: boolean = false;

  // 数字 十进制、十六进制、二进制
  let decLiteral: number = 6;
  let hexLiteral: number = 0xf00d;
  let binaryLiteral: number = 0b1010;

  // 字符串
  let name: string = "bob";
  name = "Smith";

  // 数组
  // 两种定义方法
  let list: number[] = [1, 2, 3];
  let list2: Array<number> = [1,2,3];

  // 元组Tuple
  let x: [string, number]
  x = ['hello', 10];

  // 枚举
  enum Color { Red, Blue, Green}
  let c: Color = Color.Green;
  enum Color1 {
    Red = 2,
    Green = 4,
    Yellow,
    Blue
  }

  // Any

  // Void
  function warnUser (): void {
    console.log("This is my warning message");
  }

  // Null 和 Undefined

  // Never
  function throwError(message: string): never {
    throw new Error(message);
  }

  // object
  declare function create(o: object | null): void;
  create({prop: 0})

  // 类型断言
  let someValue: any = "This is a string";
  let strLength: number = (<string>someValue).length;
  let strLength1: number = (someValue as string).length;
}

