import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Box from '../component-library/box/box';

/**
 * @deprecated The `<Menu />` component has been deprecated in favor of the new `<Popover>` component from the component-library.
 * Please update your code to use the new `<Popover>` component instead, which can be found at ui/components/component-library/popover/popover.tsx.
 * You can find documentation for the new `Popover` component in the MetaMask Storybook:
 * {@link https://metamask.github.io/metamask-storybook/?path=/docs/components-componentlibrary-popover--docs}
 * If you would like to help with the replacement of the old `Menu` component, please submit a pull request against this GitHub issue:
 * {@link https://github.com/MetaMask/metamask-extension/issues/20498}
 */

const Popover = ({
  anchorElement,
  children,
  className,
  onHide,
  popperOptions,
  isOpen,
  title,
  offset,
  flip,
  preventOverflow,
  matchWidth,
  hasArrow,
  onClickOutside,
  onPressEscKey,
}) => {
  const [popperElement, setPopperElement] = useState(null);
  const popoverContainerElement = useRef(
    document.getElementById('popover-content'),
  );

  const { styles, attributes } = usePopper(anchorElement, popperElement, {
    placement: 'bottom-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: offset || [0, 8],
        },
      },
      {
        name: 'flip',
        enabled: flip !== undefined ? flip : false,
      },
      {
        name: 'preventOverflow',
        enabled: preventOverflow !== undefined ? preventOverflow : false,
      },
      {
        name: 'arrow',
        enabled: hasArrow !== undefined ? hasArrow : false,
        options: {
          element: '[data-popper-arrow]',
        },
      },
    ],
  });

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', onClickOutside);
      document.addEventListener('keydown', onPressEscKey);
    } else {
      document.removeEventListener('click', onClickOutside);
      document.removeEventListener('keydown', onPressEscKey);
    }

    return () => {
      document.removeEventListener('click', onClickOutside);
      document.removeEventListener('keydown', onPressEscKey);
    };
  }, [isOpen, onClickOutside, onPressEscKey]);

  return createPortal(
    isOpen && (
      <>
        <div
          className="popover__background"
          onClick={onHide}
        />
        <Box
          ref={setPopperElement}
          className={classnames('popover__container', className)}
          {...attributes.popper}
          style={styles.popper}
        >
          {title && <div className="popover__title">{title}</div>}
          {children}
        </Box>
      </>
    ),
    popoverContainerElement.current,
  );
};

Popover.propTypes = {
  anchorElement: PropTypes.instanceOf(window.Element),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onHide: PropTypes.func.isRequired,
  popperOptions: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string,
  offset: PropTypes.arrayOf(PropTypes.number),
  flip: PropTypes.bool,
  preventOverflow: PropTypes.bool,
  matchWidth: PropTypes.bool,
  hasArrow: PropTypes.bool,
  onClickOutside: PropTypes.func,
  onPressEscKey: PropTypes.func,
};

Popover.defaultProps = {
  className: undefined,
  popperOptions: undefined,
  title: undefined,
  offset: undefined,
  flip: undefined,
  preventOverflow: undefined,
  matchWidth: undefined,
  hasArrow: undefined,
  onClickOutside: undefined,
  onPressEscKey: undefined,
};

export default Popover;
