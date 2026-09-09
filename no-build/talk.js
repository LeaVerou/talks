import "./prism.js";
import Inspire from "inspirejs.org";
import { registry } from "@inspirejs/core";
import "./components/file-tree.js";

registry.markdown = {
	test: "[data-markdown-elements]",
	base: new URL("../", import.meta.resolve("@inspirejs/markdown")),
};
