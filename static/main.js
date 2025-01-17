// @ts-check
import { createSignal, batch, For } from "https://esm.sh/solid-js@1.8.1";
import { createStore } from "https://esm.sh/solid-js@1.8.1/store"
import { render } from "https://esm.sh/solid-js@1.8.1/web";
import html from "https://esm.sh/solid-js@1.8.1/html";

const [getPosts, setPosts] = createSignal(/** @type {string[]} */ ([]));

const InfoColumn = () => {
    return html`
        <div class="column-width">
            <span style="text-align: center;">TODO</span>
        </div>
    `;
};

const WritePostColumn = () => {
    const [waah, setWaah] = createSignal(0);
    /**
     * @type {undefined | HTMLTextAreaElement}
     */
    let textAreaRef = undefined;
    const onClick = () => {
        setWaah(waah() + 1);
        if (textAreaRef !== undefined) {
            const posts = getPosts();
            posts.push(textAreaRef?.value);
            setPosts(posts);
        }
    };

    const pleepString = () => {
        if (waah() === 0) {
            return "Pleep!";
        }
        return `Pleeped ${waah()} times and ${textAreaRef?.value}`;
    };

    return html`
        <div class="flex-down column-width">
            <textarea class="post-textarea" placeholder="What's on your mind?" ref=${
                /**
                 * @param {HTMLTextAreaElement} el  
                 */
                (el) => (textAreaRef = el)
            }></textarea>
            <div class="flex-right space-between" style="margin-top: 6px">
                <div></div>
                <button class="pleep-button" onmousedown=${onClick}>${pleepString}</button>
            </div>
        </div>
    `;
};



/**
 * @typedef {{postText: string}} PostParam
 * @param {PostParam} 
 */
const Post = (props) => {
    return html`
        <div>
            <span>${props.}</span>
        </div>
    `;
};

const PostsColumn = () => {
    return html`
        <div class="flex-down column-width">

        </div>
    `
};

const App = () => {
    return html`
        <div class="flex-right space-around">
            <div class="flex-right column-container">
                ${WritePostColumn}
                ${PostsColumn}
                ${InfoColumn}
            </div>
        </div>
    `;
};

const root = document.getElementById("solidjs-root");
if (root === null) {
    alert("Invalid html from server");
} else {
    render(App, root);
}