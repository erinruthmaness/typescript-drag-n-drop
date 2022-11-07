/// <reference path="base-component.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../models/project.ts" />
/// <reference path="../store/project.ts" />
/// <reference path="../util/validation.ts" />

namespace App {
    //main form class
    export class MainForm extends Component<HTMLDivElement, HTMLFormElement> {
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
                return [
                    this.titleInputElement.value,
                    this.descriptionInputElement.value,
                    +this.peopleInputElement.value,
                ];
            } else {
                console.error("invalid input");
                return;
            }
        }

        constructor() {
            super("project-input", "app", "user-input", true);
            this.titleInputElement = this.rootElement.querySelector("#title") as HTMLInputElement;
            this.descriptionInputElement = this.rootElement.querySelector("#description") as HTMLInputElement;
            this.peopleInputElement = this.rootElement.querySelector("#people") as HTMLInputElement;

            this.configure();
        }

        configure() {
            this.rootElement.addEventListener("submit", this.submitHandler);
        }

        renderContent() {}

        private clearInputs() {
            this.titleInputElement.value = "";
            this.descriptionInputElement.value = "";
            this.peopleInputElement.value = "";
        }

        @autobind
        private submitHandler(e: Event) {
            e.preventDefault();

            if (Array.isArray(this.userInput)) {
                projectsStore.addProject(...this.userInput);
                this.clearInputs();
            }
        }
    }
}
