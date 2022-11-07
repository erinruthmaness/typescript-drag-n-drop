/// <reference path="../models/state.ts" />

namespace App {
    export class ProjectState extends State<Project> {
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
            const newProject = new Project(
                Math.random().toString(),
                title,
                description,
                numPeople,
                ProjectStatus.Active
            );

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

    //instantiate project state
    export const projectsStore = ProjectState.getInstance();
}
