import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@solidjs/testing-library';

vi.mock('@solidjs/router', () => ({
  A: (props: { href: string; class?: string; children: unknown }) => (
    <a href={props.href} class={props.class}>
      {props.children}
    </a>
  ),
}));

vi.mock('@solidjs/meta', () => ({
  Title: (props: { children: unknown }) => <title>{props.children}</title>,
  Meta: (props: { name: string; content: string }) => (
    <meta name={props.name} content={props.content} />
  ),
}));

vi.mock('../../src/components/ProviderIcon.jsx', () => ({
  providerIcon: (id: string, size: number) => <svg data-provider={id} width={size} height={size} />,
}));

import Marketing from '../../src/pages/Marketing';

describe('Marketing', () => {
  it('leads with the two core marketplace values', () => {
    const { container } = render(() => <Marketing />);

    expect(screen.getByText('Put your unused AI access')).toBeDefined();
    expect(container.textContent).toContain('Sell unused tokens');
    expect(container.textContent).toContain('Buy verified access');
    expect(container.textContent).toContain('No model swapping');
    expect(container.textContent).toContain('OAuth and API-key authorization');
  });

  it('exposes distinct seller and buyer journeys', async () => {
    const { container } = render(() => <Marketing />);

    expect(container.textContent).toContain('Turn idle access into useful capacity.');
    await fireEvent.click(screen.getByRole('button', { name: 'I need model access' }));
    expect(container.textContent).toContain('Buy the model, not somebody’s claim.');
    expect(container.textContent).toContain('Buy verified access');
  });

  it('opens and closes mobile navigation', async () => {
    render(() => <Marketing />);

    const open = screen.getByRole('button', { name: 'Open navigation' });
    await fireEvent.click(open);
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeDefined();

    await fireEvent.click(screen.getByRole('button', { name: 'Close navigation' }));
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).toBeNull();
  });

  it('keeps seller and buyer calls to action role-specific', () => {
    const { container } = render(() => <Marketing />);

    expect(container.querySelector('a[href="/register?role=seller"]')).not.toBeNull();
    expect(container.querySelector('a[href="/register?role=buyer"]')).not.toBeNull();
  });
});
