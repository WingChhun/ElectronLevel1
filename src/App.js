import React, {Component} from 'react';
import Markdown from 'markdown-to-jsx';
//import logo from './logo.svg';
import './App.css';

const {ipcRenderer} = window.require('electron');

class App extends Component {

    constructor() {
        super();

        this.state = {
            loadedFile: ''
        };

        ipcRenderer.on('new-file', (event, fileContent) => {
            this.setState({loadedFile: fileContent});
        });
    }

    render() {
        return (
            <div className="App">
                <Markdown>{this.state.loadedFile}</Markdown>
            </div>
        );
    }
}

export default App;
