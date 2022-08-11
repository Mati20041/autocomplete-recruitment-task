import React from 'react';
import './App.css';
import mockData from "./mockData.json";
import {Autocomplete} from "./components/autocomplete/Autocomplete";

const producer = async (value: string): Promise<string[]> => {
    return value.length > 0 ? mockData.filter(v => v.indexOf(value) !== -1).slice(0,10) : [];
}


const App = () => (
    <div>
        <h1>Hi!</h1>
        <div className="autocomplete-wrapper">
            <Autocomplete suggestionProducer={producer} onChange={console.log}/>
        </div>
    </div>
);


export default App;
