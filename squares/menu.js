class Slider {
    constructor(div, name, min, max, step, val) {
        this.div = div;
        this.name = name;
        this.min = min;
        this.max = max;
        this.step = step;
        this.val = val;
        this.init();
    }

    init() {
        const container = document.createElement("div");

        //label for the range
        const label = document.createElement("label");
        label.innerHTML = this.name;

        //range
        this.input = document.createElement("input");
        this.input.type = "range";
        this.input.min = this.min;
        this.input.max = this.max;
        this.input.value = this.val;
        this.input.step = this.step;

        //output display
        const output = document.createElement("output");
        output.textContent = this.input.value;
        this.input.addEventListener("input", (event) => {
            output.textContent = event.target.value;
        });

        //add everything together
        container.appendChild(label);
        container.appendChild(this.input);
        container.appendChild(output);
        this.div.appendChild(container);
    }

    value() {
        return parseFloat(this.input.value);
    }
}