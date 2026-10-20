// import { expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import '@testing-library/jest-dom';

import * as DemoStories from './demo.stories';



const { BasePegaExtensionsKanbanBoard } = composeStories(DemoStories);

test('renders PegaExtensionsKanbanBoard', async () => {
  render(<BasePegaExtensionsKanbanBoard />);
  expect(await screen.findByText('Create operator')).toBeVisible();
  expect(await screen.findByText('Created')).toBeVisible();



});
