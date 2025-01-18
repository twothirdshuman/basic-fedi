// @ts-check
import { createSignal, batch, For } from "https://esm.sh/solid-js@1.8.1";
// import { createStore } from "https://esm.sh/solid-js@1.8.1/store"
import { render } from "https://esm.sh/solid-js@1.8.1/web";
import html from "https://esm.sh/solid-js@1.8.1/html";

const [getPosts, setPosts] = createSignal(["Mamma mia!", "wow solidjs doesn't suck balls", 
    "you can only kiss yourself on the lips in a mirror",
    "the mening of life is uifhiousfhoasiduf",
    "your mom! HAHAHAHA got youuuuu!",
    "WEEEWOOO WEEEWOOO WEEEWOOO",
    "I am happy and so exicted!!",
    "冰淇淋 冰淇淋 冰淇淋 冰淇淋 冰淇淋",
    "This is a post",
    "Sometimes I think but then i stop"].sort(() => Math.random() - 0.5));


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
            const newPosts = [textAreaRef?.value, ...posts];
            setPosts(newPosts);
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
 * @param {PostParam} props
 */
const Post = (props) => {
    return html`
        <div class="post">
            <span>${props.postText}</span>
        </div>
    `;
};

const PostsColumn = () => {

    return html`
        <div class="flex-down column-width">
            <${For} each=${getPosts} fallback=${html`<div>Loading...</div>`}>
                ${(/** @type {string} */ item) => html`<${Post} postText="${item}"><//>`}
            <//>
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
