const fs = require("fs");
const path = require("path");
const stem = require("../dist/umd/stemr").stem;

const data = fs.readFileSync(path.join(__dirname, "data.txt")).toString().split("\n");

const result = [];
for (let i = 0; i < 10; i++) {
  const t1 = process.hrtime();
  for (let j = 0; j < data.length; j++) {
    stem(data[j]);
  }
  const t2 = process.hrtime(t1);
  result.push(Math.round((t2[0] * 1000) + (t2[1] / 1000000)));
}

result.sort((a, b) => a - b);
console.log(result[Math.round(result.length / 2)]);
