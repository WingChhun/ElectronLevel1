import React, {Component} from "react";
import Markdown from "markdown-to-jsx";
import AceEditor from "react-ace";
import brace from "brace";
import styled from "styled-components";

import "brace/mode/markdown";
import "brace/theme/dracula";
import "./App.css";

const settings = window.require("electron-settings");
const {ipcRenderer} = window.require("electron");
const fs = window.require('fs');

class App extends Component {

    //TODO: Constructor
    constructor() {
        super();

        // ** On Load, if directory exists within User/applicationData/ then load that
        // directory

        this.state = {
            loadedFile: "",
            filesData: [],
            directory: settings.get("directory") || null
        };

    }

    componentWillMount()
    {

        const directory = settings.get('directory');

        if (directory) {
            this.loadAndReadFiles(directory);
        }

        // TODO: Handle ipcRenderer commuinication before mounting ** Store users
        // directory on new-file or new-directory
        ipcRenderer.on("new-file", (event, fileContent) => {
            this.setState({loadedFile: fileContent});
        });

        ipcRenderer.on("new-dir", (event, directory) => {
            this.setState({directory});

            //* Set directory that we are getting in settings */
            settings.set("directory", directory);
            this.loadAndReadFiles(directory);
        });
    }

    loadAndReadFiles = directory => {
        let filteredFiles = [];
        let filesData = {};

        fs.readdir(directory, (err, files) => {
            filteredFiles = files.filter(file => file.includes(".md"));
            filesData = filteredFiles.map(file => ({path: `${directory}/${file}`}));

            //*Get directories set fileData in state
            this.setState({
                filesData
            }, () => {
                this.loadFile(0); //*Load first file of the array immediately if there is a directory
            });
        });

    }

    loadFile = index => {

        const {filesData} = this.state;

        const content = fs
            .readFileSync(filesData[index].path)
            .toString();

        this.setState({loadedFile: content});

    }

    render() {
        return (
            <AppWrap>
                <Header>Journal</Header>
                {this.state.directory
                    ? (
                        <Split>
                            <FilesWindow>
                                {this
                                    .state
                                    .filesData
                                    .map((file, index) => <button onClick={() => this.loadFile(index)}>{file.path}</button>)}
                            </FilesWindow>
                            <CodeWindow>
                                <AceEditor
                                    mode="markdown"
                                    theme="dracula"
                                    onChange={newContent => {
                                    this.setState({loadedFile: newContent});
                                }}
                                    name="markdown_editor"
                                    value={this.state.loadedFile}/>
                            </CodeWindow>

                            <RenderedWindow>
                                <Markdown>{this.state.loadedFile}</Markdown>
                            </RenderedWindow>
                        </Split>
                    )
                    : (
                        <LoadingMessage>
                            <h2>Press CmdORCtrl+O to open directory
                            </h2>
                        </LoadingMessage>
                    )}
            </AppWrap>
        );
    }
}

export default App;

const AppWrap = styled.div `
margin-top:23px;


`;

const FilesWindow = styled.div `

background:#140f1d;
border-right:solid 1px #302b3a;
position:relative;
width:20%;
&:after
{
  content:'';
  position:absolute;
  left:0;
  right:0;
  top:0;
  bottom:0;
  pointer-events:none;
  box-shadow:-10px 0 20px rgba(0,0,0,0.3) inset;
}
`;

const Header = styled.header `
  background-color: #191324;
  color: #75717c;
  font-size: 0.8rem;
  height: 23px;
  text-align: center;
  position: fixed;
  box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.2);
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  -webkit-app-region: drag;
`;

const Split = styled.div `
  display: flex;
  height: 100vh;
`;

const CodeWindow = styled.div `
  flex: 1;
  padding-top: 2rem;
  background-color: #191324;
`;

const RenderedWindow = styled.div `
  background-color: #191324;
  width: 35%;
  padding: 20px;
  color: #fff;
  border-left: 1px solid #302b3a;
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: #82d8d8;
  }
  h1 {
    border-bottom: solid 3px #e54b4b;
    padding-bottom: 10px;
  }
  a {
    color: #e54b4b;
  }
`;

const LoadingMessage = styled.div `
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  background-color: #191324;
`;
