import _ from "lodash";

import { State } from "../models/state";
import { Project, ProjectStatus } from "../models/project";

// declare var _: any;  //if you can't install @types but you know the js will work

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
            _.random(0, 999).toString(),
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
