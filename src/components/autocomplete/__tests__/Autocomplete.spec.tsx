import {render, screen, waitFor, within} from "@testing-library/react";
import {Autocomplete} from "../Autocomplete";
import userEvent from "@testing-library/user-event";


const onChange = jest.fn();
const producer = jest.fn();


const suggestionsFake = ["aa", "ab", "bb", "bc"];

describe("Autocomplete", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    it("should render ok", () => {
        // Arrange & Act
        const {getInput, getSuggestions, queryItems} = renderAutocomplete();

        // Assert
        const input = getInput();
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute("placeholder", "Please type here for hints");
        expect(getSuggestions()).toBeInTheDocument();
        expect(getSuggestions()).toBeEmptyDOMElement();
        expect(queryItems()).toHaveLength(0);
    });

    it("should should hide suggestions if input value is empty", async () => {
        // Arrange
        producer.mockResolvedValue(suggestionsFake);

        const {getInput, queryItems, getSuggestions} = renderAutocomplete();

        const input = getInput();
        userEvent.type(input, "a")

        await waitFor(() => expect(queryItems()).toHaveLength(2));
        const items = queryItems();

        expect(items[1].textContent).toEqual(suggestionsFake[1]);

        // Act
        userEvent.click(items[1]);

        // Assert
        await waitFor(() => expect(getSuggestions()).toBeEmptyDOMElement());
        expect(input).toHaveValue(suggestionsFake[1]);
        expect(onChange).toHaveBeenCalledWith(suggestionsFake[1]);
    });

    it("should display filtered suggestions based on input", async () => {
        // Arrange
        producer.mockResolvedValue(suggestionsFake)
        // Act
        const {getInput, getItems} = renderAutocomplete();

        const input = getInput();
        userEvent.type(input, "a");

        // Assert
        await waitFor(() => expect(getItems()).toHaveLength(2));

        expect(getItems().map(it => it.textContent)).toEqual(["aa", "ab"]);
    });

    it("should hide suggestions and set input value on choosing", async () => {
        // Arrange
        producer.mockResolvedValue(suggestionsFake);

        // Act
        const {getInput, getSuggestions} = renderAutocomplete();

        const input = getInput();
        userEvent.type(input, "a")

        // Assert
        await waitFor(() => expect(getSuggestions()).not.toBeEmptyDOMElement());

        userEvent.clear(input);
        await waitFor(() => expect(getSuggestions()).toBeEmptyDOMElement());
    });

    it("should show loading indicator while fetching", async () => {
        // Arrange
        producer.mockReturnValue(new Promise(() => {}))
        // Act
        const {getInput, getSuggestions, queryItems} = renderAutocomplete();

        const input = getInput();
        userEvent.type(input, "a")

        // Assert
        await waitFor(() => expect(getSuggestions()).toBeInTheDocument());

        expect(getSuggestions()).toHaveTextContent("Loading...");
        expect(queryItems()).toHaveLength(0);
    });

    // I should add a test for text highlight


    it("should highlight found text", async () => {
        // Arrange
        producer.mockResolvedValue(["would"])
        // Act
        const {getInput, getItems} = renderAutocomplete();

        const input = getInput();
        userEvent.type(input, "oul");

        // Assert
        await waitFor(() => expect(getItems()).toHaveLength(1));

        const items = getItems();

        expect(items[0]).toContainHTML("w<mark>oul</mark>d");
    });
})


const renderAutocomplete = () => {
    render(<Autocomplete suggestionProducer={producer} onChange={onChange}/>)

    return {
        getInput: () => screen.getByRole("textbox"),
        getSuggestions: () => screen.getByTestId("suggestions"),
        getItems: () => within(screen.getByTestId("suggestions")).getAllByRole("option"),
        queryItems: () => within(screen.getByTestId("suggestions")).queryAllByRole("option")
    }
}
