import Handlebars from 'handlebars';
import * as Pages from './pages';

const pageStyles = {
  home: '/styles/main.css',
  profile: '/styles/profile.css',
  'profile-edit': '/styles/profile-edit.css',
  chats: '/styles/chats.css',
  login: '/styles/login.css',
  register: '/styles/register.css',
  '404': '/styles/404.css',
  '500': '/styles/500.css',
  'password-edit': '/styles/password-edit.css'
};

function setPageStyle(page) {
  const oldLink = document.getElementById('page-style');
  if (oldLink) oldLink.remove();

  if (page !== 'home' && pageStyles[page]) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = pageStyles[page];
    link.id = 'page-style';
    document.head.appendChild(link);
  }
}

export default class App {
  constructor() {
    this.state = {
      currentPage: 'home',  
    };
    this.appElement = document.getElementById('app');
  }

  render() {
    let template;

    switch (this.state.currentPage) {
      case 'home':
        template = Handlebars.compile(Pages.Home);
        break;
      case 'profile':
        template = Handlebars.compile(Pages.Profile);
        break;
        case 'profile-edit':
        template = Handlebars.compile(Pages.ProfileEdit);
        break;
        case 'password-edit':
        template = Handlebars.compile(Pages.PasswordEdit);
        break;
      case 'login':
        template = Handlebars.compile(Pages.Login);
        break;
      case 'register':
        template = Handlebars.compile(Pages.Register);
        break;
      case 'chats':
        template = Handlebars.compile(Pages.Chats);
        break;
      case '500':
        template = Handlebars.compile(Pages.ServerError);
        break;
      default:
        template = Handlebars.compile(Pages.NotFound);
        break;
    }

    this.appElement.innerHTML = template();
    setPageStyle(this.state.currentPage);
    this.attachEventListeners();
  }

  attachEventListeners() {
    const homeLinks = [
      { id: 'link-profile', page: 'profile' },
      { id: 'link-login', page: 'login' },
      { id: 'link-register', page: 'register' },
      { id: 'link-chats', page: 'chats' },
      { id: 'link-profile-edit', page: 'profile-edit' },
      { id: 'link-password-edit', page: 'password-edit' },
      { id: 'link-500', page: '500' },
      { id: 'link-404', page: '404' },
    ];
    homeLinks.forEach(link => {
      const el = document.getElementById(link.id);
      if (el) {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          this.changePage(link.page);
        });
      }
    });
  }

  changePage(page) {
    this.state.currentPage = page;
    this.render();
  }
}
