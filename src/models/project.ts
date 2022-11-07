//custom type
export enum ProjectStatus {
    Active,
    Finished,
}

export type ProjectStatusString = "active" | "finished";

export type ProjectAPIData = {
    id: string;
    title: string;
    description: string;
    people: number;
    finished: boolean;
};

//using a class (not interface etc) so it can be instantiated
export class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {}
}
