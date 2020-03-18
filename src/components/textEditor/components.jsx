import React from "react";
import ReactDOM from "react-dom";
import { cx, css } from "emotion";

export const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

export const Menu = React.forwardRef(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={cx(
      className,
      css`
        & > * {
          display: inline-block;
        }
        & > * + * {
          margin-left: 15px;
        }
      `
    )}
  />
));

export const Button = React.forwardRef(
  ({ className, active, reversed, ...props }, ref) => (
    <span
      {...props}
      ref={ref}
      className={cx(
        className,
        css`
          cursor: pointer;
          color: ${reversed
            ? active
              ? "#03a87c"
              : "#fff"
            : active
            ? "#03a87c"
            : "#fff"};
        `
      )}
    />
  )
);
