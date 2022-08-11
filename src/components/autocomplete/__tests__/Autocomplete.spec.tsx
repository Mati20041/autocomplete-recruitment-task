import {waitFor, render, screen, within} from "@testing-library/react";
import {Autocomplete} from "../Autocomplete";
import userEvent from "@testing-library/user-event";
import {wait} from "@testing-library/user-event/dist/utils";


const onChange = jest.fn();
const producer = jest.fn();


describe("Autocomplete", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    it("should render ok", () => {
        // Arrange & Act
        const {getInput, querySuggestions} = renderAutocomplete();

        // Assert
        const input = getInput();
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute("placeholder", "Please type here for hints");
        expect(querySuggestions()).not.toBeInTheDocument();
    });

    it("should display suggestions", async () => {
        // Arrange
        const suggestions = ["a", "aa", "abc"];
        producer.mockResolvedValue(suggestions)
        // Act
        const {getInput, getSuggestions} = renderAutocomplete();

        const input = getInput();
        userEvent.type(input, "a")

        await waitFor(() => expect(getSuggestions()).toBeInTheDocument());

        const items = within(getSuggestions()).getAllByRole("option")
        expect(items.map(it => it.textContent)).toEqual(suggestions);
    });

    it("should should hide suggestions if input value is empty", async () => {
        // Arrange
        const suggestions = ["a", "aa", "abc"];
        producer.mockResolvedValue(suggestions)
        // Act
        const {getInput, getSuggestions, querySuggestions} = renderAutocomplete();

        const input = getInput();
        userEvent.type(input, "a")

        await waitFor(() => expect(getSuggestions()).toBeInTheDocument());
        const items = within(getSuggestions()).getAllByRole("option");

        expect(items[1].textContent).toEqual(suggestions[1]);
        userEvent.click(items[1]);

        await waitFor(() => expect(querySuggestions()).not.toBeInTheDocument());
        expect(input).toHaveValue(suggestions[1])
    });

    it("should hide suggestions and set input value on choosing", async () => {
        // Arrange
        const suggestions = ["a", "aa", "abc"];
        producer.mockResolvedValue(suggestions)
        // Act
        const {getInput, getSuggestions, querySuggestions} = renderAutocomplete();

        const input = getInput();
        userEvent.type(input, "a")

        await waitFor(() => expect(getSuggestions()).toBeInTheDocument());

        userEvent.clear(input);
        await waitFor(() => expect(querySuggestions()).not.toBeInTheDocument());
    });

    // I should add a test for text highlight, and also verify `onChange` handler, but I run out of time ;)

})


const renderAutocomplete = () => {
    render(<Autocomplete suggestionProducer={producer} onChange={onChange}/>)

    return {
        getInput: () => screen.getByRole("textbox"),
        querySuggestions: () => screen.queryByTestId("suggestions"),
        getSuggestions: () => screen.getByTestId("suggestions")
    }
}
