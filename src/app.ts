import { MainForm } from "./components/project-input.js";
import { OutputList } from "./components/project-output.js";
import { ProjectStatus } from "./models/project.js";

//render to the DOM
new MainForm();
new OutputList(ProjectStatus.Active);
new OutputList(ProjectStatus.Finished);
