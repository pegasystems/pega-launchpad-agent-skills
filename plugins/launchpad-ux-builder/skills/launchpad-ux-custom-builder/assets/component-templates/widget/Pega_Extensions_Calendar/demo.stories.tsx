/* eslint-disable react/jsx-no-useless-fragment */
import type { Meta, StoryObj } from '@storybook/react';

import PegaExtensionsCalendar from './index';

import { configProps, operatorDetails } from './mock';

const meta: Meta<typeof PegaExtensionsCalendar> = {
  title: 'PegaExtensionsCalendar',
  component: PegaExtensionsCalendar,
  excludeStories: /.*Data$/
};

export default meta;
type Story = StoryObj<typeof PegaExtensionsCalendar>;

if (!window.PCore) {
  window.PCore = {} as any;
}

window.PCore.getLocaleUtils = () => {
  return {
    getLocaleValue: (value: any) => {
      return value;
    }
  } as any;
};

window.PCore.getUserApi = () => {
  return {
    getOperatorDetails: () => {
      return new Promise(resolve => {
        // @ts-ignore
        resolve(operatorDetails);
      });
    }
  } as any;
};

export const BasePegaExtensionsCalendar: Story = (args: any) => {

  const props = {
    label: configProps.label,
    createLabel: configProps.createLabel,
    updateLabel: configProps.updateLabel,
    createOperator: configProps.createOperator,
    updateOperator: configProps.updateOperator,
    createDateTime: configProps.createDateTime,
    updateDateTime: configProps.updateDateTime,
    hideLabel: configProps.hideLabel,

    getPConnect: () => {
      return {
        getActionsApi: () => {
          return {
            updateFieldValue: () => {/* nothing */},
            triggerFieldChange: () => {/* nothing */}
          };
        },
        getCaseSummary: () => {
          return {
            user: configProps.updateOperator.userId,
            dateTimeValue: configProps.updateDateTime
          }
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
      <PegaExtensionsCalendar {...props} {...args} />
    </>
  );
};

BasePegaExtensionsCalendar.args = {};
