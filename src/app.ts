//custom types
enum ProjectStatus {
    Active,
    Finished,
}

//using a class (not interface etc) so it can be instantiated
class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {}
}

type Listener = (items: Project[]) => void;

//state management
class ProjectState {
    private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static instance: ProjectState; //singleton pattern

    private constructor() {}

    //singleton pattern
    static getInstance(): ProjectState {
        if (!this.instance) {
            this.instance = new ProjectState();
        }
        return this.instance;
    }

    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
    }

    addProject(title: string, description: string, numPeople: number) {
        const newProject = new Project(Math.random().toString(), title, description, numPeople, ProjectStatus.Active);

        this.projects.push(newProject);
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice()); //pass a copy of the state array to the listener
        }
    }
}

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

//output list class
class OutputList {
    templateElement: HTMLTemplateElement;
    rootElement: HTMLDivElement;
    listElement: HTMLElement; //it's a <section />
    assignedProjects: Project[];

    get listTypeText() {
        return this.listType === ProjectStatus.Active ? "active" : "finished";
    }

    get listId() {
        return `${this.listTypeText}-projects-list`;
    }

    constructor(private listType: ProjectStatus) {
        this.templateElement = document.getElementById("project-list")! as HTMLTemplateElement;
        this.rootElement = document.getElementById("app")! as HTMLDivElement;
        this.assignedProjects = [];

        const importedNode = document.importNode(this.templateElement.content, true);
        this.listElement = importedNode.firstElementChild as HTMLElement;
        this.listElement.id = `${this.listTypeText}-projects`;

        projectsStore.addListener((projectsList: Project[]) => {
            this.assignedProjects = projectsList.filter((prj) => prj.status === this.listType);
            this.renderProjects();
        });

        this.attachList();
        this.renderListContent();
    }

    private renderProjects() {
        const listEl = document.getElementById(this.listId)!;
        listEl.innerHTML = "";
        for (const prj of this.assignedProjects) {
            const listItem = document.createElement("li");
            listItem.textContent = prj.title;
            listEl?.appendChild(listItem);
        }
    }

    private attachList() {
        this.rootElement.insertAdjacentElement("beforeend", this.listElement);
    }

    private renderListContent() {
        this.listElement.querySelector("ul")!.id = this.listId;
        this.listElement.querySelector("h2")!.textContent = `${this.listTypeText.toUpperCase()} PROJECTS`;
    }
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
            projectsStore.addProject(...this.userInput);
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

//instantiate project state
const projectsStore = ProjectState.getInstance();
//render to the DOM
const prjInput = new MainForm();
const prjList_active = new OutputList(ProjectStatus.Active);
const prjList_finished = new OutputList(ProjectStatus.Finished);
