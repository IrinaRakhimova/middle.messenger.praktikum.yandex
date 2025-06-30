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
  '500': '/styles/500.css'
};

function setPageStyle(page) {
  // Remove any existing page style
  const oldLink = document.getElementById('page-style');
  if (oldLink) oldLink.remove();

  // Add new style if exists and not home (main.css is already global)
  if (page !== 'home' && pageStyles[page]) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = pageStyles[page];
    link.id = 'page-style';
    document.head.appendChild(link);
  }
}

// Register your partials here if you have any
// Example:
// import Header from './components/Header.js';
// Handlebars.registerPartial('Header', Header);

export default class App {
  constructor() {
    this.state = {
      currentPage: 'home',  // or your default page name
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
    // Add navigation for home page links
    const homeLinks = [
      { id: 'link-profile', page: 'profile' },
      { id: 'link-login', page: 'login' },
      { id: 'link-register', page: 'register' },
      { id: 'link-chats', page: 'chats' },
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
