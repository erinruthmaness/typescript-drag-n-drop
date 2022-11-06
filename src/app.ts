//validation
interface ValidationParams {
    value: string | number;
    required: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validateUserInput(inputParams: ValidationParams) {
    let isValid = true;
    if (inputParams.required) {
        isValid = isValid && inputParams.value.toString().trim().length !== 0;
    }
    if (typeof inputParams.value === "string") {
        if (inputParams.minLength != null) {
            isValid = isValid && inputParams.value.length >= inputParams.minLength;
        }
        if (inputParams.maxLength != null) {
            isValid = isValid && inputParams.value.length <= inputParams.maxLength;
        }
    }
    if (typeof inputParams.value === "number") {
        if (inputParams.min != null) {
            isValid = isValid && inputParams.value >= inputParams.min;
        }
        if (inputParams.max != null) {
            isValid = isValid && inputParams.value <= inputParams.max;
        }
    }
    return isValid;
}

//autobind decorator
function autobind(_target: any, _methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false, //won't show up in for in loops
        get() {
            //get is a value property with extra logic before returning the value
            const boundFn = originalMethod.bind(this); //refers to object that defines the getter
            return boundFn;
        },
    };
    return adjustedDescriptor; //replaces the original descriptor with this one
}

//main form class
class MainForm {
    templateElement: HTMLTemplateElement;
    rootElement: HTMLDivElement;
    formElement: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    get isUserInputValid(): boolean {
        const titleParams: ValidationParams = {
            value: this.titleInputElement.value,
            required: true,
        };
        const descParams: ValidationParams = {
            value: this.descriptionInputElement.value,
            required: true,
            minLength: 5,
        };
        const peopleParams: ValidationParams = {
            value: +this.peopleInputElement.value,
            required: true,
            min: 1,
            max: 5,
        };

        return validateUserInput(titleParams) && validateUserInput(descParams) && validateUserInput(peopleParams);
    }

    get userInput(): [string, string, number] | void {
        if (this.isUserInputValid) {
            return [this.titleInputElement.value, this.descriptionInputElement.value, +this.peopleInputElement.value];
        } else {
            console.error("invalid input");
            return;
        }
    }

    constructor() {
        this.templateElement = document.getElementById("project-input")! as HTMLTemplateElement;
        this.rootElement = document.getElementById("app")! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.formElement = importedNode.firstElementChild as HTMLFormElement;
        this.formElement.id = "user-input";

        this.titleInputElement = this.formElement.querySelector("#title") as HTMLInputElement;
        this.descriptionInputElement = this.formElement.querySelector("#description") as HTMLInputElement;
        this.peopleInputElement = this.formElement.querySelector("#people") as HTMLInputElement;

        this.addSubmitHandler();
        this.attachForm();
    }

    private clearInputs() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }

    @autobind
    private submitHandler(e: Event) {
        e.preventDefault();

        if (Array.isArray(this.userInput)) {
            const [title, desc, people] = this.userInput;
            console.log(title, desc, people);
            this.clearInputs();
        }
    }

    private addSubmitHandler() {
        this.formElement.addEventListener("submit", this.submitHandler);
    }

    private attachForm() {
        this.rootElement.insertAdjacentElement("afterbegin", this.formElement);
    }
}

const prjInput = new MainForm();
