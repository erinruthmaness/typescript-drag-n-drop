/// <reference path="components/project-input.ts" />
/// <reference path="components/project-output.ts" />
/// <reference path="models/project.ts" />

namespace App {
    //render to the DOM
    new MainForm();
    new OutputList(ProjectStatus.Active);
    new OutputList(ProjectStatus.Finished);
}
