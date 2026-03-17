// import { expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import '@testing-library/jest-dom';

import * as DemoStories from './demo.stories';

const { BasePegaYourLibraryQrCode } = composeStories(DemoStories);

test('renders PegaYourLibraryQrCode', async () => {
  render(<BasePegaYourLibraryQrCode />);
  expect(await screen.findByText('Text Sample')).toBeVisible();


  const textElement = (screen.getByTestId('Text-12345678:input:control') as HTMLInputElement);
  expect(textElement.value).toBe('');

  expect(textElement).toHaveAttribute('placeholder', 'Text Placeholder');
});
