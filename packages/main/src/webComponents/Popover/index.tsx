import { Event } from '@ui5/webcomponents-react-base/lib/Event';
import { useConsolidatedRef } from '@ui5/webcomponents-react-base/lib/useConsolidatedRef';
import { PlacementType } from '@ui5/webcomponents-react/lib/PlacementType';
import { PopoverHorizontalAlign } from '@ui5/webcomponents-react/lib/PopoverHorizontalAlign';
import { PopoverVerticalAlign } from '@ui5/webcomponents-react/lib/PopoverVerticalAlign';
import { withLazyWebComponent } from '@ui5/webcomponents-react/lib/withLazyWebComponent';
import React, { CSSProperties, ReactNode, RefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import { Ui5PopoverDomRef } from '../../interfaces/Ui5PopoverDomRef';
import { WithWebComponentPropTypes } from '../../internal/withLazyWebComponent';

export interface PopoverPropTypes extends WithWebComponentPropTypes {
  initialFocus?: string; // @generated
  headerText?: string; // @generated
  placementType?: PlacementType; // @generated
  horizontalAlign?: PopoverHorizontalAlign; // @generated
  verticalAlign?: PopoverVerticalAlign; // @generated
  modal?: boolean; // @generated
  noArrow?: boolean; // @generated
  allowTargetOverlap?: boolean; // @generated
  onBeforeOpen?: (event: Event) => void; // @generated
  onAfterOpen?: (event: Event) => void; // @generated
  onBeforeClose?: (event: Event) => void; // @generated
  onAfterClose?: (event: Event) => void; // @generated
  header?: ReactNode; // @generated
  footer?: ReactNode; // @generated
  content?: ReactNode | ReactNode[];
  openByStyle?: CSSProperties;
  openBy?: ReactNode;
  open?: boolean;
  propagateOpenByClickEvent?: boolean;
}

const InternalPopover = withLazyWebComponent<PopoverPropTypes>('Popover', () =>
  import('@ui5/webcomponents/dist/Popover')
);

export const Popover = React.forwardRef((props: PopoverPropTypes, givenRef: RefObject<Ui5PopoverDomRef>) => {
  const { propagateOpenByClickEvent, openBy, openByStyle, open, ...rest } = props;

  const openByRef: RefObject<HTMLDivElement> = useRef(null);

  const internalPopoverRef = useConsolidatedRef<Ui5PopoverDomRef>(givenRef);

  const handleOpenPopover = useCallback(
    (e) => {
      internalPopoverRef.current.openBy && internalPopoverRef.current.openBy(openByRef.current);
      if (e && !propagateOpenByClickEvent) {
        e.stopPropagation();
      }
    },
    [internalPopoverRef, openByRef]
  );

  const closePopover = useCallback(() => {
    internalPopoverRef.current.close && internalPopoverRef.current.close();
  }, [internalPopoverRef]);

  useEffect(() => {
    if (open) {
      handleOpenPopover();
    } else {
      closePopover();
    }
  }, [open]);

  const style = useMemo(() => {
    return {
      display: 'inline-block',
      ...openByStyle
    };
  }, [openByStyle]);

  return (
    <>
      {openBy && (
        <div style={style} onClick={handleOpenPopover} ref={openByRef}>
          {openBy}
        </div>
      )}
      <InternalPopover {...rest} ref={internalPopoverRef} />
    </>
  );
});

Popover.defaultProps = {
  initialFocus: null, // @generated
  headerText: null, // @generated
  placementType: PlacementType.Right, // @generated
  horizontalAlign: PopoverHorizontalAlign.Center, // @generated
  verticalAlign: PopoverVerticalAlign.Center, // @generated
  propagateOpenByClickEvent: true
};
Popover.displayName = 'Popover';
