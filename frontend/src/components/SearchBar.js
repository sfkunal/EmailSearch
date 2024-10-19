import { useState } from 'react';
import queryEmails from '../api/queryEmails.js';
import queryLanguageModel from '../api/queryLanguageModel.js';


const SearchBar = ({ setSearchResults, setLanguageModelResponse }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [position, setPosition] = useState('top');
    const [isVisible, setIsVisible] = useState(true);

    const handleClick = async (event) => {
        event.preventDefault();
        if (position === 'top') {
            setIsVisible(false);
            setTimeout(() => {
                setPosition('bottom');
                setIsVisible(true);
            }, 500); // This should match the transition duration in CSS
        }
        const result = await queryEmails(searchQuery);
        setSearchResults(result);
        console.log("received data: ", result);

        if (result) {
            const response = await queryLanguageModel(result.ids, searchQuery);
            console.log("language model response: ", response);
            setLanguageModelResponse(response);
        }
    };

    const handleChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleClick(e);
    };

    return (
        <form className={`SearchBar ${position} ${isVisible ? 'visible' : 'hidden'}`} onSubmit={handleSubmit}>
            <input
                type="text"
                value={searchQuery}
                onChange={handleChange}
                placeholder="Search Mail"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleSubmit(e);
                    }
                }}
            />
            <button type="submit" style={{
                backgroundColor: "#64758d",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "12px",
                cursor: "pointer",
            }}>
                Search
            </button>
        </form>
    );
};

export default SearchBar;