
/* eslint-disable react/jsx-no-useless-fragment */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { stateProps, configProps } from './mock';

import PegaYourLibrarySignatureCapture from './index';

const meta: Meta<typeof PegaYourLibrarySignatureCapture> = {
  title: 'PegaYourLibrarySignatureCapture',
  component: PegaYourLibrarySignatureCapture,
  excludeStories: /.*Data$/
};

export default meta;
type Story = StoryObj<typeof PegaYourLibrarySignatureCapture>;

export const BasePegaYourLibrarySignatureCapture: Story = (args: any) => {

  const [value, setValue] = useState(configProps.value);

  const props = {
    value,
    hasSuggestions: configProps.hasSuggestions,

    getPConnect: () => {
      return {
        getStateProps: () => {
          return stateProps;
        },
        getActionsApi: () => {
          return {
            updateFieldValue: (propName: string, theValue: any) => {
              setValue(theValue);
            },
            triggerFieldChange: () => {/* nothing */}
          };
        },
        ignoreSuggestion: () => {/* nothing */},
        acceptSuggestion: () => {/* nothing */},
        setInheritedProps: () => {/* nothing */},
        resolveConfigProps: () => {/* nothing */}
      };
    }
  };

  return (
    <>
      <PegaYourLibrarySignatureCapture {...props} {...args} />
    </>
  );
};

BasePegaYourLibrarySignatureCapture.args = {
  label: configProps.label,
  helperText: configProps.helperText,
  placeholder: configProps.placeholder,
  testId: configProps.testId,
  readOnly: configProps.readOnly,
  disabled: configProps.disabled,
  required: configProps.required,
  status: configProps.status,
  hideLabel: configProps.hideLabel,
  displayMode: configProps.displayMode,
  validatemessage: configProps.validatemessage
};
