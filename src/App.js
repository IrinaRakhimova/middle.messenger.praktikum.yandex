import Handlebars from 'handlebars';
import * as Pages from './pages';

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
      case 'profile':
        template = Handlebars.compile(Pages.Profile);
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
      default:
        template = Handlebars.compile(Pages.NotFound);
        break;
    }

    this.appElement.innerHTML = template();
    this.attachEventListeners();
  }

  attachEventListeners() {
    // No functions yet, but you can add listeners here later
  }

  changePage(page) {
    this.state.currentPage = page;
    this.render();
  }
}
