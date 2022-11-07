namespace App {
    //custom types
    export enum ProjectStatus {
        Active,
        Finished,
    }

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
}
