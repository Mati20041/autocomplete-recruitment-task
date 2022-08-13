import React, {ChangeEventHandler, useCallback, useEffect, useMemo, useState} from "react";
import "./Autocomplete.css";

export interface AutocompleteProps {
    suggestionProducer: (part: string) => Promise<string[]>,
    onChange: (value: string) => unknown;
    debounceTime?: number
}

const filterSuggestions = (value: string, suggestions: string[]) => suggestions.filter(s => s.includes(value));

export const Autocomplete = ({suggestionProducer, onChange, debounceTime}: AutocompleteProps) => {
    const [currentValue, setCurrentValue] = useState<string>("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [fetchingSuggestions, setFetchingSuggestions] = useState(false);

    useEffect(() => {
        let canceled = false;
        let timeoutId: number | null = null;
        if(currentValue) {
            setFetchingSuggestions(true);
            timeoutId = Number(setTimeout(() => {
                suggestionProducer(currentValue)
                    .then((suggestions) => {
                        const filteredSuggestions = filterSuggestions(currentValue, suggestions);
                        if(!canceled) setSuggestions(filteredSuggestions);
                    }).catch(error => {
                        console.log(error); // Probably a better error handling would be preferable
                        if(!canceled) setSuggestions([]);
                    }).finally(() => {
                    if(!canceled) setFetchingSuggestions(false);
                });
            }, debounceTime ?? 300))
        } else {
            setSuggestions([]);
            setFetchingSuggestions(false);
        }

        return () => {
            canceled = true;
            if(timeoutId) {
                clearTimeout(timeoutId);
            }
        }
    }, [currentValue, debounceTime, suggestionProducer])

    const setValue = useCallback((value: string) => {
        onChange(value);
        setCurrentValue(value);
    }, [onChange])

    const handleInput: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        const value = e.target.value;
        setValue(value);
    }, [setValue])

    // We could optimize rendering Autocomplete further by using a reference to an 'observable'
    // and pass it to <Suggestions/> instead of using "useState", but in my opinion this is too hacky
    return <div className="autocomplete">
        <input value={currentValue} type="text" onChange={handleInput} placeholder="Please type here for hints"/>
        <div className="autocomplete-suggestions" data-testid="suggestions">
            {fetchingSuggestions ? "Loading..." :
                <Suggestions onSelect={(value) => {
                    setValue(value);
                }} suggestions={suggestions} suggestionPhrase={currentValue}/>}
        </div>
    </div>
}


interface SuggestionProps {
    suggestions: string[],
    suggestionPhrase: string,
    onSelect: (value: string) => any
}

const Suggestions = React.memo(({suggestions, onSelect, suggestionPhrase}: SuggestionProps) => {
    if (suggestions.length === 0) {
        return <></>;
    }
    return <>
        {suggestions.map(suggestion => <Item key={suggestion} suggestionPhrase={suggestionPhrase} onSelect={onSelect}
                                             suggestion={suggestion}/>)}
    </>;
});

const Item = React.memo(({
                             suggestion,
                             suggestionPhrase,
                             onSelect
                         }: { suggestion: string, suggestionPhrase: string, onSelect: (value: string) => void }) => {
    const highlightedSuggestion = useMemo(() => {
        const startPhrase = suggestion.indexOf(suggestionPhrase);
        const length = suggestionPhrase.length;
        const endPhrase = startPhrase + length;
        return (<>
            {suggestion.slice(0, startPhrase)}
            <mark>{suggestion.slice(startPhrase, endPhrase)}</mark>
            {suggestion.slice(endPhrase, suggestion.length)}
        </>);
    }, [suggestion, suggestionPhrase])

    const handleClick = useCallback(() => onSelect(suggestion), [onSelect, suggestion])
    return <div role="option" aria-selected="false" className="autocomplete-item"
                onClick={handleClick}>{highlightedSuggestion}</div>;
});
