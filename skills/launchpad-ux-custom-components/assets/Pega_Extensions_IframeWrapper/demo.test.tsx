// import { expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import '@testing-library/jest-dom';

import * as DemoStories from './demo.stories';

const { BasePegaYourLibraryIframeWrapper } = composeStories(DemoStories);

test('renders PegaYourLibraryIframeWrapper', async () => {
  render(<BasePegaYourLibraryIframeWrapper />);
  expect(await screen.findByText('URL Sample')).toBeVisible();
  expect(await screen.findByText('URL Helper Text')).toBeVisible();


  const urlElement = (screen.getByTestId('url-12345678') as HTMLInputElement);
  expect(urlElement.value).toBe('');

  expect(urlElement).toHaveAttribute('placeholder', 'URL Placeholder');
});
