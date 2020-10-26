import React, { useRef, useState } from 'react';

import { Direction } from '../../components/Popover/Popover';
import { Size, Tooltip } from '../../components/Tooltip/Tooltip';
import { useForkRef } from '../../hooks/useForkRef/useForkRef';

export const withTooltipPropMode = ['mouseover', 'click'] as const;
export const withTooltipPropModeDefault = withTooltipPropMode[0];

type WithTooltipPropMode = typeof withTooltipPropMode[number];

type ComponentProps = {
  onClick?: (() => void) | React.EventHandler<React.MouseEvent>;
  onMouseEnter?: (() => void) | React.MouseEventHandler;
  onMouseLeave?: (() => void) | React.MouseEventHandler;
};

type TooltipProps = {
  content?: React.ReactNode;
  size?: Size;
  direction?: Direction;
  spareDirection?: Direction;
  possibleDirections?: readonly Direction[];
  equalAnchorWidth?: boolean;
  mode?: WithTooltipPropMode;
};

export type WithToltipProps<Props> = Omit<Props, 'tooltipProps'> & { tooltipProps?: TooltipProps };

export function withTooltip(hocProps?: TooltipProps) {
  return function<
    COMPONENT_TYPE extends
      | React.ComponentType<ComponentProps>
      | ((props: ComponentProps) => React.ReactElement | null),
    COMPONENT_PROPS extends ComponentProps
  >(Component: COMPONENT_TYPE) {
    return (React.forwardRef<Element, WithToltipProps<COMPONENT_PROPS>>((props, ref) => {
      const { mode: modeHocProp, content: contentHocProp, ...tooltipHocProps } = hocProps || {};

      const { tooltipProps = {}, ...componentProps } = props;

      const {
        mode: modeComponentProp,
        content: contentComponentProp,
        ...tooltipComponentProps
      } = tooltipProps;

      const mode = modeComponentProp || modeHocProp || 'mouseover';

      const content = props.tooltipProps?.content || contentHocProp;

      const [visible, setVisible] = useState<boolean>(false);

      const componentRef = useRef<HTMLElement | null>(null);

      const onClick = (e: React.MouseEvent) => {
        if (mode === 'click') {
          setVisible(!visible);
        }
        if (props.onClick) {
          props.onClick(e);
        }
      };

      const onClickOutside = () => {
        if (mode === 'click') {
          setVisible(false);
        }
      };

      const onMouseEnter = (e: React.MouseEvent) => {
        if (mode === 'mouseover') {
          setVisible(true);
        }
        if (props.onMouseEnter) {
          props.onMouseEnter(e);
        }
      };

      const onMouseLeave = (e: React.MouseEvent) => {
        if (mode === 'mouseover') {
          setVisible(false);
        }
        if (props.onMouseLeave) {
          props.onMouseLeave(e);
        }
      };

      const Anchor = Component as React.ComponentType<COMPONENT_PROPS>;

      return (
        <>
          <Anchor
            {...(componentProps as COMPONENT_PROPS)}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            ref={useForkRef([componentRef, ref])}
          />
          {visible && (
            <Tooltip
              {...tooltipHocProps}
              {...tooltipComponentProps}
              anchorRef={componentRef}
              onClickOutside={onClickOutside}
            >
              {content}
            </Tooltip>
          )}
        </>
      );
    }) as unknown) as COMPONENT_TYPE | React.ComponentType<WithToltipProps<COMPONENT_PROPS>>;
  };
}
