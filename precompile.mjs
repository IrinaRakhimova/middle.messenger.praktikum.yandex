import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

const src = path.resolve('src');
const out = path.resolve('dist');
const layout = fs.readFileSync(path.join(src, 'templates', 'layout.hbs'), 'utf-8');
Handlebars.registerPartial('layout', layout);

const pages = ['login','register','profile','chats','404','500','profile-edit','password-edit'];

pages.forEach(name => {
  const templateSrc = fs.readFileSync(path.join(src, 'pages', `${name}.hbs`), 'utf-8');
  const template = Handlebars.compile(templateSrc);
  const html = template({ title: name.charAt(0).toUpperCase() + name.slice(1), page: name });
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, `${name}.html`), html);
});
