const template = `
<div class="stepper">
	<button @click="step(-1)" :disabled="modelValue <= min">-</button>
	<strong>{{ modelValue }}</strong>
	<button @click="step(1)" :disabled="modelValue >= max">+</button>
	<slot>iterations</slot>
</div>
`

// A numeric stepper bound via v-model. Clamps to [min, max].
export default {
	template,
	props: {
		modelValue: { type: Number, default: 1 },
		min: { type: Number, default: 1 },
		max: { type: Number, default: Infinity },
	},
	emits: ["update:modelValue"],
	methods: {
		step (delta) {
			let value = Math.min(this.max, Math.max(this.min, this.modelValue + delta));
			this.$emit("update:modelValue", value);
		},
	},
};
