import React, { forwardRef } from 'react';
import { Transition, TransitionChild } from '@headlessui/react';

interface Props {
  children: React.ReactNode;
  isShowing: boolean;
}

const Fade = forwardRef<HTMLDivElement, Props>(({ children, isShowing }, ref) => {
  return (
    <Transition
      show={isShowing}
      enter='transition-opacity duration-300'
      enterFrom='opacity-0'
      enterTo='opacity-100'
      leave='transition-opacity duration-300'
      leaveFrom='opacity-100'
      leaveTo='opacity-0'
    >
      <div ref={ref}>{children}</div>
    </Transition>
  );
});

Fade.displayName = 'Fade';

export default Fade;
