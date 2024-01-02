import { app } from '../../../scripts/app.js';
import { $el } from '../../../scripts/ui.js';


// common variables
const idExtensionName = 'Crystools.save';
const idNewSave = 'Crystools.newSave';
const idProjectNameShow = 'Crystools.projectNameShow';
const idProjectNameText = 'Crystools.projectNameText';
const idAuthor = 'Crystools.author';
const idDescription = 'Crystools.description';
const idVersion = 'Crystools.version';

const defaultNewSave = true;
const defaultProjectNameShow = true;
const defaultProjectNameText = 'workflow';
const defaultAuthor = 'Crystools';
const defaultDescription = 'd';
const defaultVersion = '1';

const menuPrefix = '';
const htmlIdCrystoolsMenu = 'crystools-menu';


// references of htmls elements
let inputRefProjectNameText = null;
let originalSaveEventsRef = null;
let saveButtonRef = null;


const getInfoOnGraph = () => {
  return app.graphToPrompt();
};

// just persist the data on workflow reference
const setInfoOnGraph = (values) => {
  // create the info object if not exists on workflow

  let name = values?.name || defaultProjectNameText;
  app.ui.settings.setSettingValue(idProjectNameText, name);
  values.name = name;

  let author = values?.author || defaultAuthor;
  app.ui.settings.setSettingValue(idAuthor, author);
  values.author = author;

  let description = values?.description || defaultDescription;
  app.ui.settings.setSettingValue(idDescription, description);
  values.description = description;

  let version = values?.version || defaultVersion;
  app.ui.settings.setSettingValue(idVersion, version);
  values.version = version;

  if (!(values?.created)) {
    values.created = new Date().toISOString();
  }

  inputRefProjectNameText.value = values.name;
  values.modified = new Date().toISOString();
  values.software = 'ComfyUI';
};

// just the name of project
const updateProjectName = (value) => {
  const ctools = document.getElementById(htmlIdCrystoolsMenu);
  // validation because this run before setup
  if (ctools && inputRefProjectNameText) {
    getInfoOnGraph().then((p) => {
      if (!p.workflow.extra.info) {
        p.workflow.extra.info = {};
      }
      setInfoOnGraph(Object.assign(p.workflow.extra.info, {name: value}));
    });
  }
};

// remember to send `{ property: value }`
const updateInfoOnGraph = (value) => {
  if (typeof value !== 'object') {
    console.warn('updateInfoOnGraph: value must be an object');
    return;
  }

  if (app.graph) {
    getInfoOnGraph().then((p) => {
      setInfoOnGraph(Object.assign(p.workflow.extra.info, value));
    });
  }
};

const showProjectName = (value) => {
  const ctools = document.getElementById(htmlIdCrystoolsMenu);

  // validation because this run before setup
  if (ctools) {
    ctools.style.display = value ? 'block' : 'none';
  }
};

const saveFunctionOldHandler = (event) => {
  originalSaveEventsRef && originalSaveEventsRef(event);
};

const saveFunctionNewHandler = async() => {
  let filename = inputRefProjectNameText.value + '.json';
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

const saveFunctionSwitch = (newOne) => {
  // for ignore the first call
  if (originalSaveEventsRef === null) {
    return;
  }

  let handler = null;

  // remove all event listeners
  const clone = saveButtonRef.cloneNode(true);

  if (newOne) {
    handler = saveFunctionNewHandler;
  } else {
    handler = saveFunctionOldHandler;
  }

  handler && clone.addEventListener('click', handler, true);
  saveButtonRef.replaceWith(clone);
};

/** Form on settings: (the order is important) */

// use new save button
app.ui.settings.addSetting({
  id: idNewSave,
  name: menuPrefix + 'Use new save button? (requires page reload)',
  type: 'boolean',
  tooltip: 'This will replace the save button function and propose the name of project as filename!',
  defaultValue: defaultNewSave,
  onChange: saveFunctionSwitch,
});

// show the input on menu
app.ui.settings.addSetting({
  id: idProjectNameShow,
  name: menuPrefix + 'Show project name in menu',
  type: 'boolean',
  defaultValue: defaultProjectNameShow,
  onChange: showProjectName,
});


// project name
app.ui.settings.addSetting({
  id: idProjectNameText,
  name: menuPrefix + 'Project name',
  type: 'text',
  defaultValue: defaultProjectNameText,
  onChange: updateProjectName,
});

// author
app.ui.settings.addSetting({
  id: idAuthor,
  name: menuPrefix + 'Author',
  type: 'text',
  defaultValue: defaultAuthor,
  onChange: (value) => {
    updateInfoOnGraph({author: value});
  },
});

// description
app.ui.settings.addSetting({
  id: idDescription,
  name: menuPrefix + 'Description',
  type: 'text',
  defaultValue: defaultDescription,
  onChange: (value) => {
    updateInfoOnGraph({description: value});
  },
});


// version
app.ui.settings.addSetting({
  id: idVersion,
  name: menuPrefix + 'Version',
  type: 'text',
  defaultValue: defaultVersion,
  onChange: (value) => {
    updateInfoOnGraph({version: value});
  },
});


app.registerExtension({
  name: idExtensionName,
  async setup() {

    app.graph.onConfigure = (a) => {
      // on drops a file on the canvas
      getInfoOnGraph().then((p) => {

        if (!p.workflow.extra.info) {
          p.workflow.extra.info = {};
        }

        setInfoOnGraph(p.workflow.extra.info);
      });
    };

    const queueBtn = document.getElementById('queue-button');

    const ctools = document.createElement('div');
    ctools.setAttribute('id', htmlIdCrystoolsMenu);
    ctools.classList.add(htmlIdCrystoolsMenu);
    ctools.classList.add('comfy-menu-btns');
    ctools.style.margin = '8px 0';
    ctools.style.width = '100%';
    queueBtn.insertAdjacentElement('afterend', ctools);

    const projectNameInput = document.createElement('input');
    projectNameInput.setAttribute('placeholder', 'Project name');
    projectNameInput.style.width = '80%';
    inputRefProjectNameText = projectNameInput;
    ctools.append(projectNameInput);

    // this boolean does not save the value on workflow
    showProjectName(app.ui.settings.getSettingValue(idProjectNameShow, defaultProjectNameShow));

    // this text save the value on workflow and localstorage
    updateProjectName(app.ui.settings.getSettingValue(idProjectNameText, defaultProjectNameText));

    // events for the input to persist the data on workflow
    projectNameInput.addEventListener('keyup', (event) => {
      updateProjectName(event.target.value);
    });

    // save the original save button event
    saveButtonRef = document.getElementById('comfy-save-button');
    originalSaveEventsRef = saveButtonRef.onclick;
    saveFunctionSwitch(app.ui.settings.getSettingValue(idNewSave, defaultNewSave));
  },
});
