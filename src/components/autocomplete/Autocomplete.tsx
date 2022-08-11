import React, {ChangeEventHandler, useCallback, useMemo, useRef, useState} from "react";
import {debounce} from "../../debounce";
import "./Autocomplete.css";

export interface AutocompleteProps {
    suggestionProducer: (part: string) => Promise<string[]>,
    onChange: (value: string) => any
}

export const Autocomplete = ({suggestionProducer, onChange}: AutocompleteProps) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [suggestionPhrase, setSuggestionPhrase] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // line below is because of the debounce function
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchSuggestions = useCallback(debounce((value: string) => {
        suggestionProducer(value)
            .then((suggestions) => {
                setSuggestions(suggestions);
                setSuggestionPhrase(value)
            })
            .catch(error => {
                console.log(error); // Probably a better error handling would be preferable
                setSuggestions([]);
            });
    }), [suggestionProducer, setSuggestions, setSuggestionPhrase]);

    const handleInput: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        const value = e.target.value;
        if(value) {
            // Requirements are not specific if only chosen values from suggestion should be valid or any typed value
            onChange(value);
            fetchSuggestions(value);
        } else {
            setSuggestions([]);
        }
    }, [fetchSuggestions, onChange])

    // We could optimize rendering Autocomplete further by using a reference to an 'observable'
    // and pass it to <Suggestions/> instead of using "useState", but in my opinion this is too hacky
    return <div className="autocomplete">
        <input type="text" ref={inputRef} onChange={handleInput} placeholder="Please type here for hints"/>
        <Suggestions onSelect={(value) => {
            if (inputRef.current) {
                inputRef.current.value = value;
                onChange(value);
                setSuggestions([]);
            }
        }} suggestions={suggestions} suggestionPhrase={suggestionPhrase}/>
    </div>
}


interface SuggestionProps {
    suggestions: string[],
    suggestionPhrase: string,
    onSelect: (value: string) => any
}

const Suggestions = ({suggestions, onSelect, suggestionPhrase}: SuggestionProps) => {
    if(suggestions.length === 0) {
        return <></>;
    }
    return <div className="autocomplete-suggestions" data-testid="suggestions">
        {suggestions.map(suggestion => <MemoizedItem key={suggestion} suggestionPhrase={suggestionPhrase} onSelect={onSelect} suggestion={suggestion}/>)}
    </div>;
};
const Item = ({suggestion, suggestionPhrase, onSelect}: { suggestion: string, suggestionPhrase:string, onSelect: (value: string) => void }) => {

    const highlightedSuggestion = useMemo(() => {
        const startPhrase = suggestion.indexOf(suggestionPhrase);
        const length = suggestionPhrase.length;
        const endPhrase = startPhrase + length;
        return (<>
            {suggestion.slice(0, startPhrase)}
            <mark>{suggestion.slice(startPhrase, endPhrase)}</mark>
            {suggestion.slice(endPhrase, suggestion.length)}
        </>);
    },[suggestion, suggestionPhrase])

    const handleClick = useCallback(() => onSelect(suggestion), [onSelect, suggestion])
    // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
    return <div role="option" className="autocomplete-item" onClick={handleClick}>{highlightedSuggestion}</div>;
};

const MemoizedItem = React.memo(Item);
