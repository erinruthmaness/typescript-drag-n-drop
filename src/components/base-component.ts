namespace App {
    //component base class
    export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
        templateElement: HTMLTemplateElement;
        rootElement: T;
        baseElement: U;

        constructor(templateId: string, rootElementId: string, newElementId?: string, prepend: boolean = false) {
            this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
            this.rootElement = document.getElementById(rootElementId)! as T;

            const importedNode = document.importNode(this.templateElement.content, true);
            this.baseElement = importedNode.firstElementChild as U;
            if (newElementId) {
                this.baseElement.id = newElementId;
            }

            this.attach(prepend);
        }

        private attach(prepend: boolean) {
            this.rootElement.insertAdjacentElement(prepend ? "afterbegin" : "beforeend", this.baseElement);
        }

        abstract configure(): void;
        abstract renderContent(): void;
    }
}
