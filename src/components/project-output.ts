import { Component } from "./base-component";
import { DragTarget, Draggable } from "../models/drag-drop";
import { Project, ProjectStatus } from "../models/project";
import { autobind } from "../decorators/autobind";
import { projectsStore } from "../store/project";

//output list item class
export class OutputListItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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
export class OutputList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    projectList: Project[] = [];

    get listTypeText() {
        return this.listType === ProjectStatus.Active ? "active" : "finished";
    }

    get listId() {
        return `${this.listTypeText}-projects-list`;
    }

    constructor(private listType: ProjectStatus) {
        const listTypeText = listType === ProjectStatus.Active ? "active" : "finished";
        super("project-list", "app", `${listTypeText}-projects`, false);

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
        this.updateProjectList(projectsStore.current);
    }

    configure() {
        projectsStore.addListener((allProjects: Project[]) => {
            this.updateProjectList(allProjects);
        });

        this.baseElement.addEventListener("dragover", this.dragOverHandler);
        this.baseElement.addEventListener("dragleave", this.dragLeaveHandler);
        this.baseElement.addEventListener("drop", this.dropHandler);
    }

    @autobind
    private updateProjectList(newProjectList: Project[]) {
        this.projectList = newProjectList.filter((prj: Project) => prj.status === this.listType);
        this.renderProjects();
    }

    private renderProjects() {
        const listEl = document.getElementById(this.listId)!;
        listEl.innerHTML = "";
        for (const prj of this.projectList) {
            new OutputListItem(this.listId, prj);
        }
    }
}
