import React from 'react';
import { FieldValueList, Text } from '@pega/cosmos-react-core';
import type { PConnProps } from './PConnProps';

interface HighlightRenderProps extends PConnProps {
  field?: any;
}

const HighlightRender = (props: HighlightRenderProps) => {
  const { getPConnect, field } = props;

  field.config['displayMode'] = 'DISPLAY_ONLY';

  // Mark as status display when using pyStatusWork
  if (field.config?.value === '@P .pyStatusWork') {
    field.type = 'TextInput';
    field.config.displayAsStatus = true;
  }

  const configProps: any = getPConnect().resolveConfigProps(field.config);

  // @ts-ignore
  const reactField = getPConnect().createComponent(field);

  return (
    <FieldValueList
      style={{ width: 'auto' }}
      variant='stacked'
      data-testid={field.testId}
      fields={[
        {
          id: '2',
          name: configProps.hideLabel ? '' : configProps.label,
          value: (
            <Text variant='h1' as='span'>
              {reactField}
            </Text>
          )
        }
      ]}
    />
  );
};

export default HighlightRender;
