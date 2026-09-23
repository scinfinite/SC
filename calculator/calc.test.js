const assert = require('assert');
const { createCalculator } = require('./calc.js');

function run(name, fn) {
  fn();
  console.log('ok - ' + name);
}

run('starts at 0', () => {
  const c = createCalculator();
  assert.strictEqual(c.getState().current, '0');
});

run('inputs multi-digit numbers', () => {
  const c = createCalculator();
  c.inputNumber('1');
  c.inputNumber('2');
  c.inputNumber('3');
  assert.strictEqual(c.getState().current, '123');
});

run('adds', () => {
  const c = createCalculator();
  c.inputNumber('2');
  c.setOperator('+');
  c.inputNumber('3');
  c.calculate();
  assert.strictEqual(c.getState().current, '5');
});

run('subtracts', () => {
  const c = createCalculator();
  c.inputNumber('9');
  c.setOperator('-');
  c.inputNumber('4');
  c.calculate();
  assert.strictEqual(c.getState().current, '5');
});

run('multiplies', () => {
  const c = createCalculator();
  c.inputNumber('6');
  c.setOperator('*');
  c.inputNumber('7');
  c.calculate();
  assert.strictEqual(c.getState().current, '42');
});

run('divides', () => {
  const c = createCalculator();
  c.inputNumber('8');
  c.setOperator('/');
  c.inputNumber('2');
  c.calculate();
  assert.strictEqual(c.getState().current, '4');
});

run('division by zero is Error', () => {
  const c = createCalculator();
  c.inputNumber('8');
  c.setOperator('/');
  c.inputNumber('0');
  c.calculate();
  assert.strictEqual(c.getState().current, 'Error');
});

run('percent', () => {
  const c = createCalculator();
  c.inputNumber('50');
  c.percent();
  assert.strictEqual(c.getState().current, '0.5');
});

run('toggle sign', () => {
  const c = createCalculator();
  c.inputNumber('5');
  c.toggleSign();
  assert.strictEqual(c.getState().current, '-5');
  c.toggleSign();
  assert.strictEqual(c.getState().current, '5');
});

run('clear resets', () => {
  const c = createCalculator();
  c.inputNumber('9');
  c.setOperator('+');
  c.clearAll();
  assert.strictEqual(c.getState().current, '0');
  assert.strictEqual(c.getState().operator, null);
});

run('chained operations', () => {
  const c = createCalculator();
  c.inputNumber('2');
  c.setOperator('+');
  c.inputNumber('3');
  c.setOperator('*');
  c.inputNumber('4');
  c.calculate();
  assert.strictEqual(c.getState().current, '20');
});

run('decimal input', () => {
  const c = createCalculator();
  c.inputNumber('1');
  c.inputDecimal();
  c.inputNumber('5');
  assert.strictEqual(c.getState().current, '1.5');
});

run('backspace', () => {
  const c = createCalculator();
  c.inputNumber('1');
  c.inputNumber('2');
  c.backspace();
  assert.strictEqual(c.getState().current, '1');
});

console.log('\nAll tests passed.');
