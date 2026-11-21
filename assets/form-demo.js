import { hydrateIcons } from './icons.js';
import { contactParts as parts } from './contact-parts.js';
import { mountPartsList } from './practice-parts.js';

hydrateIcons();

const flagDescriptions = {
  valueMissing: '必須欄が空',
  typeMismatch: '形式が合わない',
  tooShort: '最小の長さに届かない',
  tooLong: '最大の長さを超えている',
  valid: 'すべての制約を満たす',
};

const form = document.querySelector('#contact-demo');
const formParts = Object.fromEntries([...form.querySelectorAll('[data-demo-part]')].map(part => [part.dataset.demoPart, part]));
const fields = [...form.querySelectorAll('input, textarea')].map(input => ({
  input,
  key: input.closest('[data-demo-part]').dataset.demoPart,
  hintId: input.getAttribute('aria-describedby'),
  error: document.getElementById(`${input.id}-error`),
}));
const modeButtons = document.querySelectorAll('[data-demo-mode]');
const submitButton = document.querySelector('#contact-submit');
const methodGroup = document.querySelector('#demo-method');
const result = document.querySelector('#demo-result');
const inspector = document.querySelector('#demo-inspector');
const inspectorPosition = inspector.parentElement;
const panelLabel = document.querySelector('#demo-panel-label');
const panelTitle = document.querySelector('#demo-part-title');
const partPanel = document.querySelector('#demo-part-panel');
const partDescription = document.querySelector('#demo-part-description');
const partCode = document.querySelector('#demo-part-code');
const validationPanel = document.querySelector('#demo-validation-panel');
const validationOutcome = document.querySelector('#demo-validation-outcome');
const flagsList = document.querySelector('#demo-flags');
const validationMessage = document.querySelector('#demo-validation-message');
const relatedCard = document.querySelector('#demo-related-card');
const narrowLayout = matchMedia('(max-width: 760px)');
const partsIndex = document.querySelector('#contact-parts');
const updatePartButtons = mountPartsList(partsIndex, parts, key => {
  if (key === 'submit' && mode === 'validation') setMode('parts');
  selectPart(key);
  if (narrowLayout.matches) inspector.scrollIntoView({ block: 'nearest' });
});

let mode = 'parts';
let selectedPart = 'email';
let showInlineErrors = false;

function setResult(message, state = '') {
  result.textContent = message;
  result.dataset.result = state;
}

function positionInspector() {
  if (narrowLayout.matches) {
    const part = formParts[selectedPart];
    if (part.nextElementSibling !== inspector) part.after(inspector);
  } else if (inspector.parentElement !== inspectorPosition) {
    inspectorPosition.append(inspector);
  }
}

function showValidity() {
  const field = fields.find(({ key }) => key === selectedPart);
  const { validity } = field.input;
  validationOutcome.textContent = validity.valid ? '現在の入力は有効です。' : '現在の入力には制約違反があります。';
  validationMessage.textContent = field.input.validationMessage || '""（空文字）';

  flagsList.replaceChildren(...[...parts[selectedPart].flags, 'valid'].map(flag => {
    const row = document.createElement('div');
    row.className = 'demo-flag';
    const term = document.createElement('dt');
    const label = document.createElement('code');
    label.textContent = flag;
    term.append(label);
    const description = document.createElement('span');
    description.textContent = flagDescriptions[flag];
    term.append(description);
    const value = document.createElement('dd');
    value.textContent = String(validity[flag]);
    value.dataset.active = value.textContent;
    row.append(term, value);
    return row;
  }));
}

function selectPart(key) {
  if (mode === 'validation' && key === 'submit') return;
  selectedPart = key;
  updatePartButtons(key);
  for (const [partKey, element] of Object.entries(formParts)) {
    const selected = partKey === key;
    element.classList.toggle('is-selected', selected);
    element.querySelector('[data-inspect]')?.setAttribute('aria-pressed', String(selected));
  }

  const part = parts[key];
  panelTitle.textContent = part.label;
  relatedCard.href = `./?item=${part.card}`;
  if (mode === 'parts') {
    partDescription.textContent = part.description;
    partCode.textContent = part.code;
  } else {
    showValidity();
  }
  positionInspector();
}

function fieldError({ input, key }) {
  const { validity } = input;
  if (validity.valueMissing) return parts[key].missing;
  if (validity.typeMismatch) return 'name@example.com のような形式で入力してください。';
  if (validity.tooShort) return `${input.minLength}文字以上で入力してください。`;
  if (validity.tooLong) return `${input.maxLength}文字以内で入力してください。`;
  return input.validationMessage;
}

function renderErrors() {
  for (const field of fields) {
    const { input, error, hintId } = field;
    const message = showInlineErrors && !input.validity.valid ? fieldError(field) : '';
    error.hidden = !message;
    error.textContent = message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    const descriptions = [hintId, message && error.id].filter(Boolean);
    if (descriptions.length) input.setAttribute('aria-describedby', descriptions.join(' '));
    else input.removeAttribute('aria-describedby');
  }
}

function setMode(nextMode) {
  mode = nextMode;
  const validating = mode === 'validation';
  const inline = methodGroup.querySelector(':checked').value === 'inline';
  for (const button of modeButtons) button.setAttribute('aria-pressed', String(button.dataset.demoMode === mode));
  methodGroup.hidden = !validating;
  partPanel.hidden = validating;
  validationPanel.hidden = !validating;
  panelLabel.textContent = validating ? 'ValidityState' : 'パーツ解説';
  submitButton.type = validating ? 'submit' : 'button';
  form.noValidate = !validating || inline;
  for (const { key } of fields) {
    const action = validating ? '検証状態' : '解説';
    formParts[key].querySelector('[data-inspect]').setAttribute('aria-label', `${parts[key].label}の${action}を表示`);
  }
  showInlineErrors = false;
  renderErrors();
  setResult('');
  selectPart(validating && selectedPart === 'submit' ? 'email' : selectedPart);
}

for (const button of modeButtons) {
  button.addEventListener('click', () => setMode(button.dataset.demoMode));
}
methodGroup.addEventListener('change', () => setMode(mode));
narrowLayout.addEventListener('change', positionInspector);

form.addEventListener('click', event => {
  const part = event.target.closest('[data-demo-part]');
  if (part && event.target.type !== 'reset') selectPart(part.dataset.demoPart);
});
form.addEventListener('focusin', event => {
  const field = fields.find(({ input }) => input === event.target);
  if (field) selectPart(field.key);
});
form.addEventListener('input', () => {
  setResult('');
  renderErrors();
  if (mode === 'validation') showValidity();
});
form.addEventListener('reset', () => {
  showInlineErrors = false;
  renderErrors();
  setResult('');
  requestAnimationFrame(() => {
    if (mode === 'validation') showValidity();
  });
});
form.addEventListener('invalid', () => {
  setResult('入力内容を確認してください。', 'error');
}, true);
form.addEventListener('submit', event => {
  event.preventDefault();
  if (mode !== 'validation') return;

  const firstInvalid = fields.find(({ input }) => !input.validity.valid);
  if (firstInvalid) {
    showInlineErrors = true;
    renderErrors();
    firstInvalid.input.focus();
    setResult('入力欄の下に表示されたエラーを確認してください。', 'error');
    return;
  }
  setResult('入力内容を確認できました。デモの操作は完了です。', 'success');
});

setMode(mode);
submitButton.disabled = false;
