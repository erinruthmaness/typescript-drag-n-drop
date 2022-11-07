import _ from "lodash";
import { plainToInstance } from "class-transformer";

import { State } from "../models/state";
import { Project, ProjectStatus } from "../models/project";

import fakeAPIdata from "../util/fakeAPIdata";

const loadedProjects: Project[] = plainToInstance(Project, fakeAPIdata);

export class ProjectState extends State<Project> {
    private projects: Project[];
    private static instance: ProjectState; //singleton pattern

    get current() {
        return this.projects.slice();
    }

    private constructor() {
        super();
        this.projects = loadedProjects.length > 0 ? [...loadedProjects] : [];
        this.updateProjectListeners();
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
        this.updateListeners(this.current);
    }
}

//instantiate project state
export const projectsStore = ProjectState.getInstance();
