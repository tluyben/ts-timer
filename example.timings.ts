const _____ptimers: any = [];
function _____timerPush(params: {
  line: number;
  code: string;
  start: Date;
  end: Date;
  diff: number;
}): any {
  _____ptimers.push(params);
}
let _____sftimer: any;
let _____eftimer: any;
let _____sftimer_1: any;
let _____eftimer_1: any;
let _____sftimer_2: any;
let _____eftimer_2: any;
process.on("exit", () => {
  console.log("Performance Measurements:");
  console.log(JSON.stringify(_____ptimers, null, 2));
});
_____sftimer = new Date();
function fibonacci(n: any): any {
  _____sftimer_1 = new Date();
  let n1 = 0,
    n2 = 1,
    nextTerm;
  _____eftimer_1 = new Date();
  _____timerPush({
    line: 1,
    code: "let n1 = 0,\n    n2 = 1,\n    nextTerm;",
    start: _____sftimer_1,
    end: _____eftimer_1,
    diff: (_____eftimer_1 - _____sftimer_1).valueOf(),
  });
  _____sftimer_1 = new Date();
  console.log("Fibonacci Series:");
  _____eftimer_1 = new Date();
  _____timerPush({
    line: 4,
    code: 'console.log("Fibonacci Series:");',
    start: _____sftimer_1,
    end: _____eftimer_1,
    diff: (_____eftimer_1 - _____sftimer_1).valueOf(),
  });
  _____sftimer_1 = new Date();
  for (let i = 1; i <= n; i++) {
    _____sftimer_2 = new Date();
    console.log(n1);
    _____eftimer_2 = new Date();
    _____timerPush({
      line: 6,
      code: "console.log(n1);",
      start: _____sftimer_2,
      end: _____eftimer_2,
      diff: (_____eftimer_2 - _____sftimer_2).valueOf(),
    });
    _____sftimer_2 = new Date();
    nextTerm = n1 + n2;
    _____eftimer_2 = new Date();
    _____timerPush({
      line: 7,
      code: "nextTerm = n1 + n2;",
      start: _____sftimer_2,
      end: _____eftimer_2,
      diff: (_____eftimer_2 - _____sftimer_2).valueOf(),
    });
    _____sftimer_2 = new Date();
    n1 = n2;
    _____eftimer_2 = new Date();
    _____timerPush({
      line: 8,
      code: "n1 = n2;",
      start: _____sftimer_2,
      end: _____eftimer_2,
      diff: (_____eftimer_2 - _____sftimer_2).valueOf(),
    });
    _____sftimer_2 = new Date();
    n2 = nextTerm;
    _____eftimer_2 = new Date();
    _____timerPush({
      line: 9,
      code: "n2 = nextTerm;",
      start: _____sftimer_2,
      end: _____eftimer_2,
      diff: (_____eftimer_2 - _____sftimer_2).valueOf(),
    });
  }
  _____eftimer_1 = new Date();
  _____timerPush({
    line: 5,
    code: "for (let i = 1; i <= n; i++) {\n    console.log(n1);\n    nextTerm = n1 + n2;\n    n1 = n2;\n    n2 = nextTerm;\n  }",
    start: _____sftimer_1,
    end: _____eftimer_1,
    diff: (_____eftimer_1 - _____sftimer_1).valueOf(),
  });
}
_____eftimer = new Date();
_____timerPush({
  line: 1,
  code: 'function fibonacci(n) {\n  let n1 = 0,\n    n2 = 1,\n    nextTerm;\n  console.log("Fibonacci Series:");\n  for (let i = 1; i <= n; i++) {\n    console.log(n1);\n    nextTerm = n1 + n2;\n    n1 = n2;\n    n2 = nextTerm;\n  }\n}',
  start: _____sftimer,
  end: _____eftimer,
  diff: (_____eftimer - _____sftimer).valueOf(),
});
_____sftimer = new Date();
fibonacci(50);
_____eftimer = new Date();
_____timerPush({
  line: 12,
  code: "fibonacci(50);",
  start: _____sftimer,
  end: _____eftimer,
  diff: (_____eftimer - _____sftimer).valueOf(),
});
