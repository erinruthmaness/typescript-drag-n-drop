import { MainForm } from "./components/project-input";
import { OutputList } from "./components/project-output";
import { ProjectStatus } from "./models/project";

//render to the DOM
new MainForm();
new OutputList(ProjectStatus.Active);
new OutputList(ProjectStatus.Finished);
