// import { expect, test } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import '@testing-library/jest-dom';

import * as DemoStories from './demo.stories';



const { BasePegaYourLibraryRatingLayout } = composeStories(DemoStories);

test('renders PegaYourLibraryRatingLayout', async () => {
  render(<BasePegaYourLibraryRatingLayout />);
  expect(await screen.findByText('Details template')).toBeVisible();
  expect(await screen.findByText('Work Status')).toBeVisible();
  expect(await screen.findByText('Case ID')).toBeVisible();
  expect(await screen.findByText('Create date/time')).toBeVisible();
  expect(await screen.findByText('Create Operator')).toBeVisible();

  // expect(await screen.findByText('New')).toBeVisible();

  expect(await screen.findByText('M-1002')).toBeVisible();
  expect(await screen.findByText('December 11, 2022 at 8:06:27 PM')).toBeVisible();

  expect(await screen.findByText('SLA Deadline')).toBeVisible();
  expect(await screen.findByText('SLA Goal')).toBeVisible();
  expect(await screen.findByText('SLA Start Time')).toBeVisible();

  expect(await screen.findByText('Deadline')).toBeVisible();
  expect(await screen.findByText('Goal')).toBeVisible();
  expect(await screen.findByText('Start Time')).toBeVisible();

  const frenchBefore = screen.queryByText('french DigV2');
  expect(frenchBefore).not.toBeInTheDocument();

  // admin button
  const adminButton = screen.getByRole('button');
  fireEvent.click(adminButton);

  const frenchArr = await screen.findAllByText('french DigV2');
  expect(frenchArr[0]).toBeVisible();
  expect(frenchArr[1]).toBeVisible();




});
