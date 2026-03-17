// import { expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import '@testing-library/jest-dom';

import * as DemoStories from './demo.stories';



const { BasePegaExtensionsCalendar } = composeStories(DemoStories);

test('renders PegaExtensionsCalendar', async () => {
  render(<BasePegaExtensionsCalendar />);
  expect(await screen.findByText('Create operator')).toBeVisible();
  expect(await screen.findByText('Created')).toBeVisible();



});
