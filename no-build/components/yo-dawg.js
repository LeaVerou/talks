import css from "./yo-dawg.css" with { type: "css" };

const IMAGE = import.meta.resolve("../images/yo-dawg.png");
const WIDTH = 1537;
const HEIGHT = 1023;
const LINE_HEIGHT = 1.1;
const TEXT_WIDTH = WIDTH * .94;
const BLANK_LINE = /\n\s*\n/;
const PARAGRAPH = "p, div";
const SVG = "http://www.w3.org/2000/svg";

/**
 * The Xzibit “Yo dawg” meme, as SVG so the text scales with the element and shrinks to fit its width.
 * Its text content is the caption: a blank line separates the top block from the bottom one,
 * so text with no blank line is top-only and text starting with one is bottom-only.
 * Line breaks within a block are honored; nothing is wrapped automatically.
 * @element yo-dawg
 */
class YoDawg extends HTMLElement {
	#internals = this.attachInternals();
	#text = {};

	constructor () {
		super();

		// Default semantics, so an author aria-label or role still wins
		this.#internals.role = "img";

		let root = this.attachShadow({ mode: "open" });
		root.adoptedStyleSheets = [css];
		// The host carries the accessible name, so the rendering itself is decorative
		root.innerHTML = `<svg aria-hidden="true" viewBox="0 0 ${WIDTH} ${HEIGHT}" style="--height: ${HEIGHT}px">
			<image href="${IMAGE}" width="${WIDTH}" height="${HEIGHT}" />
			<text class="top" part="text top" y="0"></text>
			<text class="bottom" part="text bottom" y="${HEIGHT}"></text>
		</svg>`;

		for (let position of ["top", "bottom"]) {
			this.#text[position] = root.querySelector(`.${position}`);
		}

		// Catches both the parser streaming our text in and later edits
		new MutationObserver(() => this.#render()).observe(this, {
			childList: true,
			subtree: true,
			characterData: true,
		});

		// Lines cannot be measured until we are rendered, which may be long after we are parsed
		new ResizeObserver(() => this.#fit()).observe(this);
	}

	connectedCallback () {
		this.#render();
	}

	/**
	 * Our caption, as written: markdown slides render the blank line as a paragraph boundary,
	 * so paragraphs count as blank lines and both contexts parse the same.
	 * Inline elements are not boundaries, they just contribute their text.
	 * NOTE On a markdown slide a *leading* blank line is swallowed, so bottom-only needs a non-markdown slide.
	 */
	get #source () {
		let source = "";

		for (let node of this.childNodes) {
			if (node.matches?.(PARAGRAPH) && source.trim()) {
				source += "\n\n";
			}

			source += node.textContent;
		}

		return source;
	}

	#render () {
		// Any further blank lines are just paragraph breaks within the bottom block
		let [top, ...rest] = this.#source.split(BLANK_LINE);
		let captions = [];

		for (let [position, source] of Object.entries({ top, bottom: rest.join("\n") })) {
			let lines = source.split("\n").map(line => line.trim()).filter(Boolean);
			let element = this.#text[position];

			captions.push(lines.join(" "));

			element.replaceChildren(...lines.map(line => {
				let tspan = document.createElementNS(SVG, "tspan");
				tspan.setAttribute("x", "50%");
				tspan.textContent = line;
				return tspan;
			}));
		}

		this.#fit();

		// The blocks are separate utterances, and the image itself is part of the joke
		this.#internals.ariaLabel = captions.filter(Boolean).join(". ") + " (Xzibit “Yo dawg” meme)";
	}

	/**
	 * Scale each line down until it fits the width, on its own, so no line is held back by its neighbours.
	 * Leading is divided by the same factor, so scaling a line never changes where the next one sits.
	 */
	#fit () {
		for (let [position, element] of Object.entries(this.#text)) {
			let lines = [...element.children];

			for (let line of lines) {
				line.style.fontSize = "";
			}

			// Both blocks lay out downwards, so the bottom one starts high enough to end on its last line
			let start = position === "bottom" ? -LINE_HEIGHT * (lines.length - 1) : 1;

			for (let [i, line] of lines.entries()) {
				// Zero until we are rendered (an inactive slide, say); the resize observer retries
				let width = line.getComputedTextLength();
				let scale = width > TEXT_WIDTH ? TEXT_WIDTH / width : 1;

				line.style.fontSize = scale < 1 ? scale * 100 + "%" : "";
				line.setAttribute("dy", (i === 0 ? start : LINE_HEIGHT) / scale + "em");
			}
		}
	}
}

customElements.define("yo-dawg", YoDawg);

export default YoDawg;
