import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

export default class Test extends React.Component {
    constructor(props) {
        super(props);

        this.loadSomething = this.loadSomething.bind(this);

        this.state = {
            action: 'something is missing'
        };
    }

    delay(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }

    async loadSomething() {
        this.setState({ action: 'loading something'});
        await this.delay(2000);
        this.setState({ action: 'something has loaded'});
    }

    render() {
        return (
            <div>
                <Button bsStyle="primary" onClick={this.loadSomething}>Click me to load something</Button>
                <p>
                    <span>{this.state.action}</span>
                </p>
            </div>
        );
    }
}
