import React from 'react';
import ReactDOM from 'react-dom';

export default class App extends React.Component {
    render() {
        return (
            <div>Hi, this is eve</div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
