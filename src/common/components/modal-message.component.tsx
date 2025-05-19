import React, { useContext, useRef } from "react";
import { AppContext } from "../contexts/app.context";
import useOnClickOutside from "../hooks/click-outside.hook";

function ModalMessageComponent(): React.JSX.Element {
  // Services
  const { message, setMessage } = useContext(AppContext);
  const modal = useRef(null);
  const handleClickOutsideFn = () => {
    setMessage((prev) => ({ ...prev, show: false }));
  };
  useOnClickOutside(
    modal,
    message.onClickOutClose ? handleClickOutsideFn : () => {}
  );

  return (
    <div
      className={`modal modal-bg ${message.show ? "is-open" : "modal-close"}`}
    >
      <div
        ref={modal}
        className={`modal-container ${message.size ? message.size : ""} ${
          message.style ? message.style : ""
        }`}
      >
        <div className="modal-header">
          <button
            className="close button-close tiny hover-three"
            onClick={
              message.onClose
                ? message.onClose
                : () => setMessage((prev) => ({ ...prev, show: false }))
            }
          >
            X
          </button>
          <p>{message?.title}</p>
        </div>
        <div className="modal-content">
          {typeof message.description != "string" ? (
            message?.description
          ) : (
            <p className="text-black-2 large">{message.description}</p>
          )}
        </div>
        <div className="modal-footer">
          {message.cancelTitle ? (
            <button
              className="button-cancel medium "
              onClick={
                message.onCancel
                  ? message.onCancel
                  : () => setMessage((prev) => ({ ...prev, show: false }))
              }
            >
              {message.cancelTitle}
            </button>
          ) : (
            <></>
          )}
          {message.OkTitle ? (
            <button
              className="button-ok small "
              onClick={
                message.onOk
                  ? message.onOk
                  : () => setMessage((prev) => ({ ...prev, show: false }))
              }
            >
              {message.OkTitle}
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(ModalMessageComponent);
