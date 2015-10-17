import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

export default class Test extends React.Component {
    render() {
        return (
            <ButtonGroup>
                <Button bsStyle="primary">Click me</Button>
                <Button bsStyle="default">And me too</Button>
            </ButtonGroup>
        );
    }
}
