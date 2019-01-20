import React from 'react';
import { Button, Modal } from 'react-bootstrap';

class ModalComponent extends React.Component {
  closeHandler = () => {
    const { onClose } = this.props;
    if (onClose) onClose();
  };

  render() {
    const {
      title, children, cofirmEnabled, onConfirm
    } = this.props;
    return (
      <Modal show onHide={this.closeHandler}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer>
          <Button
            onClick={onConfirm}
            disabled={!cofirmEnabled}
            className="btn btn-turquoise"
          >
            Confirm
          </Button>
          <Button onClick={this.closeHandler} className="btn btn-danger">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ModalComponent;
