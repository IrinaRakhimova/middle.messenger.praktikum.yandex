type ValidationResult = { valid: boolean; error?: string };

export function validateField(name: string, value: string): ValidationResult {
  const rules: Record<string, RegExp> = {
    first_name: /^[А-ЯA-Z][а-яa-zА-ЯA-Z-]*$/,
    second_name: /^[А-ЯA-Z][а-яa-zА-ЯA-Z-]*$/,
    login: /^(?!\d+$)[a-zA-Z0-9_-]{3,20}$/,
    email: /^[a-zA-Z0-9._-]+@[a-zA-Z]+\.[a-zA-Z]+$/,
    password: /^(?=.*[A-Z])(?=.*\d).{8,40}$/,
    phone: /^\+?\d{10,15}$/,
    message: /.+/, 
  };

  if (!(name in rules)) {
    return { valid: true };
  }

  const pattern = rules[name];
  if (!value || !pattern.test(value)) {
    let error = '';
    switch (name) {
      case 'first_name':
      case 'second_name':
        error = 'Имя и Фамилия: первая буква заглавная, без пробелов, цифр и спецсимволов, допустим дефис.';
        break;
      case 'login':
        error = 'Логин: 3-20 символов, латиница, цифры допустимы, но не только цифры, без пробелов, спецсимволы - и _';
        break;
      case 'email':
        error = 'Email должен содержать @ и точку после неё, только латиница, цифры, -, _';
        break;
      case 'password':
        error = 'Пароль: 8-40 символов, минимум одна заглавная буква и цифра.';
        break;
      case 'phone':
        error = 'Телефон: 10-15 цифр, может начинаться с +.';
        break;
      case 'message':
        error = 'Сообщение не должно быть пустым.';
        break;
      default:
        error = `Поле "${name}" заполнено неверно.`;
    }
    return { valid: false, error };
  }

  return { valid: true };
}
