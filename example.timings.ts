const _____ptimers: any = [];
let _____sftimer: any;
let _____eftimer: any;
let _____sftimer_1: any;
let _____eftimer_1: any;
let _____sftimer_2: any;
let _____eftimer_2: any;
let _____sftimer_3: any;
let _____eftimer_3: any;
process.on("exit", () => {
    console.log("Performance Measurements:");
    console.log(JSON.stringify(_____ptimers, null, 2));
});
function fibonacci(n: any): any {
    _____sftimer_1 = new Date();
    let n1 = 0, n2 = 1, nextTerm;
    _____eftimer_1 = new Date();
    _____ptimers.push({
        line: 1,
        code: "let n1 = 0,\n    n2 = 1,\n    nextTerm;",
        start: _____sftimer_1,
        end: _____eftimer_1,
        diff: (_____eftimer_1 - _____sftimer_1).valueOf()
    });
    _____sftimer_1 = new Date();
    console.log("Fibonacci Series:");
    _____eftimer_1 = new Date();
    _____ptimers.push({
        line: 4,
        code: "console.log(\"Fibonacci Series:\");",
        start: _____sftimer_1,
        end: _____eftimer_1,
        diff: (_____eftimer_1 - _____sftimer_1).valueOf()
    });
    _____sftimer_1 = new Date();
    for (let i = 1; i <= n; i++) {
        _____sftimer_2 = new Date();
        console.log(n1);
        _____eftimer_2 = new Date();
        _____ptimers.push({
            line: 6,
            code: "console.log(n1);",
            start: _____sftimer_2,
            end: _____eftimer_2,
            diff: (_____eftimer_2 - _____sftimer_2).valueOf()
        });
        _____sftimer_2 = new Date();
        nextTerm = n1 + n2;
        _____eftimer_2 = new Date();
        _____ptimers.push({
            line: 7,
            code: "nextTerm = n1 + n2;",
            start: _____sftimer_2,
            end: _____eftimer_2,
            diff: (_____eftimer_2 - _____sftimer_2).valueOf()
        });
        _____sftimer_2 = new Date();
        n1 = n2;
        _____eftimer_2 = new Date();
        _____ptimers.push({
            line: 8,
            code: "n1 = n2;",
            start: _____sftimer_2,
            end: _____eftimer_2,
            diff: (_____eftimer_2 - _____sftimer_2).valueOf()
        });
        _____sftimer_2 = new Date();
        n2 = nextTerm;
        _____eftimer_2 = new Date();
        _____ptimers.push({
            line: 9,
            code: "n2 = nextTerm;",
            start: _____sftimer_2,
            end: _____eftimer_2,
            diff: (_____eftimer_2 - _____sftimer_2).valueOf()
        });
    }
    _____eftimer_1 = new Date();
    _____ptimers.push({
        line: 5,
        code: "for (let i = 1; i <= n; i++) {\n    console.log(n1);\n    nextTerm = n1 + n2;\n    n1 = n2;\n    n2 = nextTerm;\n  }",
        start: _____sftimer_1,
        end: _____eftimer_1,
        diff: (_____eftimer_1 - _____sftimer_1).valueOf()
    });
}
fibonacci(10000);
