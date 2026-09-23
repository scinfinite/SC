(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.CalculatorEngine = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function createCalculator() {
    let current = '0';
    let previous = null;
    let operator = null;
    let shouldReset = false;
    let expression = '';

    function formatNumber(numStr) {
      if (numStr === 'Error') return numStr;
      const num = parseFloat(numStr);
      if (isNaN(num)) return numStr;
      if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
        return num.toExponential(6);
      }
      const str = num.toString();
      if (str.includes('e')) return str;
      const parts = str.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }

    function getState() {
      return {
        current,
        previous,
        operator,
        shouldReset,
        expression,
        display: formatNumber(current),
      };
    }

    function inputNumber(value) {
      value = String(value);
      if (shouldReset) {
        current = value;
        shouldReset = false;
      } else if (current === '0' && value !== '0') {
        current = value;
      } else if (current === '0' && value === '0') {
        return getState();
      } else {
        if (current.replace('.', '').replace('-', '').length >= 12) return getState();
        current += value;
      }
      return getState();
    }

    function inputDecimal() {
      if (shouldReset) {
        current = '0.';
        shouldReset = false;
      } else if (!current.includes('.')) {
        current += '.';
      }
      return getState();
    }

    function setOperator(op) {
      if (operator && !shouldReset) {
        calculate();
      }
      previous = current;
      operator = op;
      shouldReset = true;
      const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
      expression = formatNumber(previous) + ' ' + symbols[op];
      return getState();
    }

    function calculate() {
      if (operator === null || previous === null) return getState();
      const a = parseFloat(previous);
      const b = parseFloat(current);
      let result;
      switch (operator) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/':
          if (b === 0) {
            current = 'Error';
            expression = '';
            operator = null;
            previous = null;
            shouldReset = true;
            return getState();
          }
          result = a / b;
          break;
        default:
          return getState();
      }
      result = Math.round(result * 1e10) / 1e10;
      const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
      expression = formatNumber(previous) + ' ' + symbols[operator] + ' ' + formatNumber(current) + ' =';
      current = String(result);
      operator = null;
      previous = null;
      shouldReset = true;
      return getState();
    }

    function clearAll() {
      current = '0';
      previous = null;
      operator = null;
      shouldReset = false;
      expression = '';
      return getState();
    }

    function toggleSign() {
      if (current === '0' || current === 'Error') return getState();
      current = current.startsWith('-') ? current.slice(1) : '-' + current;
      return getState();
    }

    function percent() {
      if (current === 'Error') return getState();
      current = String(parseFloat(current) / 100);
      return getState();
    }

    function backspace() {
      if (!shouldReset && current.length > 1) {
        current = current.slice(0, -1);
      } else {
        current = '0';
      }
      return getState();
    }

    return {
      formatNumber,
      getState,
      inputNumber,
      inputDecimal,
      setOperator,
      calculate,
      clearAll,
      toggleSign,
      percent,
      backspace,
    };
  }

  return { createCalculator };
});
