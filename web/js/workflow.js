import { app } from '../../../scripts/app.js';
import { $el } from '../../../scripts/ui.js';
import { commonPrefix } from './common.js';


class CrystoolsSave {
  // common variables
  idExtensionName = 'Crystools.save';
  idNewSave = 'Crystools.newSave';
  idProjectNameShow = 'Crystools.projectNameShow';
  idProjectNameText = 'Crystools.projectNameText';
  idAuthor = 'Crystools.author';
  idDescription = 'Crystools.description';
  idVersion = 'Crystools.version';

  defaultNewSave = true;
  defaultProjectNameShow = true;
  defaultProjectNameText = 'workflow';
  defaultAuthor = '';
  defaultDescription = '';
  defaultVersion = '1';

  menuPrefix = commonPrefix;
  htmlIdCrystoolsRoot = 'crystools-root';
  htmlIdCrystoolsInputContainer = 'crystools-project-input-container';

  // references of htmls elements
  inputRefProjectNameText = null;
  originalSaveEventsRef = null;
  saveButtonRef = null;

  constructor() {
    this.createSettings();
  }

  // not on setup because this affect the order on settings, I prefer to options at first
  createSettings = () => {
    /** Form on settings: (the order is important) */

    // show the input on menu
    app.ui.settings.addSetting({
      id: this.idProjectNameShow,
      name: this.menuPrefix + 'Show project name [menu]',
      type: 'boolean',
      defaultValue: this.defaultProjectNameShow,
      onChange: this.showProjectName,
    });

    // use new save button
    app.ui.settings.addSetting({
      id: this.idNewSave,
      name: this.menuPrefix + 'New save button (requires page reload) [save]',
      type: 'boolean',
      tooltip: 'This will replace the save button function and propose the name of project as filename!',
      defaultValue: this.defaultNewSave,
      onChange: this.saveFunctionSwitch,
    });

    // project name
    app.ui.settings.addSetting({
      id: this.idProjectNameText,
      name: this.menuPrefix + 'Project name [save]',
      type: 'text',
      defaultValue: this.defaultProjectNameText,
      onChange: this.updateProjectName,
    });

    // author
    app.ui.settings.addSetting({
      id: this.idAuthor,
      name: this.menuPrefix + 'Author [save]',
      type: 'text',
      defaultValue: this.defaultAuthor,
      onChange: (value) => {
        this.updateInfoOnGraph({author: value});
      },
    });

    // description
    app.ui.settings.addSetting({
      id: this.idDescription,
      name: this.menuPrefix + 'Description [save]',
      type: 'text',
      defaultValue: this.defaultDescription,
      onChange: (value) => {
        this.updateInfoOnGraph({description: value});
      },
    });

    // version
    app.ui.settings.addSetting({
      id: this.idVersion,
      name: this.menuPrefix + 'Version [save]',
      type: 'text',
      defaultValue: this.defaultVersion,
      onChange: (value) => {
        this.updateInfoOnGraph({version: value});
      },
    });
  };

  setup() {
    // save the original onConfigure event
    const onConfigure = app.graph.onConfigure;
    app.graph.onConfigure = () => {
      // when load a workflow from file pass here!
      // on drops a file on the canvas
      this.getInfoOnGraph().then((p) => {

        if (!p.workflow.extra.info) {
          p.workflow.extra.info = {
            name: this.defaultProjectNameText,
          };
        }

        app.ui.settings.setSettingValue(this.idProjectNameText, p.workflow.extra.info.name);
        this.setInfoOnGraph(p.workflow.extra.info);
        onConfigure?.apply(this, arguments); // recall the original event
      });
    };

    const parentElement = document.getElementById('queue-button');

    let ctoolsRoot = document.getElementById(this.htmlIdCrystoolsRoot);
    if(!ctoolsRoot){
      ctoolsRoot = document.createElement('div');
      ctoolsRoot.setAttribute('id', this.htmlIdCrystoolsRoot);
      ctoolsRoot.style.display = 'flex';
      ctoolsRoot.style.width = '100%';
      ctoolsRoot.style.flexDirection = 'column';
      parentElement.insertAdjacentElement('afterend', ctoolsRoot);
    }

    const htmlContainer = document.createElement('div');
    htmlContainer.setAttribute('id', this.htmlIdCrystoolsInputContainer);
    htmlContainer.style.margin = '6px 0';
    htmlContainer.style.width = '100%';
    htmlContainer.style.order = '5';
    ctoolsRoot.append(htmlContainer);

    const projectNameInput = document.createElement('input');
    projectNameInput.setAttribute('placeholder', 'Project name');
    projectNameInput.style.width = '80%';
    htmlContainer.append(projectNameInput);
    this.inputRefProjectNameText = projectNameInput;

    // events for the input to persist the data on workflow
    projectNameInput.addEventListener('keyup', (event) => {
      app.ui.settings.setSettingValue(this.idProjectNameText, event.target.value);
    });

    // this boolean does not save the value on workflow
    this.showProjectName(app.ui.settings.getSettingValue(this.idProjectNameShow, this.defaultProjectNameShow));

    // this text save the value on workflow and localstorage
    this.updateProjectName(app.ui.settings.getSettingValue(this.idProjectNameText, this.defaultProjectNameText));

    // save the original save button event
    this.saveButtonRef = document.getElementById('comfy-save-button');
    this.originalSaveEventsRef = this.saveButtonRef.onclick;
    this.saveFunctionSwitch(app.ui.settings.getSettingValue(this.idNewSave, this.defaultNewSave));
  }

