import { Block } from '../../framework/Block';
import template from './profile-edit.hbs?raw';
import { Input } from '../../components/input/input';
import { Button } from '../../components/button/button';
import './profile-edit.css';
import { validateField } from '../../utils/validation';

export class ProfileEditPage extends Block {
  private emailInput: Input;
  private loginInput: Input;
  private firstNameInput: Input;
  private secondNameInput: Input;
  private displayNameInput: Input;
  private phoneInput: Input;
  private saveButton: Button;

  constructor() {
    const emailInput = new Input({ type: 'email', name: 'email', label: 'Почта', value: 'pochta@yandex.ru' });
    const loginInput = new Input({ type: 'text', name: 'login', label: 'Логин', value: 'ivanivanov' });
    const firstNameInput = new Input({ type: 'text', name: 'first_name', label: 'Имя', value: 'Иван' });
    const secondNameInput = new Input({ type: 'text', name: 'second_name', label: 'Фамилия', value: 'Иванов' });
    const displayNameInput = new Input({ type: 'text', name: 'display_name', label: 'Имя в чате', value: 'Иван' });
    const phoneInput = new Input({ type: 'tel', name: 'phone', label: 'Телефон', value: '+7 (909) 967 30 30' });
    const saveButton = new Button({ label: 'Сохранить', onClick: () => this.handleSave() });

    const props = {
      emailInput: emailInput.getContent()?.outerHTML || '',
      loginInput: loginInput.getContent()?.outerHTML || '',
      firstNameInput: firstNameInput.getContent()?.outerHTML || '',
      secondNameInput: secondNameInput.getContent()?.outerHTML || '',
      displayNameInput: displayNameInput.getContent()?.outerHTML || '',
      phoneInput: phoneInput.getContent()?.outerHTML || '',
      saveButton: saveButton.getContent()?.outerHTML || '',
    };

    super(props);

    this.emailInput = emailInput;
    this.loginInput = loginInput;
    this.firstNameInput = firstNameInput;
    this.secondNameInput = secondNameInput;
    this.displayNameInput = displayNameInput;
    this.phoneInput = phoneInput;
    this.saveButton = saveButton;
  }

  protected render(): string {
    return template;
  }

  public afterRender(): void {
  this.emailInput?.afterRender?.();
  this.loginInput?.afterRender?.();
  this.firstNameInput?.afterRender?.();
  this.secondNameInput?.afterRender?.();
  this.displayNameInput?.afterRender?.();
  this.phoneInput?.afterRender?.();
  this.saveButton?.afterRender?.();

  const form = this.getContent()?.querySelector<HTMLFormElement>('#profile-edit-form');

  const inputs = form?.querySelectorAll<HTMLInputElement>('input');
  inputs?.forEach(input => {
    input.addEventListener('blur', () => {
      const { valid, error } = validateField(input.name, input.value.trim());
      if (!valid) {
        input.classList.add('input-error');
        input.setCustomValidity(error || 'Ошибка');
        input.reportValidity();
      } else {
        input.classList.remove('input-error');
        input.setCustomValidity('');
      }
    });
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    this.handleSave();
  });
}

 private handleSave(): void {
  const form = this.getContent()?.querySelector<HTMLFormElement>('#profile-edit-form');
  const inputs = form?.querySelectorAll<HTMLInputElement>('input');

  let isValid = true;
  const data: Record<string, string> = {};

  inputs?.forEach(input => {
    const value = input.value.trim();
    const { valid, error } = validateField(input.name, value);

    if (!valid) {
      isValid = false;
      input.classList.add('input-error');
      input.setCustomValidity(error || 'Ошибка');
      input.reportValidity();
    } else {
      input.classList.remove('input-error');
      input.setCustomValidity('');
    }

    data[input.name] = value;
  });

  if (!isValid) {
    console.warn('Validation failed');
    return;
  }

  console.log('Profile edited:', data);
}
}
