import { Fragment, type ReactElement } from 'react';
import { FieldValueList } from '@pega/cosmos-react-core';

interface DetailsRenderProps {
  children?: never;
  child: NonNullable<ReactElement>;
}

const DetailsRender = (props: DetailsRenderProps) => {
  const { child } = props;

  const kids = child.props.getPConnect().getChildren();

  const displayCompArr: ReactElement[] = [];

  Object.values(kids).forEach((value: any, i :number) => {
    const { type } = value.getPConnect().getRawMetadata();
    const { hideLabel, variant, testId, label } = value
      .getPConnect()
      .resolveConfigProps(value.getPConnect().getConfigProps());

    let displayComp;
    const key = JSON.stringify(value.getPConnect());
    const key1 = key.concat(`-${i}`);

    if (type === 'reference') {
      const refElement = value.getPConnect().getComponent();

      displayCompArr.push(refElement);
    } else {
      const element = value.getPConnect().getComponent();
      const displayEl = <Fragment key={key}>{element}</Fragment>;

      displayComp = (
        <Fragment key={key1}>
          <FieldValueList
            style={{ columnGap: '0'}}
            variant={hideLabel ? 'stacked' : variant}
            data-testid={testId}
            fields={[{ id: '1', name: hideLabel ? '' : label, value: displayEl }]}
          />
        </Fragment>
      );

      displayCompArr.push(displayComp);
    }
  });

  return <>{displayCompArr}</>;
};

export default DetailsRender;
