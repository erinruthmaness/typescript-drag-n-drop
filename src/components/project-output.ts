/// <reference path="base-component.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../models/drag-drop.ts" />
/// <reference path="../models/project.ts" />
/// <reference path="../store/project.ts" />

namespace App {
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
}
