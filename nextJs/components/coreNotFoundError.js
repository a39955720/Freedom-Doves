import styled from "styled-components"

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`

const ErrorMessage = styled.span`
    font-size: 18px;
    font-weight: 600;
`

const ChromeStoreLogo = styled.img`
    height: 32px;
    margin: 0 12px 0 0;
`

const Link = styled.a`
    font-size: 16px;
    line-height: 1;
    font-weight: 600;
    color: #fff;
    margin: 12px 0 0 0;
    border-radius: 8px;
    padding: 12px;
    display: flex;
    align-items: center;

    &:hover {
        background-color: rgba(255, 255, 255, 0.08);
    }
`

export function CoreNotFoundError() {
    return (
        <Container>
            <ErrorMessage>Core Extension not found.</ErrorMessage>
            <Link
                className="flex items-center justify-between w-300 h-12 bg-gray-800 rounded-lg border-none transition-colors duration-100 hover:bg-gray-700 text-white px-12 cursor-pointer"
                target="_blank"
                rel="noreferrer"
                href="https://chrome.google.com/webstore/detail/core/agoakfejjabomempkjlepdflaleeobhb"
            >
                <span>Download Core</span>
            </Link>
        </Container>
    )
}
