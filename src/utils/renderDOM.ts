export function render(query: string, block: any) {
  const root = document.querySelector(query);
  if (!root) {
    throw new Error(`Root not found by selector "${query}"`);
  }
  root.innerHTML = '';
  root.appendChild(block.getContent());
  block.dispatchComponentDidMount?.();
}
