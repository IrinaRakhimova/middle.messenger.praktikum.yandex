import { Block } from '../../framework/Block';
import template from './profile.hbs?raw';
import { Button } from '../../components/button/button';
import './profile.css';

interface ProfilePageProps {
  displayName: string;
  email: string;
  login: string;
  firstName: string;
  secondName: string;
  phone: string;
  editButton: string;
  passwordButton: string;
  logoutButton: string;
  [key: string]: unknown; 
}

export class ProfilePage extends Block<ProfilePageProps> {
  private editButton: Button;
  private passwordButton: Button;
  private logoutButton: Button;

  constructor() {
    const editButton = new Button({ label: 'Изменить данные', onClick: () => this.changeToEdit() });
    const passwordButton = new Button({ label: 'Изменить пароль', onClick: () => this.changeToPassword() });
    const logoutButton = new Button({ label: 'Выйти', onClick: () => this.handleLogout() });

    super({
      displayName: 'Иван Иванов',
      email: 'ivan@example.com',
      login: 'ivanivanov',
      firstName: 'Иван',
      secondName: 'Иванов',
      phone: '+71234567890',
      editButton: editButton.getContent()?.outerHTML || '',
      passwordButton: passwordButton.getContent()?.outerHTML || '',
      logoutButton: logoutButton.getContent()?.outerHTML || '',
    });

    this.editButton = editButton;
    this.passwordButton = passwordButton;
    this.logoutButton = logoutButton;
  }

  protected render(): string {
    return template;
  }

  public afterRender(): void {
    this.editButton?.afterRender();
    this.passwordButton?.afterRender();
    this.logoutButton?.afterRender();
  }

  private changeToEdit(): void {
    console.log('Navigating to profile edit...');
  }

  private changeToPassword(): void {
    console.log('Navigating to password change...');
  }

  private handleLogout(): void {
    console.log('Logging out...');
  }
}
