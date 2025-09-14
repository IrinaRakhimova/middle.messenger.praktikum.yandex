import { isEqual } from './isEqual';
import { render } from './renderDOM';

export default class Route {
  private _pathname: string;
  private _blockClass: any;
  private _block: any = null;
  private _props: { rootQuery: string };

  constructor(pathname: string, view: any, props: { rootQuery: string }) {
    this._pathname = pathname;
    this._blockClass = view;
    this._props = props;
  }

  leave() {
    if (this._block) {
      this._block.hide();
    }
  }

  match(pathname: string) {
    return isEqual(pathname, this._pathname);
  }

  render() {
    if (!this._block) {
      this._block = new this._blockClass();
      render(this._props.rootQuery, this._block);
      return;
    }
    this._block.show();
  }
}
