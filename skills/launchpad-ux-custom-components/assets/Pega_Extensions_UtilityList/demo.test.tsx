// import { expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import '@testing-library/jest-dom';

import * as DemoStories from './demo.stories';



const { BasePegaExtensionsUtilityList } = composeStories(DemoStories);

test('renders PegaExtensionsUtilityList', async () => {
  render(<BasePegaExtensionsUtilityList />);
  expect(await screen.findByText('Create operator')).toBeVisible();
  expect(await screen.findByText('Created')).toBeVisible();



});