  showProjectName = (value) => {
    const container = document.getElementById(this.htmlIdCrystoolsInputContainer);

    // validation because this run before setup
    if (container) {
      container.style.display = value ? 'block' : 'none';
    }
  };

  // just persist the data on workflow reference
  setInfoOnGraph = (values) => {
    // create the info object if not exists on workflow
    let name = values?.name || this.defaultProjectNameText;
    // app.ui.settings.setSettingValue(this.idProjectNameText, name);
    values.name = name;

    let author = values?.author || this.defaultAuthor;
    // app.ui.settings.setSettingValue(this.idAuthor, author);
    values.author = author;

    let description = values?.description || this.defaultDescription;
    // app.ui.settings.setSettingValue(this.idDescription, description);
    values.description = description;

    let version = values?.version || this.defaultVersion;
    // app.ui.settings.setSettingValue(this.idVersion, version);
    values.version = version;

    if (!(values?.created)) {
      values.created = new Date().toISOString();
    }

    this.inputRefProjectNameText.value = values.name;
    values.modified = new Date().toISOString();
    values.software = 'ComfyUI';
  };

  // remember to send `{ property: value }`
  updateInfoOnGraph = (value) => {
    if (typeof value !== 'object') {
      console.warn('updateInfoOnGraph: value must be an object');
      return;
    }

    if (app.graph) {
      this.getInfoOnGraph().then((p) => {
        this.setInfoOnGraph(Object.assign(p.workflow.extra.info, value));
      });
    }
  };

  getInfoOnGraph = () => {
    return app.graphToPrompt();
  };

  // just the name of project
  updateProjectName = (value) => {
    const ctools = document.getElementById(this.htmlIdCrystoolsInputContainer);
    // validation because this run before setup
    if (ctools && this.inputRefProjectNameText) {
      this.getInfoOnGraph().then((p) => {
        if (!p.workflow.extra.info) {
          p.workflow.extra.info = {};
        }
        const finalValue = Object.assign(p.workflow.extra.info, {name: value});
        // console.log(finalValue);
        this.setInfoOnGraph(finalValue);
      });
    }
  };

  saveFunctionOldHandler = (event) => {
    this.updateInfoOnGraph({modified: new Date().toISOString()});
    this.originalSaveEventsRef && this.originalSaveEventsRef(event);
  };

  saveFunctionNewHandler = async() => {
    this.updateInfoOnGraph({modified: new Date().toISOString()});
    let filename = this.inputRefProjectNameText.value + '.json';
    const promptFilename = app.ui.settings.getSettingValue('Comfy.PromptFilename', true);


    // literally copied and pasted from comfy ui.js ... https://github.com/comfyanonymous/ComfyUI/blob/master/web/scripts/ui.js#L710C10-L710C10

    // ¯\_(ツ)_/¯
    if (promptFilename) {
      filename = prompt('Save workflow as:', filename);
      if (!filename) {
        return;
      }
      if (!filename.toLowerCase().endsWith('.json')) {
        filename += '.json';
      }
    }

    const p = await app.graphToPrompt();
    const json = JSON.stringify(p.workflow, null, 2); // convert the data to a JSON string
    const blob = new Blob([json], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = $el('a', {
      href: url,
      download: filename,
      style: {display: 'none'},
      parent: document.body,
    });
    a.click();
    setTimeout(function() {
      a.remove();
      window.URL.revokeObjectURL(url);
    }, 0);
  };

  saveFunctionSwitch = (newOne) => {
    // for ignore the first call
    if (this.originalSaveEventsRef === null) {
      return;
    }

    let handler = null;

    // remove all event listeners
    const clone = this.saveButtonRef.cloneNode(true);

    if (newOne) {
      handler = this.saveFunctionNewHandler;
    } else {
      handler = this.saveFunctionOldHandler;
    }

    handler && clone.addEventListener('click', handler);
    this.saveButtonRef.replaceWith(clone);
  };
}

const crystoolsSave = new CrystoolsSave();
app.registerExtension({
  name: crystoolsSave.idExtensionName,
  setup: crystoolsSave.setup.bind(crystoolsSave),
})
