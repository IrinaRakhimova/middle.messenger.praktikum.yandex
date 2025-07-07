import { Block } from './framework/Block';
import { HomePage, ChatsPage, LoginPage,
         RegisterPage, ProfilePage, ProfileEditPage,
         PasswordEditPage, NotFoundPage, ServerErrorPage }
  from './pages';

export type PageKey =
  | 'home'
  | 'profile'
  | 'profile-edit'
  | 'password-edit'
  | 'login'
  | 'register'
  | 'chats'
  | '404'
  | '500';

export default class App {
  private state: { currentPage: PageKey };
  private appElement: HTMLElement;

  constructor(rootId: string = 'app') {
    this.state = { currentPage: 'home' };
    const el = document.getElementById(rootId);
    if (!el) throw new Error(`Element with id="${rootId}" not found`);
    this.appElement = el;
    this.render();
  }

  private render(): void {
    this.appElement.innerHTML = '';

    let pageComponent: Block;

    switch (this.state.currentPage) {
      case 'home':
        pageComponent = new HomePage();
        break;
      case 'profile':
        pageComponent = new ProfilePage();
        break;
      case 'profile-edit':
        pageComponent = new ProfileEditPage();
        break;
      case 'password-edit':
        pageComponent = new PasswordEditPage();
        break;
      case 'login':
        pageComponent = new LoginPage();
        break;
      case 'register':
        pageComponent = new RegisterPage();
        break;
      case 'chats':
        pageComponent = new ChatsPage();
        break;
      case '404':
        pageComponent = new NotFoundPage();
        break;
      case '500':
        pageComponent = new ServerErrorPage();
        break;
      default:
        pageComponent = new NotFoundPage();
        break;
    }

    const content = pageComponent.getContent();
    if (content) {
      this.appElement.appendChild(content);
    }

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
  const links: Array<{ selector: string; page: PageKey }> = [
    { selector: '[data-nav="home"]', page: 'home' },
    { selector: '[data-nav="profile"]', page: 'profile' },
    { selector: '[data-nav="profile-edit"]', page: 'profile-edit' },
    { selector: '[data-nav="password-edit"]', page: 'password-edit' },
    { selector: '[data-nav="login"]', page: 'login' },
    { selector: '[data-nav="register"]', page: 'register' },
    { selector: '[data-nav="chats"]', page: 'chats' },
    { selector: '[data-nav="404"]', page: '404' },
    { selector: '[data-nav="500"]', page: '500' },
  ];

  links.forEach(({ selector, page }) => {
    this.appElement.querySelectorAll(selector).forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        this.changePage(page);
      });
    });
  });
}

  private changePage(page: PageKey): void {
    this.state.currentPage = page;
    this.render();
  }  
}




