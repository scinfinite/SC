document.addEventListener('DOMContentLoaded', function () {
  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');
  const calc = CalculatorEngine.createCalculator();

  function render() {
    const state = calc.getState();
    resultEl.textContent = state.display;
    resultEl.classList.toggle('long', String(state.current).length > 10);
    expressionEl.textContent = state.expression;
  }

  document.querySelectorAll('button').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 500);

      const action = btn.dataset.action;
      const value = btn.dataset.value;
      switch (action) {
        case 'number': calc.inputNumber(value); break;
        case 'decimal': calc.inputDecimal(); break;
        case 'operator': calc.setOperator(value); break;
        case 'equals': calc.calculate(); break;
        case 'clear': calc.clearAll(); break;
        case 'toggle-sign': calc.toggleSign(); break;
        case 'percent': calc.percent(); break;
      }
      render();
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key >= '0' && e.key <= '9') calc.inputNumber(e.key);
    else if (e.key === '.') calc.inputDecimal();
    else if (e.key === '+') calc.setOperator('+');
    else if (e.key === '-') calc.setOperator('-');
    else if (e.key === '*') calc.setOperator('*');
    else if (e.key === '/') { e.preventDefault(); calc.setOperator('/'); }
    else if (e.key === 'Enter' || e.key === '=') calc.calculate();
    else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') calc.clearAll();
    else if (e.key === 'Backspace') calc.backspace();
    else if (e.key === '%') calc.percent();
    else return;
    render();
  });

  render();
});
