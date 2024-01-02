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


const getInfoOnGraph = () => {
  return app.graphToPrompt();
};

// just persist the data on workflow reference
const saveInfoOnGraph = (values) => {
  // create the info object if not exists on workflow

  let name = values?.name || defaultProjectNameText;
  app.ui.settings.setSettingValue(idProjectNameText, name);
  values.name = name;

  let  author = values?.author || defaultAuthor;
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


const reimplementSaveButton = (event) => {
  if (originalSaveEventsRef === null) return;
  console.log('2');
  let saveButton = document.getElementById('comfy-save-button');

  // remove all event listeners
  const clone = saveButton.cloneNode(true);
  saveButton.replaceWith(clone);

  if(app.ui.settings.getSettingValue(idNewSave, defaultNewSave)) {
    console.log('el nuevo');
    // add new event listener
    clone.addEventListener('click', async(event) => {
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
    });
  } else {
    console.log('el viejo');
    clone.addEventListener('click', (event)=>{
      console.log('aaa', originalSaveEventsRef);
      originalSaveEventsRef && originalSaveEventsRef(event);
    });
  }

};

// new save button
app.ui.settings.addSetting({
  id: idNewSave,
  name: menuPrefix + 'Use new save button?',
  type: 'boolean',
  tooltip: 'This will replace the save button function and propose the name of project as filename!',
  defaultValue: defaultNewSave,
  onChange: reimplementSaveButton
});

const showProjectName = (value) => {
  const ctools = document.getElementById(htmlIdCrystoolsMenu);

  // validation because this run before setup
  if (ctools) {
    ctools.style.display = value ? 'block' : 'none';
  }
};

// check if the user want to show the project name on menu
app.ui.settings.addSetting({
  id: idProjectNameShow,
  name: menuPrefix + 'Show project name in menu',
  type: 'boolean',
  defaultValue: defaultProjectNameShow,
  onChange: showProjectName,
});

const updateProjectName = (value) => {
  const ctools = document.getElementById(htmlIdCrystoolsMenu);
  // validation because this run before setup
  if (ctools && inputRefProjectNameText) {
    getInfoOnGraph().then((p) => {
      if (!p.workflow.extra.info) {
        p.workflow.extra.info = {};
      }
      saveInfoOnGraph(Object.assign(p.workflow.extra.info, {name: value}));
    });
  }
};

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
  onChange: (value)=>{
    if(app.graph){
      getInfoOnGraph().then((p) => {
        saveInfoOnGraph(Object.assign(p.workflow.extra.info, {author: value}));
      });
    }
  },
});

// description
app.ui.settings.addSetting({
  id: idDescription,
  name: menuPrefix + 'Description',
  type: 'text',
  defaultValue: defaultDescription,
  onChange: (value)=>{
    if(app.graph){
      getInfoOnGraph().then((p) => {
        saveInfoOnGraph(Object.assign(p.workflow.extra.info, {description: value}));
      });
    }
  },
});

// version
app.ui.settings.addSetting({
  id: idVersion,
  name: menuPrefix + 'Version',
  type: 'text',
  defaultValue: defaultVersion,
  onChange: (value)=>{
    if(app.graph){
      getInfoOnGraph().then((p) => {
        saveInfoOnGraph(Object.assign(p.workflow.extra.info, {version: value}));
      });
    }
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

        saveInfoOnGraph(p.workflow.extra.info);
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
    console.log('1');
    let saveButton = document.getElementById('comfy-save-button');
    originalSaveEventsRef = saveButton.onclick;
    // setTimeout(()=>{
    // }, 3000);

    // events for the input to persist the data on workflow
    projectNameInput.addEventListener('keyup', (event) => {
      updateProjectName(event.target.value);
    });

    reimplementSaveButton();
  },
});
