//custom types
enum ProjectStatus {
    Active,
    Finished,
}

interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
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

type Listener<T> = (items: T[]) => void;

//state management
abstract class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }

    updateListeners(stateCopy: T[]) {
        for (const listenerFn of this.listeners) {
            listenerFn(stateCopy);
        }
    }

    constructor() {}
}

class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState; //singleton pattern

    private constructor() {
        super();
    }

    //singleton pattern
    static getInstance(): ProjectState {
        if (!this.instance) {
            this.instance = new ProjectState();
        }
        return this.instance;
    }

    addProject(title: string, description: string, numPeople: number) {
        const newProject = new Project(Math.random().toString(), title, description, numPeople, ProjectStatus.Active);

        this.projects.push(newProject);
        this.updateProjectListeners();
    }

    moveProject(id: string, newStatus: ProjectStatus) {
        const prj = this.projects.find((p) => p.id === id);
        if (prj && prj.status !== newStatus) {
            prj.status = newStatus;
            this.updateProjectListeners();
        }
    }

    private updateProjectListeners() {
        this.updateListeners(this.projects.slice());
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

//component base class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    rootElement: T;
    baseElement: U;

    constructor(templateId: string, rootElementId: string, newElementId?: string, prepend: boolean = false) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.rootElement = document.getElementById(rootElementId)! as T;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.baseElement = importedNode.firstElementChild as U;
        if (newElementId) {
            this.baseElement.id = newElementId;
        }

        this.attach(prepend);
    }

    private attach(prepend: boolean) {
        this.rootElement.insertAdjacentElement(prepend ? "afterbegin" : "beforeend", this.baseElement);
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

//output list item class
class OutputListItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    get numPeopleText() {
        return `Number of People: ${this.project.people.toString()}`;
    }

    constructor(parentListId: string, private project: Project) {
        super("single-project", parentListId, `project-item-${project.id}`);

        this.configure();
        this.renderContent();
    }

    @autobind
    dragStartHandler(event: DragEvent) {
        event.dataTransfer!.setData("text/plain", this.project.id);
        event.dataTransfer!.effectAllowed = "move";
    }

    dragEndHandler(_event: DragEvent) {}

    configure() {
        this.baseElement.addEventListener("dragstart", this.dragStartHandler);
        this.baseElement.addEventListener("dragend", this.dragEndHandler);
    }

    renderContent() {
        this.baseElement.querySelector("h2")!.textContent = this.project.title;
        this.baseElement.querySelector("h3")!.textContent = this.numPeopleText;

        this.baseElement.querySelector("p")!.textContent = this.project.description;
        const prjDescLabel = document.createElement("h3") as HTMLHeadingElement;
        prjDescLabel.textContent = "Description:";
        this.baseElement.querySelector("p")!.prepend(prjDescLabel);
    }
}

//output list class
class OutputList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    projectList: Project[];

    get listTypeText() {
        return this.listType === ProjectStatus.Active ? "active" : "finished";
    }

    get listId() {
        return `${this.listTypeText}-projects-list`;
    }

    constructor(private listType: ProjectStatus) {
        const listTypeText = listType === ProjectStatus.Active ? "active" : "finished";
        super("project-list", "app", `${listTypeText}-projects`, false);
        this.projectList = [];

        this.configure();
        this.renderContent();
    }

    @autobind
    dragOverHandler(event: DragEvent) {
        if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            event.preventDefault();
            const listEl = this.baseElement.querySelector("ul")!;
            listEl.classList.add("droppable");
        }
    }

    @autobind
    dropHandler(event: DragEvent) {
        const droppedProjectId = event.dataTransfer!.getData("text/plain");
        projectsStore.moveProject(droppedProjectId, this.listType);
    }

    @autobind
    dragLeaveHandler(_event: DragEvent) {
        const listEl = this.baseElement.querySelector("ul")!;
        listEl.classList.remove("droppable");
    }

    renderContent() {
        this.baseElement.querySelector("ul")!.id = this.listId;
        this.baseElement.querySelector("h2")!.textContent = `${this.listTypeText.toUpperCase()} PROJECTS`;
    }

    configure() {
        projectsStore.addListener((projectsList: Project[]) => {
            this.projectList = projectsList.filter((prj) => prj.status === this.listType);
            this.renderProjects();
        });

        this.baseElement.addEventListener("dragover", this.dragOverHandler);
        this.baseElement.addEventListener("dragleave", this.dragLeaveHandler);
        this.baseElement.addEventListener("drop", this.dropHandler);
    }

    private renderProjects() {
        const listEl = document.getElementById(this.listId)!;
        listEl.innerHTML = "";
        for (const prj of this.projectList) {
            new OutputListItem(this.listId, prj);
        }
    }
}

//main form class
class MainForm extends Component<HTMLDivElement, HTMLFormElement> {
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

//instantiate project state
const projectsStore = ProjectState.getInstance();
//render to the DOM
const prjInput = new MainForm();
const prjList_active = new OutputList(ProjectStatus.Active);
const prjList_finished = new OutputList(ProjectStatus.Finished);
