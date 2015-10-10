import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            realtime: 'connecting'
        }
    }

    componentDidMount() {
        this.socket = io('https://localhost:3001', { transports: ['websocket'] });

        this.socket.on('connect', () => {
            this.setState({
                realtime: 'connected'
            })
        });

        this.socket.on('event', (data) => {
            this.setState({
                realtime: 'receiving: ' + data.length
            })
        });

        this.socket.on('disconnect', () => {
            this.setState({
                realtime: 'disconnected'
            })
        });
    }

    render() {
        return (
            <div>
                <div>Hi, this is eve</div>
                <div>Realtime status: {this.state.realtime}</div>
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
